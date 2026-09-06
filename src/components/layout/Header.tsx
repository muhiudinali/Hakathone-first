'use client';

import { usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectCurrentUser, selectCurrentWorkspace, selectCurrentProject,
  selectUnreadNotificationCount, selectIsOnline, selectSyncStatus,
  selectLastSyncedAt, selectUserNotifications,
} from '@/store/selectors';
import { toggleCommandPalette, setSidebarMobileOpen, setLastSynced, setCreateTaskOpen } from '@/store/slices/uiSlice';
import { markAsRead, markAllAsRead } from '@/store/slices/notificationSlice';
import { undo, redo } from '@/store/slices/taskSlice';
import { Avatar, IconButton, Badge, Dropdown, DropdownItem, DropdownSeparator, Button } from '@/components/ui';
import { Search, Command, Bell, Menu, Wifi, WifiOff, RefreshCw, Undo2, Redo2, Plus } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export default function Header() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const currentUser = useAppSelector(selectCurrentUser);
  const workspace = useAppSelector(selectCurrentWorkspace);
  const project = useAppSelector(selectCurrentProject);
  const unreadCount = useAppSelector(selectUnreadNotificationCount);
  const isOnline = useAppSelector(selectIsOnline);
  const syncStatus = useAppSelector(selectSyncStatus);
  const lastSynced = useAppSelector(selectLastSyncedAt);
  const notifications = useAppSelector(selectUserNotifications);
  const historyIndex = useAppSelector(s => s.tasks.historyIndex);
  const historyLength = useAppSelector(s => s.tasks.history.length);
  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < historyLength - 1;

  // Build breadcrumb
  const breadcrumbs: { label: string; path?: string }[] = [];
  if (workspace) breadcrumbs.push({ label: workspace.name });
  if (pathname.includes('/projects/') && project) breadcrumbs.push({ label: project.name });
  if (pathname === '/dashboard') breadcrumbs.push({ label: 'Dashboard' });
  if (pathname === '/my-tasks') breadcrumbs.push({ label: 'My Tasks' });
  if (pathname === '/activity') breadcrumbs.push({ label: 'Activity' });
  if (pathname === '/settings') breadcrumbs.push({ label: 'Settings' });
  if (pathname === '/profile') breadcrumbs.push({ label: 'Profile' });

  const handleSync = () => {
    dispatch(setLastSynced());
  };

  return (
    <header className="flex-shrink-0 border-b border-border-primary bg-bg-secondary/95 backdrop-blur-md z-20 flex flex-col">
      <div className="google-bar" />
      <div className="h-14 flex items-center px-4 gap-3">
        {/* Mobile menu button */}
        <IconButton
          className="lg:hidden"
          onClick={() => dispatch(setSidebarMobileOpen(true))}
          tooltip="Menu"
        >
          <Menu size={20} />
        </IconButton>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-body-sm min-w-0 flex-1 overflow-hidden font-medium">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && <span className="text-text-tertiary flex-shrink-0">/</span>}
              <span className={`truncate max-w-[120px] sm:max-w-none ${i === breadcrumbs.length - 1 ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                {b.label}
              </span>
            </span>
          ))}
        </div>

        {/* Google Workspace Search Pill */}
        <button
          onClick={() => dispatch(toggleCommandPalette())}
          className="hidden sm:flex items-center gap-2.5 h-9 px-4 bg-bg-tertiary hover:bg-[#E8EAED] dark:hover:bg-[#3C4043] rounded-full text-body-sm text-text-secondary hover:text-text-primary transition-all cursor-pointer border border-border-primary/60 hover:border-border-primary w-48 md:w-72 lg:w-96 group shadow-2xs"
          title="Search in workspace (⌘K)"
        >
          <Search size={15} className="text-text-tertiary group-hover:text-accent-primary transition-colors flex-shrink-0" />
          <span className="truncate">Search tasks, projects...</span>
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white dark:bg-[#202124] border border-border-primary text-text-tertiary ml-auto shadow-2xs flex-shrink-0">⌘K</kbd>
        </button>

        {/* Online/Offline Status */}
        <div className="hidden sm:flex items-center gap-1.5">
          {isOnline ? (
            <div className="flex items-center gap-1.5 text-caption font-medium bg-[#E6F4EA] dark:bg-[#137333]/25 text-[#137333] dark:text-[#81C995] px-2.5 py-0.5 rounded-full border border-[#CEEAD6] dark:border-transparent shadow-2xs">
              <div className="h-1.5 w-1.5 rounded-full bg-[#34A853] animate-pulse" />
              <span>Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-caption font-medium bg-[#FEF7E0] dark:bg-[#B06000]/25 text-[#B06000] dark:text-[#FDD663] px-2.5 py-0.5 rounded-full border border-[#FEEFC3] dark:border-transparent shadow-2xs">
              <WifiOff size={12} />
              <span>Offline</span>
            </div>
          )}
        </div>

        {/* Sync Status */}
        <button
          onClick={handleSync}
          className="hidden lg:flex items-center gap-1 text-caption text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
          title={lastSynced ? `Last synced ${formatRelativeTime(lastSynced)}` : 'Click to sync'}
        >
          <RefreshCw size={12} className={syncStatus === 'pending' ? 'animate-spin' : ''} />
          <span>{syncStatus === 'pending' ? 'Syncing...' : lastSynced ? formatRelativeTime(lastSynced) : 'Sync'}</span>
        </button>

        {/* Undo / Redo */}
        <div className="hidden md:flex items-center gap-0.5">
          <IconButton
            size="sm"
            variant="ghost"
            disabled={!canUndo}
            onClick={() => dispatch(undo())}
            tooltip="Undo (⌘Z)"
          >
            <Undo2 size={16} />
          </IconButton>
          <IconButton
            size="sm"
            variant="ghost"
            disabled={!canRedo}
            onClick={() => dispatch(redo())}
            tooltip="Redo (⌘Y)"
          >
            <Redo2 size={16} />
          </IconButton>
        </div>

        {/* Quick New Task Google Pill Button */}
        <Button
          size="sm"
          variant="primary"
          icon={<Plus size={16} className="stroke-[2.5]" />}
          onClick={() => dispatch(setCreateTaskOpen(true))}
          className="rounded-full font-medium shadow-sm hover:shadow-md px-4 ml-1 active:scale-95 transition-all"
        >
          <span className="hidden sm:inline">New Task</span>
        </Button>

      {/* Notifications */}
      <Dropdown
        trigger={
          <div className="relative">
            <IconButton tooltip="Notifications">
              <Bell size={18} />
            </IconButton>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        }
        align="right"
      >
        <div className="w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border-primary">
            <span className="text-body-sm font-semibold text-text-primary">Notifications</span>
            {unreadCount > 0 && currentUser && (
              <button
                onClick={() => dispatch(markAllAsRead(currentUser.id))}
                className="text-caption text-text-link hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="px-3 py-8 text-center text-body-sm text-text-tertiary">
              No notifications
            </div>
          ) : (
            notifications.slice(0, 10).map(n => (
              <button
                key={n.id}
                onClick={() => dispatch(markAsRead(n.id))}
                className={`w-full text-left px-3 py-2.5 hover:bg-bg-hover transition-colors cursor-pointer border-b border-border-secondary last:border-0 ${!n.read ? 'bg-info/5' : ''}`}
              >
                <div className="flex items-start gap-2">
                  {!n.read && <div className="h-2 w-2 rounded-full bg-info flex-shrink-0 mt-1.5" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm font-medium text-text-primary">{n.title}</p>
                    <p className="text-caption text-text-secondary mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-caption text-text-tertiary mt-1">{formatRelativeTime(n.createdAt)}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </Dropdown>

        {/* User Avatar (mobile) */}
        <Avatar name={currentUser?.name || 'User'} size="sm" className="lg:hidden" />
      </div>
    </header>
  );
}
