'use client';

import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/store/store';
import { setUsers, login } from '@/store/slices/authSlice';
import { loadWorkspaces, setCurrentWorkspace } from '@/store/slices/workspaceSlice';
import { loadProjects } from '@/store/slices/projectSlice';
import { loadTasks } from '@/store/slices/taskSlice';
import { loadComments } from '@/store/slices/commentSlice';
import { loadActivity } from '@/store/slices/activitySlice';
import { loadNotifications } from '@/store/slices/notificationSlice';
import { loadSettings } from '@/store/slices/settingsSlice';
import { loadSavedFilters } from '@/store/slices/filterSlice';
import { generateSeedData } from '@/lib/mock-data/seed';
import { loadFromStorage, saveToStorage } from '@/lib/persistence/localStorage';
import {
  AppSettings, User, Workspace, WorkspaceMember, Label,
  Project, ProjectMember, KanbanColumn, Task, Subtask,
  Comment, ActivityEvent, Notification, SavedFilter,
} from '@/types';

function hydrateStore(store: AppStore) {
  const seeded = loadFromStorage<boolean>('seeded_clean_v7', false);
  
  if (!seeded) {
    // Purge old dummy data from localStorage
    if (typeof window !== 'undefined') {
      [
        'workspaces', 'projects', 'tasks', 'comments', 'activity',
        'notifications', 'seeded_v1', 'seeded_v2', 'seeded_v3',
      ].forEach(k => {
        try { localStorage.removeItem(`wm_${k}`); } catch {}
      });
    }

    // Load clean initial state
    const seed = generateSeedData();
    store.dispatch(setUsers(seed.users));
    store.dispatch(loadWorkspaces({
      workspaces: seed.workspaces,
      members: seed.workspaceMembers,
      labels: seed.labels,
    }));
    store.dispatch(loadProjects({
      projects: [],
      members: [],
      kanbanColumns: [],
    }));
    store.dispatch(loadTasks({
      tasks: [],
      subtasks: [],
    }));
    store.dispatch(loadComments([]));
    store.dispatch(loadActivity([]));
    store.dispatch(loadNotifications([]));
    store.dispatch(setCurrentWorkspace(seed.workspaces[0]?.id || 'ws-main'));
    
    saveToStorage('seeded_clean_v7', true);
    persistState(store);
  } else {
    // Subsequent launches: load from storage
    const auth = loadFromStorage<{ currentUserId: string | null; isAuthenticated: boolean } | null>('auth', null);
    const users = loadFromStorage<User[] | null>('users', null);
    const workspaces = loadFromStorage<{
      entities: Workspace[];
      members: WorkspaceMember[];
      labels: Label[];
      currentWorkspaceId?: string;
    } | null>('workspaces', null);
    const projects = loadFromStorage<{
      entities: Project[];
      members: ProjectMember[];
      kanbanColumns: KanbanColumn[];
    } | null>('projects', null);
    const tasks = loadFromStorage<{
      entities: Task[];
      subtasks: Subtask[];
    } | null>('tasks', null);
    const comments = loadFromStorage<Comment[] | null>('comments', null);
    const activity = loadFromStorage<ActivityEvent[] | null>('activity', null);
    const notifications = loadFromStorage<Notification[] | null>('notifications', null);
    const settings = loadFromStorage<Partial<AppSettings>>('settings', {});
    const savedFilters = loadFromStorage<SavedFilter[]>('savedFilters', []);

    if (users) store.dispatch(setUsers(users));
    if (workspaces) {
      store.dispatch(loadWorkspaces({
        workspaces: workspaces.entities || [],
        members: workspaces.members || [],
        labels: workspaces.labels || [],
      }));
      if (workspaces.currentWorkspaceId) {
        store.dispatch(setCurrentWorkspace(workspaces.currentWorkspaceId));
      }
    }
    if (projects) {
      store.dispatch(loadProjects({
        projects: projects.entities || [],
        members: projects.members || [],
        kanbanColumns: projects.kanbanColumns || [],
      }));
    }
    if (tasks) {
      store.dispatch(loadTasks({
        tasks: tasks.entities || [],
        subtasks: tasks.subtasks || [],
      }));
    }
    if (comments) store.dispatch(loadComments(comments));
    if (activity) store.dispatch(loadActivity(activity));
    if (notifications) store.dispatch(loadNotifications(notifications));
    if (settings) store.dispatch(loadSettings(settings));
    if (savedFilters) store.dispatch(loadSavedFilters(savedFilters));
    
    // Restore auth
    if (auth?.currentUserId && auth?.isAuthenticated) {
      store.dispatch(login(auth.currentUserId));
    }
  }
}

function persistState(store: AppStore) {
  const state = store.getState();
  
  // Auth
  saveToStorage('auth', {
    currentUserId: state.auth.currentUserId,
    isAuthenticated: state.auth.isAuthenticated,
  });
  
  // Users
  saveToStorage('users', Object.values(state.auth.users));
  
  // Workspaces
  const wsEntities = Object.values(state.workspaces.entities);
  const wsMembers = Object.values(state.workspaces.members).flat();
  const wsLabels = Object.values(state.workspaces.labels).flat();
  saveToStorage('workspaces', {
    entities: wsEntities,
    members: wsMembers,
    labels: wsLabels,
    currentWorkspaceId: state.workspaces.currentWorkspaceId,
  });
  
  // Projects
  const projEntities = Object.values(state.projects.entities);
  const projMembers = Object.values(state.projects.members).flat();
  const kanbanCols = Object.values(state.projects.kanbanColumns).flat();
  saveToStorage('projects', {
    entities: projEntities,
    members: projMembers,
    kanbanColumns: kanbanCols,
  });
  
  // Tasks
  const taskEntities = Object.values(state.tasks.entities);
  const allSubtasks = Object.entries(state.tasks.subtasks).flatMap(([, subs]) => subs);
  saveToStorage('tasks', {
    entities: taskEntities,
    subtasks: allSubtasks,
  });
  
  // Comments
  saveToStorage('comments', Object.values(state.comments.entities));
  
  // Activity
  saveToStorage('activity', state.activity.events);
  
  // Notifications
  saveToStorage('notifications', Object.values(state.notifications.entities));
  
  // Settings
  saveToStorage('settings', state.settings);
  
  // Saved filters
  saveToStorage('savedFilters', state.filters.saved);
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => {
    const s = makeStore();
    if (typeof window !== 'undefined') {
      hydrateStore(s);
    }
    return s;
  });

  useEffect(() => {
    let persistTimer: ReturnType<typeof setTimeout>;
    const unsubscribe = store.subscribe(() => {
      clearTimeout(persistTimer);
      persistTimer = setTimeout(() => {
        persistState(store);
      }, 1000);
    });

    // Background sync from Supabase if credentials are configured
    if (typeof window !== 'undefined') {
      import('@/lib/supabase/client').then(({ isSupabaseConfigured }) => {
        if (isSupabaseConfigured()) {
          import('@/lib/supabase/service').then(({ fetchAllFromSupabase }) => {
            fetchAllFromSupabase().then((data) => {
              if (data && data.workspaces.length > 0) {
                store.dispatch(loadWorkspaces({
                  workspaces: data.workspaces,
                  members: data.workspaceMembers,
                  labels: data.labels,
                }));
                store.dispatch(loadProjects({
                  projects: data.projects,
                  members: data.projectMembers,
                  kanbanColumns: data.kanbanColumns,
                }));
                store.dispatch(loadTasks({
                  tasks: data.tasks,
                  subtasks: data.subtasks,
                }));
                store.dispatch(loadComments(data.comments));
                store.dispatch(loadActivity(data.activity));
                persistState(store);
              }
            }).catch(err => console.log('Supabase sync skipped:', err));
          });
        }
      });
    }

    return () => {
      clearTimeout(persistTimer);
      unsubscribe();
    };
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
