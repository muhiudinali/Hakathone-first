'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectCurrentUser, selectCurrentWorkspace, selectWorkspaceList,
  selectWorkspaceProjects, selectSidebarCollapsed, selectSidebarMobileOpen,
} from '@/store/selectors';
import { toggleSidebar } from '@/store/slices/settingsSlice';
import { setCurrentWorkspace } from '@/store/slices/workspaceSlice';
import { setCurrentProject } from '@/store/slices/projectSlice';
import { logout } from '@/store/slices/authSlice';
import { setSidebarMobileOpen, setCreateProjectOpen, setCreateWorkspaceOpen, setCreateTaskOpen } from '@/store/slices/uiSlice';
import { Avatar, Dropdown, DropdownItem, DropdownSeparator, IconButton, DynamicIcon } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  Home, FolderKanban, CheckSquare, Activity, Settings, LogOut,
  Plus, ChevronLeft, ChevronRight, ChevronsUpDown, User, Moon, Sun, X,
  Bell, Table2,
} from 'lucide-react';
import { setTheme } from '@/store/slices/settingsSlice';
import { switchUser } from '@/store/slices/authSlice';
import { DEMO_USERS } from '@/lib/mock-data/users';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  { id: 'my-tasks', label: 'Tables', icon: Table2, path: '/my-tasks' },
  { id: 'activity', label: 'Notifications', icon: Bell, path: '/activity' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const currentWorkspace = useAppSelector(selectCurrentWorkspace);
  const workspaces = useAppSelector(selectWorkspaceList);
  const projects = useAppSelector(selectWorkspaceProjects);
  const collapsed = useAppSelector(selectSidebarCollapsed);
  const mobileOpen = useAppSelector(selectSidebarMobileOpen);
  const theme = useAppSelector(s => s.settings.theme);

  const navigate = (path: string) => {
    router.push(path);
    dispatch(setSidebarMobileOpen(false));
  };

  const handleSwitchWorkspace = (wsId: string) => {
    dispatch(setCurrentWorkspace(wsId));
    dispatch(setCurrentProject(null));
    navigate('/dashboard');
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-transparent">
      {/* Workspace Switcher Header */}
      <div className="h-14 px-3 flex items-center border-b border-border-primary/80 relative z-30">
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <Dropdown
              trigger={
                <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer min-w-0 border border-transparent hover:border-border-primary/60 text-left">
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 shadow-xs" style={{ backgroundColor: currentWorkspace?.color || '#3B82F6' }}>
                    <DynamicIcon icon={currentWorkspace?.icon || 'building'} size={16} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-body-sm font-bold text-text-primary truncate block leading-tight">{currentWorkspace?.name || 'Workspace'}</span>
                    <span className="text-[11px] text-text-tertiary truncate block">Main Space</span>
                  </div>
                  <ChevronsUpDown size={14} className="text-text-tertiary flex-shrink-0 ml-1" />
                </button>
              }
            >
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Workspaces</div>
              {workspaces.map(ws => (
                <DropdownItem key={ws.id} onClick={() => handleSwitchWorkspace(ws.id)}>
                  <div className="h-5 w-5 rounded-md flex items-center justify-center flex-shrink-0 mr-2 shadow-2xs" style={{ backgroundColor: ws.color }}>
                    <DynamicIcon icon={ws.icon || 'building'} size={12} className="text-white" />
                  </div>
                  <span className="truncate">{ws.name}</span>
                </DropdownItem>
              ))}
              <DropdownSeparator />
              <DropdownItem icon={<Plus size={14} />} onClick={() => dispatch(setCreateWorkspaceOpen(true))}>
                Create workspace
              </DropdownItem>
              {currentWorkspace && (
                <DropdownItem icon={<Settings size={14} />} onClick={() => navigate(`/workspaces/${currentWorkspace.id}/settings`)}>
                  Workspace settings
                </DropdownItem>
              )}
            </Dropdown>
          </div>
        )}
        {collapsed && currentWorkspace && (
          <div className="mx-auto h-9 w-9 rounded-xl flex items-center justify-center text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs" style={{ backgroundColor: currentWorkspace.color }}>
            <DynamicIcon icon={currentWorkspace.icon || 'building'} size={17} className="text-white" />
          </div>
        )}
        <IconButton
          onClick={() => dispatch(toggleSidebar())}
          tooltip={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex ml-auto flex-shrink-0"
          size="sm"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </IconButton>
        <IconButton
          onClick={() => dispatch(setSidebarMobileOpen(false))}
          tooltip="Close"
          className="lg:hidden ml-auto"
          size="sm"
        >
          <X size={16} />
        </IconButton>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {/* Quick New Task Button */}
        <div className="pb-3">
          <button
            onClick={() => dispatch(setCreateTaskOpen(true))}
            className={cn(
              'w-full flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-body-sm font-semibold shadow-md shadow-slate-900/15 hover:shadow-lg transition-all cursor-pointer active:scale-95',
              collapsed && 'justify-center px-0 h-10 w-10 mx-auto'
            )}
            title="Create New Task (C)"
          >
            <Plus size={16} className="flex-shrink-0 stroke-[2.5]" />
            {!collapsed && (
              <>
                <span className="truncate">New Task</span>
                <kbd className="ml-auto text-[10px] bg-white/20 dark:bg-black/10 border border-white/25 dark:border-black/15 px-1.5 py-0.5 rounded text-white dark:text-slate-900 font-bold">C</kbd>
              </>
            )}
          </button>
        </div>

        {/* Navigation Items (Soft UI Style with Dark Active Capsule) */}
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer text-left',
                isActive
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md shadow-slate-900/20 font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800/60',
                collapsed && 'justify-center px-0 h-10 w-10 mx-auto',
              )}
              title={collapsed ? item.label : undefined}
            >
              <div
                className={cn(
                  'h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                  isActive
                    ? 'bg-white/15 dark:bg-slate-900/10 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-text-tertiary',
                  collapsed && 'h-8 w-8',
                )}
              >
                <item.icon size={15} />
              </div>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* Projects Section */}
        {!collapsed && (
          <div className="pt-4">
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Projects</span>
              <IconButton size="sm" tooltip="New project" onClick={() => dispatch(setCreateProjectOpen(true))}>
                <Plus size={13} />
              </IconButton>
            </div>
            {projects.map(proj => {
              const isActive = pathname.includes(proj.id);
              return (
                <button
                  key={proj.id}
                  onClick={() => {
                    dispatch(setCurrentProject(proj.id));
                    navigate(`/workspaces/${currentWorkspace?.id}/projects/${proj.id}`);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-body-sm transition-all duration-100 cursor-pointer text-left',
                    isActive
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md shadow-slate-900/20 font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800/60',
                  )}
                >
                  <div
                    className={cn(
                      'h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 shadow-2xs border',
                      isActive ? 'bg-white/20 border-transparent text-white dark:text-slate-900' : ''
                    )}
                    style={isActive ? undefined : {
                      backgroundColor: `${proj.color}15`,
                      borderColor: `${proj.color}30`,
                      color: proj.color,
                    }}
                  >
                    <DynamicIcon icon={proj.icon || 'folder'} size={13} />
                  </div>
                  <span className="truncate">{proj.name}</span>
                </button>
              );
            })}
            {projects.length === 0 && (
              <p className="px-3 py-2 text-caption text-text-tertiary">No projects yet</p>
            )}
          </div>
        )}

        {collapsed && projects.length > 0 && (
          <div className="pt-3 space-y-1">
            {projects.slice(0, 5).map(proj => (
              <button
                key={proj.id}
                onClick={() => {
                  dispatch(setCurrentProject(proj.id));
                  navigate(`/workspaces/${currentWorkspace?.id}/projects/${proj.id}`);
                }}
                className="w-full flex items-center justify-center py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={proj.name}
              >
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center shadow-xs border"
                  style={{
                    backgroundColor: `${proj.color}15`,
                    borderColor: `${proj.color}30`,
                    color: proj.color,
                  }}
                >
                  <DynamicIcon icon={proj.icon || 'folder'} size={14} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section - AUTH PAGES & SETTINGS */}
      <div className="border-t border-border-primary/80 p-3 space-y-1.5">
        {!collapsed && (
          <div className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary px-2 pb-0.5">
            Auth & Settings
          </div>
        )}
        <button
          onClick={() => navigate('/settings')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left',
            pathname === '/settings'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-md'
              : 'text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800/60',
            collapsed && 'justify-center px-0',
          )}
          title={collapsed ? 'Settings' : undefined}
        >
          <div
            className={cn(
              'h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0',
              pathname === '/settings'
                ? 'bg-white/15 dark:bg-slate-900/10 text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-text-tertiary',
              collapsed && 'h-8 w-8',
            )}
          >
            <Settings size={15} />
          </div>
          {!collapsed && <span>Settings</span>}
        </button>

        {/* User Profile Capsule Dropdown */}
        {!collapsed && currentUser && (
          <Dropdown
            trigger={
              <button className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-left border border-border-primary/60">
                <Avatar name={currentUser.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-body-sm font-semibold text-text-primary truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-text-tertiary truncate">{currentUser.email}</div>
                </div>
              </button>
            }
          >
            <div className="px-3 py-2 border-b border-border-primary">
              <p className="text-body-sm font-medium text-text-primary">{currentUser.name}</p>
              <p className="text-caption text-text-tertiary">{currentUser.email}</p>
            </div>
            <DropdownItem icon={<User size={14} />} onClick={() => navigate('/profile')}>Profile</DropdownItem>
            <DropdownItem
              icon={theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              onClick={() => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))}
            >
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </DropdownItem>
            <DropdownSeparator />
            <div className="px-2 py-1 text-overline text-text-tertiary">Switch user</div>
            {DEMO_USERS.filter(u => u.id !== currentUser.id).map(u => (
              <DropdownItem key={u.id} onClick={() => dispatch(switchUser(u.id))}>
                <div className="flex items-center gap-2">
                  <Avatar name={u.name} size="xs" />
                  <span>{u.name}</span>
                </div>
              </DropdownItem>
            ))}
            <DropdownSeparator />
            <DropdownItem icon={<LogOut size={14} />} danger onClick={handleLogout}>Sign out</DropdownItem>
          </Dropdown>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Soft UI Elevated Card */}
      <aside
        className={cn(
          'hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 p-3 z-30',
          collapsed ? 'w-20' : 'w-[264px]',
        )}
      >
        <div className="h-full flex flex-col soft-card rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-black/40">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-bg-overlay backdrop-blur-xs animate-fade-in" onClick={() => dispatch(setSidebarMobileOpen(false))} />
          <div className="relative w-[280px] max-w-[85vw] h-full p-3 shadow-2xl animate-fade-in">
            <div className="h-full flex flex-col soft-card rounded-2xl overflow-hidden">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
