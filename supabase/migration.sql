-- Extensions
create extension if not exists vector;
create extension if not exists "uuid-ossp";

-- Profiles (linked to auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz default now()
);

-- Workspaces
create table workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now()
);

-- Workspace members (for future multi-user)
create table workspace_members (
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text default 'member',
  primary key (workspace_id, user_id)
);

-- Documents (metadata)
create table documents (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  filename text not null,
  file_size integer,
  mime_type text,
  content_hash text not null, -- SHA-256 for idempotent re-upload
  chunk_count integer default 0,
  uploaded_by uuid references profiles(id),
  created_at timestamptz default now(),
  unique(workspace_id, content_hash) -- Prevent duplicate uploads
);

-- ★ THE SHARED VECTOR STORE ★
-- Single table for ALL workspaces. Isolation via workspace_id filter.
create table document_chunks (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references documents(id) on delete cascade,
  workspace_id uuid not null, -- Denormalized for fast filtered vector search
  chunk_index integer not null,
  content text not null,
  embedding vector(768), -- gemini-embedding-001 at 768 dims
  metadata jsonb default '{}', -- page number, section title, etc.
  created_at timestamptz default now()
);

-- Index for vector similarity search scoped by workspace
create index idx_chunks_workspace on document_chunks(workspace_id);
create index idx_chunks_embedding on document_chunks 
  using hnsw (embedding vector_cosine_ops);

-- Chat messages
create table chat_messages (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references profiles(id),
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  citations jsonb default '[]', -- [{doc_id, doc_name, chunk_content, similarity}]
  metadata jsonb default '{}', -- token counts, latency, etc.
  created_at timestamptz default now()
);

-- Tool call log
create table tool_calls (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  chat_message_id uuid references chat_messages(id),
  tool_name text not null,
  arguments jsonb not null,
  result jsonb,
  status text not null check (status in ('pending', 'success', 'error')),
  error_message text,
  executed_at timestamptz default now()
);

-- Tasks (created by save_task tool)
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  description text,
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text default 'todo' check (status in ('todo', 'in_progress', 'done')),
  created_by_tool boolean default true,
  created_at timestamptz default now()
);

-- RLS Policies
alter table profiles enable row level security;
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table documents enable row level security;
alter table document_chunks enable row level security;
alter table chat_messages enable row level security;
alter table tool_calls enable row level security;
alter table tasks enable row level security;

-- Profiles: users can read/update own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Workspaces: owners and members can access
create policy "Users can view their workspaces" on workspaces for select
  using (owner_id = auth.uid() or id in (
    select workspace_id from workspace_members where user_id = auth.uid()
  ));
create policy "Users can create workspaces" on workspaces for insert with check (owner_id = auth.uid());
create policy "Owners can update workspaces" on workspaces for update using (owner_id = auth.uid());
create policy "Owners can delete workspaces" on workspaces for delete using (owner_id = auth.uid());

-- Documents: workspace members can access
create policy "Workspace members can view documents" on documents for select
  using (workspace_id in (
    select id from workspaces where owner_id = auth.uid()
    union select workspace_id from workspace_members where user_id = auth.uid()
  ));
create policy "Workspace members can upload documents" on documents for insert
  with check (workspace_id in (
    select id from workspaces where owner_id = auth.uid()
    union select workspace_id from workspace_members where user_id = auth.uid()
  ));
create policy "Workspace members can delete documents" on documents for delete
  using (workspace_id in (
    select id from workspaces where owner_id = auth.uid()
    union select workspace_id from workspace_members where user_id = auth.uid()
  ));

-- Chunks: scoped to workspace (critical isolation)
create policy "Chunks scoped to user workspaces" on document_chunks for select
  using (workspace_id in (
    select id from workspaces where owner_id = auth.uid()
    union select workspace_id from workspace_members where user_id = auth.uid()
  ));
create policy "Insert chunks for own workspaces" on document_chunks for insert
  with check (workspace_id in (
    select id from workspaces where owner_id = auth.uid()
    union select workspace_id from workspace_members where user_id = auth.uid()
  ));

-- Chat messages: workspace scoped
create policy "Chat messages workspace scoped" on chat_messages for select
  using (workspace_id in (
    select id from workspaces where owner_id = auth.uid()
    union select workspace_id from workspace_members where user_id = auth.uid()
  ));
create policy "Users can insert chat messages" on chat_messages for insert
  with check (user_id = auth.uid());

-- Tool calls: workspace scoped
create policy "Tool calls workspace scoped" on tool_calls for select
  using (workspace_id in (
    select id from workspaces where owner_id = auth.uid()
    union select workspace_id from workspace_members where user_id = auth.uid()
  ));
create policy "Insert tool calls" on tool_calls for insert
  with check (workspace_id in (
    select id from workspaces where owner_id = auth.uid()
    union select workspace_id from workspace_members where user_id = auth.uid()
  ));

-- Tasks: workspace scoped
create policy "Tasks workspace scoped" on tasks for select
  using (workspace_id in (
    select id from workspaces where owner_id = auth.uid()
    union select workspace_id from workspace_members where user_id = auth.uid()
  ));
create policy "Insert tasks" on tasks for insert
  with check (workspace_id in (
    select id from workspaces where owner_id = auth.uid()
    union select workspace_id from workspace_members where user_id = auth.uid()
  ));
create policy "Update tasks" on tasks for update
  using (workspace_id in (
    select id from workspaces where owner_id = auth.uid()
    union select workspace_id from workspace_members where user_id = auth.uid()
  ));

-- Function for vector similarity search with workspace isolation
create or replace function match_chunks(
  query_embedding vector(768),
  target_workspace_id uuid,
  match_threshold float default 0.5,
  match_count int default 5
)
returns table (
  id uuid,
  document_id uuid,
  chunk_index int,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
security definer -- bypasses RLS but we filter explicitly
set search_path = ''
as $$
begin
  return query
  select
    dc.id,
    dc.document_id,
    dc.chunk_index,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) as similarity
  from public.document_chunks dc
  where dc.workspace_id = target_workspace_id  -- ★ ISOLATION ENFORCED HERE ★
    and 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Trigger to auto-create profile on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
