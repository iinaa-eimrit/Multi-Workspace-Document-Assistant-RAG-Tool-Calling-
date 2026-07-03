'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { ToastProvider } from '@/components/ui/Toast';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
