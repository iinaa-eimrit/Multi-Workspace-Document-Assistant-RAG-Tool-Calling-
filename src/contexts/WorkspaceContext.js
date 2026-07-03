'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setWorkspaces(data);
      if (data.length > 0) {
        setActiveWorkspace((currentActive) => {
          if (!currentActive || !data.find((w) => w.id === currentActive.id)) {
            return data[0];
          }
          return currentActive;
        });
      } else {
        setActiveWorkspace(null);
      }
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    } else {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setLoading(false);
    }
  }, [user, fetchWorkspaces]);

  const switchWorkspace = (workspaceId) => {
    const ws = workspaces.find((w) => w.id === workspaceId);
    if (ws) {
      setActiveWorkspace(ws);
    }
  };

  const createWorkspace = async (name) => {
    const { data, error } = await supabase
      .from('workspaces')
      .insert([{ name, owner_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      setWorkspaces((prev) => [data, ...prev]);
      setActiveWorkspace(data);
    }
    return { data, error };
  };

  const deleteWorkspace = async (workspaceId) => {
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspaceId);

    if (!error) {
      setWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId));
      setActiveWorkspace((currentActive) => {
        if (currentActive?.id === workspaceId) {
          // Returning null for now, fetchWorkspaces (called next) will pick a new one
          return null; 
        }
        return currentActive;
      });
      fetchWorkspaces();
    }
    return { error };
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        loading,
        switchWorkspace,
        createWorkspace,
        deleteWorkspace,
        fetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);
