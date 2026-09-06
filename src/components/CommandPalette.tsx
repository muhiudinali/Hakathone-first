'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectCommandPaletteOpen, selectAllTasks, selectAllProjects,
  selectWorkspaceList, selectCurrentWorkspaceId,
} from '@/store/selectors';
import {
  setCommandPaletteOpen, setCreateTaskOpen, setCreateProjectOpen,
  setCreateWorkspaceOpen, setTaskDetailId,
} from '@/store/slices/uiSlice';
import { setCurrentWorkspace } from '@/store/slices/workspaceSlice';
import { setCurrentProject } from '@/store/slices/projectSlice';
import { setTheme } from '@/store/slices/settingsSlice';
import { cn, fuzzyMatch } from '@/lib/utils';
import {
  Search, LayoutDashboard, FolderKanban, CheckSquare, Settings,
  Plus, Sun, Moon, ArrowRight, Compass, Zap, Palette, Building2,
} from 'lucide-react';

function getCategoryIcon(cat: string) {
  switch (cat) {
    case 'Navigation': return <Compass size={13} className="text-accent-primary" />;
    case 'Actions': return <Zap size={13} className="text-amber-400" />;
    case 'Theme': return <Palette size={13} className="text-purple-400" />;
    case 'Workspaces': return <Building2 size={13} className="text-blue-400" />;
    case 'Projects': return <FolderKanban size={13} className="text-emerald-400" />;
    case 'Tasks': return <CheckSquare size={13} className="text-cyan-400" />;
    default: return null;
  }
}

interface Command {
  id: string;
  label: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

export default function CommandPalette() {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const open = useAppSelector(selectCommandPaletteOpen);
  const tasks = useAppSelector(selectAllTasks);
  const projects = useAppSelector(selectAllProjects);
  const workspaces = useAppSelector(selectWorkspaceList);
  const wsId = useAppSelector(selectCurrentWorkspaceId);
  const theme = useAppSelector(s => s.settings.theme);

  const close = () => {
    dispatch(setCommandPaletteOpen(false));
    setQuery('');
    setSelectedIndex(0);
  };

  const commands: Command[] = [
    // Navigation
    { id: 'nav-dashboard', label: 'Go to Dashboard', category: 'Navigation', icon: <LayoutDashboard size={16} />, action: () => { router.push('/dashboard'); close(); } },
    { id: 'nav-my-tasks', label: 'Go to My Tasks', category: 'Navigation', icon: <CheckSquare size={16} />, action: () => { router.push('/my-tasks'); close(); } },
    { id: 'nav-settings', label: 'Go to Settings', category: 'Navigation', icon: <Settings size={16} />, action: () => { router.push('/settings'); close(); } },
    // Actions
    { id: 'act-create-task', label: 'Create Task', category: 'Actions', icon: <Plus size={16} />, action: () => { dispatch(setCreateTaskOpen(true)); close(); }, keywords: ['new', 'add'] },
    { id: 'act-create-project', label: 'Create Project', category: 'Actions', icon: <Plus size={16} />, action: () => { dispatch(setCreateProjectOpen(true)); close(); }, keywords: ['new', 'add'] },
    { id: 'act-create-workspace', label: 'Create Workspace', category: 'Actions', icon: <Plus size={16} />, action: () => { dispatch(setCreateWorkspaceOpen(true)); close(); }, keywords: ['new', 'add'] },
    // Theme
    { id: 'theme-toggle', label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode', category: 'Theme', icon: theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />, action: () => { dispatch(setTheme(theme === 'dark' ? 'light' : 'dark')); close(); } },
  ];

  // Workspaces in command palette
  workspaces.forEach(w => {
    commands.push({
      id: `ws-${w.id}`,
      label: `Switch to ${w.name}`,
      category: 'Workspaces',
      icon: <span className="text-sm">{w.icon}</span>,
      action: () => {
        dispatch(setCurrentWorkspace(w.id));
        router.push('/dashboard');
        close();
      },
    });
  });

  // Projects in command palette
  Object.values(projects).forEach(p => {
    if (p.workspaceId === wsId) {
      commands.push({
        id: `proj-${p.id}`,
        label: `${p.icon} ${p.name}`,
        category: 'Projects',
        icon: <FolderKanban size={16} />,
        action: () => {
          dispatch(setCurrentProject(p.id));
          router.push(`/workspaces/${wsId}/projects/${p.id}`);
          close();
        },
      });
    }
  });

  // Filter commands
  const filteredCommands = query
    ? commands.filter(c => 
        fuzzyMatch(c.label, query) || 
        c.keywords?.some(k => fuzzyMatch(k, query)) ||
        fuzzyMatch(c.category, query)
      )
    : commands;

  // Task search results
  const taskCommands: Command[] = (query.length >= 2
    ? Object.values(tasks).filter(t => fuzzyMatch(t.title, query)).slice(0, 8)
    : []
  ).map(t => ({
    id: `task-${t.id}`,
    label: t.title,
    category: 'Tasks',
    icon: <CheckSquare size={16} />,
    action: () => {
      dispatch(setCurrentProject(t.projectId));
      dispatch(setTaskDetailId(t.id));
      if (wsId) {
        router.push(`/workspaces/${wsId}/projects/${t.projectId}`);
      }
      close();
    },
  }));

  const flatItems = [...filteredCommands, ...taskCommands];

  // Group by category
  const grouped = flatItems.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {} as Record<string, Command[]>);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      flatItems[selectedIndex]?.action();
    } else if (e.key === 'Escape') {
      close();
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(0);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      <div className="fixed inset-0 bg-black/45 dark:bg-black/70 backdrop-blur-sm animate-fade-in" onClick={close} />
      
      <div className="relative w-full max-w-xl bg-white dark:bg-[#202124] border border-border-primary rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="google-bar" />
        {/* Search Input */}
        <div className="flex items-center px-4 h-14 border-b border-border-primary gap-2">
          <Search size={19} className="text-accent-primary flex-shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tasks, projects, or actions..."
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            className="w-full h-full px-2 bg-transparent text-text-primary placeholder:text-text-tertiary text-body-md focus:outline-none focus:ring-0 outline-none border-none shadow-none"
            style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          />
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bg-tertiary border border-border-primary text-text-tertiary shadow-2xs flex-shrink-0">ESC</kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[380px] overflow-y-auto p-2.5">
          {flatItems.length === 0 ? (
            <div className="py-8 text-center text-body-sm text-text-tertiary">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mb-2 last:mb-0">
                <div className="px-2 py-1 text-overline text-text-tertiary font-medium flex items-center gap-1.5">
                  {getCategoryIcon(category)}
                  <span>{category}</span>
                </div>
                {items.map(item => {
                  const globalIdx = flatItems.indexOf(item);
                  const isSelected = globalIdx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-body-sm transition-colors text-left cursor-pointer',
                        isSelected
                          ? 'bg-[#E8F0FE] text-[#1967D2] dark:bg-[#3C4043] dark:text-[#8AB4F8] font-medium'
                          : 'text-text-primary hover:bg-[#F1F3F4] dark:hover:bg-[#303134]',
                      )}
                    >
                      <span className={isSelected ? 'text-[#1967D2] dark:text-[#8AB4F8]' : 'text-text-secondary'}>{item.icon}</span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {isSelected && <ArrowRight size={14} className="text-[#1967D2] dark:text-[#8AB4F8] flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-bg-tertiary border-t border-border-primary flex items-center justify-between text-caption text-text-tertiary">
          <div className="flex items-center gap-2">
            <span>Navigate <kbd className="px-1 py-0.5 rounded bg-bg-secondary border border-border-secondary">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-bg-secondary border border-border-secondary">↓</kbd></span>
            <span>Select <kbd className="px-1 py-0.5 rounded bg-bg-secondary border border-border-secondary">↵</kbd></span>
          </div>
          <span>Workspace Manager</span>
        </div>
      </div>
    </div>
  );
}
