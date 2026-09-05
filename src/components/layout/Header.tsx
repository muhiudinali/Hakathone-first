'use client';

import { usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectCurrentUser, selectCurrentWorkspace, selectCurrentProject,
  selectUnreadNotificationCount, selectIsOnline, selectSyncStatus,
  selectLastSyncedAt, selectUserNotifications,
} from '@/store/selectors';
import { toggleCommandPalette, setSidebarMobileOpen, setLastSynced } from '@/store/slices/uiSlice';
import { markAsRead, markAllAsRead } from '@/store/slices/notificationSlice';
import { undo, redo } from '@/store/slices/taskSlice';
import { Avatar, IconButton, Badge, Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui';
import { Search, Command, Bell, Menu, Wifi, WifiOff, RefreshCw, Undo2, Redo2 } from 'lucide-react';
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
    <header className="h-14 flex-shrink-0 border-b border-border-primary bg-bg-secondary flex items-center px-4 gap-3">
      {/* Mobile menu button */}
      <IconButton
        className="lg:hidden"
        onClick={() => dispatch(setSidebarMobileOpen(true))}
        tooltip="Menu"
      >
        <Menu size={20} />
      </IconButton>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-body-sm min-w-0 flex-1">
        {breadcrumbs.map((b, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-text-tertiary">/</span>}
            <span className={i === breadcrumbs.length - 1 ? 'font-medium text-text-primary' : 'text-text-secondary'}>
              {b.label}
            </span>
          </span>
        ))}
      </div>

      {/* Online/Offline Status */}
      <div className="hidden sm:flex items-center gap-1.5">
        {isOnline ? (
          <div className="flex items-center gap-1 text-caption text-success">
            <div className="h-1.5 w-1.5 rounded-full bg-success" />
            <span>Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-caption text-warning">
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
        className="hidden sm:flex items-center gap-2 h-8 px-3 bg-bg-tertiary rounded-lg text-body-sm text-text-tertiary hover:bg-bg-hover transition-colors cursor-pointer border border-border-secondary"
      >
        <Search size={14} />
        <span>Search...</span>
        <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-bg-secondary border border-border-primary text-text-tertiary ml-4">⌘K</kbd>
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
