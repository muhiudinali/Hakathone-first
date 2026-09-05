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
    <header className="h-14 flex-shrink-0 border-b border-border-primary/80 glass-header flex items-center px-4 gap-3 z-20">
      {/* Mobile menu button */}
      <IconButton
        className="lg:hidden"
        onClick={() => dispatch(setSidebarMobileOpen(true))}
        tooltip="Menu"
      >
        <Menu size={20} />
      </IconButton>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-body-sm min-w-0 flex-1 overflow-hidden">
        {breadcrumbs.map((b, i) => (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <span className="text-text-tertiary flex-shrink-0">/</span>}
            <span className={`truncate max-w-[120px] sm:max-w-none ${i === breadcrumbs.length - 1 ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
              {b.label}
            </span>
          </span>
        ))}
      </div>

      {/* Online/Offline Status */}
      <div className="hidden sm:flex items-center gap-1.5">
        {isOnline ? (
          <div className="flex items-center gap-1.5 text-caption text-success font-medium bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span>Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-caption text-warning font-medium bg-warning/10 px-2 py-0.5 rounded-full border border-warning/20">
            <WifiOff size={12} />
            <span>Offline</span>
          </div>
        )}
      </div>

      {/* Sync Status */}
      <button
        onClick={handleSync}
        className="hidden sm:flex items-center gap-1 text-caption text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
        title={lastSynced ? `Last synced ${formatRelativeTime(lastSynced)}` : 'Click to sync'}
      >
        <RefreshCw size={12} className={syncStatus === 'pending' ? 'animate-spin' : ''} />
        <span>{syncStatus === 'pending' ? 'Syncing...' : lastSynced ? formatRelativeTime(lastSynced) : 'Sync'}</span>
      </button>

      {/* Search */}
      <button
        onClick={() => dispatch(toggleCommandPalette())}
        className="hidden sm:flex items-center gap-2 h-8 px-3 bg-bg-secondary/70 backdrop-blur-md rounded-lg text-body-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all cursor-pointer border border-border-primary/80 shadow-xs group"
      >
        <Search size={14} className="text-accent-primary group-hover:scale-110 transition-transform" />
        <span>Search...</span>
        <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary/80 border border-border-primary text-text-tertiary ml-3">⌘K</kbd>
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

      {/* Quick New Task Button */}
      <Button
        size="sm"
        variant="primary"
        icon={<Plus size={15} className="stroke-[2.5]" />}
        onClick={() => dispatch(setCreateTaskOpen(true))}
        className="font-semibold shadow-md shadow-accent-primary/25 hover:shadow-lg hover:shadow-accent-primary/35 ml-1 active:scale-95 transition-all"
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
    </header>
  );
}
