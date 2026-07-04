'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function DocumentList({ refreshTrigger }) {
  const { activeWorkspace } = useWorkspace();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const supabase = createClient();

  const fetchDocuments = useCallback(async () => {
    if (!activeWorkspace) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('workspace_id', activeWorkspace.id)
      .order('created_at', { ascending: false });

    if (error) {
      addToast('Failed to load documents: ' + error.message, 'error');
    } else {
      setDocuments(data || []);
    }
    setLoading(false);
  }, [activeWorkspace, supabase, addToast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      addToast('Failed to delete document', 'error');
    } else {
      addToast('Document deleted', 'success');
      fetchDocuments();
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!activeWorkspace) {
    return <div className="doc-list-empty">Please select a workspace to view documents.</div>;
  }

  if (loading) {
    return <div className="doc-list-loading"><Spinner /></div>;
  }

  if (documents.length === 0) {
    return <div className="doc-list-empty glass-panel">No documents have been uploaded yet. Upload PDF, Markdown, or text files to begin building your workspace.</div>;
  }

  return (
    <div className="doc-list">
      {documents.map(doc => (
        <div key={doc.id} className="doc-item glass-panel">
          <div className="doc-info">
            <h4>{doc.filename}</h4>
            <span className="doc-meta">
              {formatBytes(doc.file_size)} • {doc.chunk_count} chunks • 
              Uploaded {new Date(doc.created_at).toLocaleDateString()}
            </span>
          </div>
          <Button variant="danger" size="sm" onClick={() => handleDelete(doc.id)}>
            Delete
          </Button>
        </div>
      ))}

      <style jsx>{`
        .doc-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .doc-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem;
        }
        .doc-info h4 {
          margin: 0 0 0.25rem 0;
          color: var(--text-primary);
        }
        .doc-meta {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .doc-list-empty {
          padding: 2rem;
          text-align: center;
          color: var(--text-muted);
        }
        .doc-list-loading {
          display: flex;
          justify-content: center;
          padding: 2rem;
        }
      `}</style>
    </div>
  );
}
