'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/selectors';
import ThemeProvider from '@/providers/ThemeProvider';
import { ToastProvider } from '@/components/ui';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import CommandPalette from '@/components/CommandPalette';
import CreateWorkspaceModal from '@/components/features/CreateWorkspaceModal';
import CreateProjectModal from '@/components/features/CreateProjectModal';
import CreateTaskModal from '@/components/features/CreateTaskModal';
import InviteMemberModal from '@/components/features/InviteMemberModal';
import TaskDetailDrawer from '@/components/features/TaskDetailDrawer';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useSimulatedRealtime } from '@/hooks/useSimulatedRealtime';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const router = useRouter();

  useKeyboardShortcuts();
  useOnlineStatus();
  useSimulatedRealtime();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="h-screen flex overflow-hidden bg-bg-primary">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
        <CommandPalette />
        <CreateWorkspaceModal />
        <CreateProjectModal />
        <CreateTaskModal />
        <InviteMemberModal />
        <TaskDetailDrawer />
      </ToastProvider>
    </ThemeProvider>
  );
}
