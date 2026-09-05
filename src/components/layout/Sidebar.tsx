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
import { Avatar, Dropdown, DropdownItem, DropdownSeparator, IconButton } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Activity, Settings, LogOut,
  Plus, ChevronLeft, ChevronRight, ChevronsUpDown, User, Moon, Sun, Hash, X,
} from 'lucide-react';
import { setTheme } from '@/store/slices/settingsSlice';
import { switchUser } from '@/store/slices/authSlice';
import { DEMO_USERS } from '@/lib/mock-data/users';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'my-tasks', label: 'My Tasks', icon: CheckSquare, path: '/my-tasks' },
  { id: 'activity', label: 'Activity', icon: Activity, path: '/activity' },
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
    <div className="h-full flex flex-col bg-bg-secondary border-r border-border-primary">
      {/* Workspace Switcher */}
      <div className="h-14 px-3 flex items-center border-b border-border-primary">
        {!collapsed && (
          <Dropdown
            trigger={
              <button className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-bg-hover transition-colors cursor-pointer min-w-0">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: currentWorkspace?.color || '#3B82F6' }}>
                  <span className="text-white">{currentWorkspace?.icon || '🏢'}</span>
                </div>
                <span className="text-body-sm font-semibold text-text-primary truncate">{currentWorkspace?.name || 'Workspace'}</span>
                <ChevronsUpDown size={14} className="text-text-tertiary flex-shrink-0" />
              </button>
            }
          >
            <div className="px-2 py-1.5 text-overline text-text-tertiary">Workspaces</div>
            {workspaces.map(ws => (
              <DropdownItem key={ws.id} onClick={() => handleSwitchWorkspace(ws.id)}>
                <span className="mr-1.5">{ws.icon}</span> {ws.name}
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
        )}
        {collapsed && currentWorkspace && (
          <div className="mx-auto h-8 w-8 rounded-lg flex items-center justify-center text-sm cursor-pointer hover:bg-bg-hover" style={{ backgroundColor: currentWorkspace.color }}>
            <span className="text-white">{currentWorkspace.icon}</span>
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

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {/* Quick New Task Button */}
        <div className="pb-2">
          <button
            onClick={() => dispatch(setCreateTaskOpen(true))}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 bg-accent-primary hover:bg-accent-hover text-white rounded-lg text-body-sm font-medium shadow-sm transition-all cursor-pointer',
              collapsed && 'justify-center px-0 h-9 w-9 mx-auto'
            )}
            title="Create New Task (C)"
          >
            <Plus size={16} className="flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="truncate">New Task</span>
                <kbd className="ml-auto text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white/90">C</kbd>
              </>
            )}
          </button>
        </div>

        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-body-sm font-medium transition-colors duration-100 cursor-pointer',
                isActive ? 'bg-bg-active text-text-primary' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
                collapsed && 'justify-center px-0',
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && item.label}
            </button>
          );
        })}

        {/* Projects Section */}
        {!collapsed && (
          <div className="pt-4">
            <div className="flex items-center justify-between px-2.5 mb-1">
              <span className="text-overline text-text-tertiary">Projects</span>
              <IconButton size="sm" tooltip="New project" onClick={() => dispatch(setCreateProjectOpen(true))}>
                <Plus size={14} />
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
                    'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-body-sm transition-colors duration-100 cursor-pointer',
                    isActive ? 'bg-bg-active text-text-primary font-medium' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
                  )}
                >
                  <span className="flex-shrink-0">{proj.icon}</span>
                  <span className="truncate">{proj.name}</span>
                </button>
              );
            })}
            {projects.length === 0 && (
              <p className="px-2.5 py-2 text-caption text-text-tertiary">No projects yet</p>
            )}
          </div>
        )}

        {collapsed && projects.length > 0 && (
          <div className="pt-4 space-y-1">
            {projects.slice(0, 5).map(proj => (
              <button
                key={proj.id}
                onClick={() => {
                  dispatch(setCurrentProject(proj.id));
                  navigate(`/workspaces/${currentWorkspace?.id}/projects/${proj.id}`);
                }}
                className="w-full flex items-center justify-center py-1.5 rounded-lg hover:bg-bg-hover transition-colors cursor-pointer"
                title={proj.name}
              >
                <span className="text-sm">{proj.icon}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-border-primary p-2 space-y-1">
        <button
          onClick={() => navigate('/settings')}
          className={cn(
            'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-body-sm text-text-secondary hover:bg-bg-hover transition-colors cursor-pointer',
            collapsed && 'justify-center px-0',
          )}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={18} />
          {!collapsed && 'Settings'}
        </button>

        {/* User Profile */}
        {!collapsed && currentUser && (
          <Dropdown
            trigger={
              <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-bg-hover transition-colors cursor-pointer">
                <Avatar name={currentUser.name} size="sm" />
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-body-sm font-medium text-text-primary truncate">{currentUser.name}</div>
                  <div className="text-caption text-text-tertiary truncate">{currentUser.email}</div>
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
      {/* Desktop Sidebar */}
      <div
        className={cn(
          'hidden lg:block flex-shrink-0 transition-all duration-200',
          collapsed ? 'w-16' : 'w-[260px]',
        )}
      >
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-bg-overlay backdrop-blur-xs animate-fade-in" onClick={() => dispatch(setSidebarMobileOpen(false))} />
          <div className="relative w-[280px] max-w-[85vw] h-full shadow-2xl animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
