import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { retrieveRelevantChunks } from '@/lib/retrieval';

export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { query, workspaceId } = await req.json();
    if (!query || !workspaceId) {
      return NextResponse.json({ error: 'Query and workspaceId are required' }, { status: 400 });
    }

    // Retrieve chunks with a very low threshold so we can see what the vector search is matching
    const chunks = await retrieveRelevantChunks(query, workspaceId, 0.2, 10);
    
    return NextResponse.json({ chunks });
  } catch (error) {
    console.error('Retrieval debug API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
