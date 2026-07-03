'use client';

import React, { useState, useRef } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/components/ui/Toast';
import Spinner from '@/components/ui/Spinner';

export default function UploadZone({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { activeWorkspace } = useWorkspace();
  const { addToast } = useToast();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    if (!activeWorkspace) {
      addToast('Please select a workspace first', 'warning');
      return;
    }

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      addToast('File exceeds 5MB limit', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('workspaceId', activeWorkspace.id);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      addToast('Document uploaded and indexed successfully!', 'success');
      if (onUploadSuccess) onUploadSuccess(data.document);
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      className={`upload-zone glass-panel ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !uploading && fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleChange}
        style={{ display: 'none' }}
        accept=".pdf,.txt,.md,.csv"
      />
      
      <div className="upload-content">
        {uploading ? (
          <div className="uploading-state">
            <Spinner size="lg" />
            <p>Processing document... this may take a moment</p>
          </div>
        ) : (
          <>
            <div className="upload-icon">📄</div>
            <p>Drag and drop a document here</p>
            <p className="sub">Supports .pdf, .txt, .md, .csv (max 5MB)</p>
          </>
        )}
      </div>

      <style jsx>{`
        .upload-zone {
          border: 2px dashed var(--surface-border);
          padding: 3rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .upload-zone:hover:not(.uploading) {
          border-color: var(--accent);
          background: rgba(34, 211, 238, 0.05);
        }
        .upload-zone.dragging {
          border-color: var(--accent);
          background: rgba(34, 211, 238, 0.1);
          transform: scale(1.02);
        }
        .upload-zone.uploading {
          cursor: wait;
          border-style: solid;
        }
        .upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.8;
        }
        .uploading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .sub {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}
