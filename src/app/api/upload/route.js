import { NextResponse } from 'next/server';
import { ingestDocument } from '@/lib/ingestion';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60; // Allow more time for processing/embedding if on Vercel

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const workspaceId = formData.get('workspaceId');

    if (!file || !workspaceId) {
      return NextResponse.json({ error: 'File and workspaceId are required' }, { status: 400 });
    }

    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 5MB limit' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Process document: extract text, chunk, embed, and store
    const document = await ingestDocument(
      buffer,
      file.type,
      file.name,
      workspaceId,
      user.id,
      file.size
    );

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Document ingestion error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during document processing' },
      { status: 500 }
    );
  }
}
