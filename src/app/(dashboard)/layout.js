'use client';

import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-content">
          {children}
        </div>
      </main>

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background-color: var(--bg-base);
        }
        .dashboard-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .dashboard-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}
