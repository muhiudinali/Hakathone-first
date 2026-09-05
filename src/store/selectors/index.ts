import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Task, TaskStatus, Priority, FilterState, SortState } from '@/types';
import { PRIORITY_CONFIG } from '@/types';

// ── Auth Selectors ──
export const selectCurrentUserId = (state: RootState) => state.auth.currentUserId;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAllUsers = (state: RootState) => state.auth.users;
export const selectCurrentUser = createSelector(
  [selectCurrentUserId, selectAllUsers],
  (userId, users) => (userId ? users[userId] : null)
);
export const selectUserById = (userId: string) => (state: RootState) => state.auth.users[userId];

// ── Workspace Selectors ──
export const selectCurrentWorkspaceId = (state: RootState) => state.workspaces.currentWorkspaceId;
export const selectAllWorkspaces = (state: RootState) => state.workspaces.entities;
export const selectCurrentWorkspace = createSelector(
  [selectCurrentWorkspaceId, selectAllWorkspaces],
  (wsId, workspaces) => (wsId ? workspaces[wsId] : null)
);
export const selectWorkspaceList = createSelector(
  [selectAllWorkspaces],
  (workspaces) => Object.values(workspaces)
);
export const selectWorkspaceMembers = (workspaceId: string) => (state: RootState) =>
  state.workspaces.members[workspaceId] || [];
export const selectCurrentWorkspaceMembers = createSelector(
  [selectCurrentWorkspaceId, (state: RootState) => state.workspaces.members],
  (wsId, members) => (wsId ? members[wsId] || [] : [])
);
export const selectWorkspaceLabels = (workspaceId: string) => (state: RootState) =>
  state.workspaces.labels[workspaceId] || [];
export const selectCurrentWorkspaceLabels = createSelector(
  [selectCurrentWorkspaceId, (state: RootState) => state.workspaces.labels],
  (wsId, labels) => (wsId ? labels[wsId] || [] : [])
);
export const selectCurrentUserWorkspaceRole = createSelector(
  [selectCurrentUserId, selectCurrentWorkspaceMembers],
  (userId, members) => {
    if (!userId) return null;
    const member = members.find(m => m.userId === userId);
    return member?.role ?? null;
  }
);

// ── Project Selectors ──
export const selectCurrentProjectId = (state: RootState) => state.projects.currentProjectId;
export const selectAllProjects = (state: RootState) => state.projects.entities;
export const selectCurrentProject = createSelector(
  [selectCurrentProjectId, selectAllProjects],
  (projId, projects) => (projId ? projects[projId] : null)
);
export const selectWorkspaceProjects = createSelector(
  [selectCurrentWorkspaceId, selectAllProjects],
  (wsId, projects) => Object.values(projects).filter(p => p.workspaceId === wsId && !p.archived)
);
export const selectProjectById = (projectId: string) => (state: RootState) =>
  state.projects.entities[projectId];
export const selectProjectMembers = (projectId: string) => (state: RootState) =>
  state.projects.members[projectId] || [];
export const selectProjectKanbanColumns = (projectId: string) => (state: RootState) =>
  (state.projects.kanbanColumns[projectId] || []).slice().sort((a, b) => a.order - b.order);
export const selectCurrentUserProjectRole = createSelector(
  [selectCurrentUserId, selectCurrentProjectId, (state: RootState) => state.projects.members],
  (userId, projId, members) => {
    if (!userId || !projId) return null;
    const projMembers = members[projId] || [];
    const member = projMembers.find(m => m.userId === userId);
    return member?.role ?? null;
  }
);

// ── Task Selectors ──
export const selectAllTasks = (state: RootState) => state.tasks.entities;
export const selectProjectTasks = createSelector(
  [selectCurrentProjectId, selectAllTasks],
  (projId, tasks) => {
    if (!projId) return [];
    return Object.values(tasks).filter(t => t.projectId === projId);
  }
);

export const selectTaskById = (taskId: string) => (state: RootState) => state.tasks.entities[taskId];
export const selectTaskSubtasks = (taskId: string) => (state: RootState) => state.tasks.subtasks[taskId] || [];
export const selectTaskAttachments = (taskId: string) => (state: RootState) => state.tasks.attachments[taskId] || [];
export const selectSelectedTaskIds = (state: RootState) => state.tasks.selectedTaskIds;

export const selectMyTasks = createSelector(
  [selectCurrentUserId, selectAllTasks],
  (userId, tasks) => {
    if (!userId) return [];
    return Object.values(tasks).filter(t => t.assigneeId === userId && t.status !== 'done');
  }
);

export const selectOverdueTasks = createSelector(
  [selectAllTasks],
  (tasks) => {
    const now = new Date();
    return Object.values(tasks).filter(t => 
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    );
  }
);

// ── Filtered & Sorted Tasks ──
export const selectActiveFilters = (state: RootState) => state.filters.active;
export const selectActiveSort = (state: RootState) => state.filters.sort;
export const selectGroupBy = (state: RootState) => state.filters.groupBy;
export const selectSavedFilters = (state: RootState) => state.filters.saved;

function applyFilters(tasks: Task[], filters: FilterState): Task[] {
  let filtered = tasks;
  if (filters.assigneeIds.length > 0) {
    filtered = filtered.filter(t => t.assigneeId && filters.assigneeIds.includes(t.assigneeId));
  }
  if (filters.labelIds.length > 0) {
    filtered = filtered.filter(t => t.labelIds.some(l => filters.labelIds.includes(l)));
  }
  if (filters.priorities.length > 0) {
    filtered = filtered.filter(t => filters.priorities.includes(t.priority));
  }
  if (filters.statuses.length > 0) {
    filtered = filtered.filter(t => filters.statuses.includes(t.status));
  }
  if (filters.dueDateFrom) {
    filtered = filtered.filter(t => t.dueDate && t.dueDate >= filters.dueDateFrom!);
  }
  if (filters.dueDateTo) {
    filtered = filtered.filter(t => t.dueDate && t.dueDate <= filters.dueDateTo!);
  }
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }
  return filtered;
}

function applySorting(tasks: Task[], sort: SortState): Task[] {
  const sorted = [...tasks];
  sorted.sort((a, b) => {
    let cmp = 0;
    switch (sort.field) {
      case 'title':
        cmp = a.title.localeCompare(b.title);
        break;
      case 'priority':
        cmp = PRIORITY_CONFIG[a.priority].level - PRIORITY_CONFIG[b.priority].level;
        break;
      case 'dueDate':
        cmp = (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
        break;
      case 'createdAt':
        cmp = a.createdAt.localeCompare(b.createdAt);
        break;
    }
    return sort.direction === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

export const selectFilteredSortedProjectTasks = createSelector(
  [selectProjectTasks, selectActiveFilters, selectActiveSort],
  (tasks, filters, sort) => applySorting(applyFilters(tasks, filters), sort)
);

// ── Comment Selectors ──
export const selectAllComments = (state: RootState) => state.comments.entities;
export const selectTaskComments = (taskId: string) =>
  createSelector(
    [selectAllComments],
    (comments) => Object.values(comments)
      .filter(c => c.taskId === taskId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  );

// ── Activity Selectors ──
export const selectAllActivity = (state: RootState) => state.activity.events;
export const selectProjectActivity = (projectId: string) =>
  createSelector(
    [selectAllActivity],
    (events) => events.filter(e => e.projectId === projectId)
  );
export const selectRecentActivity = createSelector(
  [selectAllActivity, selectCurrentWorkspaceId],
  (events, wsId) => events.filter(e => e.workspaceId === wsId).slice(0, 20)
);

// ── Notification Selectors ──
export const selectAllNotifications = (state: RootState) => state.notifications.entities;
export const selectUserNotifications = createSelector(
  [selectAllNotifications, selectCurrentUserId],
  (notifications, userId) => {
    if (!userId) return [];
    return Object.values(notifications)
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
);
export const selectUnreadNotificationCount = createSelector(
  [selectUserNotifications],
  (notifications) => notifications.filter(n => !n.read).length
);
export const selectNotificationPreferences = (state: RootState) => state.notifications.preferences;

// ── Settings Selectors ──
export const selectTheme = (state: RootState) => state.settings.theme;
export const selectSidebarCollapsed = (state: RootState) => state.settings.sidebarCollapsed;
export const selectDefaultView = (state: RootState) => state.settings.defaultView;
export const selectProjectView = (projectId: string) => (state: RootState) =>
  state.settings.projectViews[projectId] || state.settings.defaultView;

// ── UI Selectors ──
export const selectIsOnline = (state: RootState) => state.ui.isOnline;
export const selectSyncStatus = (state: RootState) => state.ui.syncStatus;
export const selectLastSyncedAt = (state: RootState) => state.ui.lastSyncedAt;
export const selectCommandPaletteOpen = (state: RootState) => state.ui.commandPaletteOpen;
export const selectTaskDetailId = (state: RootState) => state.ui.taskDetailId;
export const selectCreateTaskOpen = (state: RootState) => state.ui.createTaskOpen;
export const selectCreateProjectOpen = (state: RootState) => state.ui.createProjectOpen;
export const selectCreateWorkspaceOpen = (state: RootState) => state.ui.createWorkspaceOpen;
export const selectInviteMemberOpen = (state: RootState) => state.ui.inviteMemberOpen;
export const selectConfirmDialog = (state: RootState) => state.ui.confirmDialog;
export const selectSidebarMobileOpen = (state: RootState) => state.ui.sidebarMobileOpen;

// ── Dashboard Stats ──
export const selectDashboardStats = createSelector(
  [selectAllTasks, selectCurrentWorkspaceId, selectAllProjects],
  (tasks, wsId, projects) => {
    const wsProjectIds = Object.values(projects)
      .filter(p => p.workspaceId === wsId && !p.archived)
      .map(p => p.id);
    const wsTasks = Object.values(tasks).filter(t => wsProjectIds.includes(t.projectId));
    const now = new Date();
    return {
      totalProjects: wsProjectIds.length,
      activeTasks: wsTasks.filter(t => t.status !== 'done').length,
      completedTasks: wsTasks.filter(t => t.status === 'done').length,
      overdueTasks: wsTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done').length,
    };
  }
);

// ── Undo/Redo ──
export const selectCanUndo = (state: RootState) => state.tasks.historyIndex >= 0;
export const selectCanRedo = (state: RootState) => state.tasks.historyIndex < state.tasks.history.length - 1;
export const selectLastHistoryEntry = (state: RootState) => {
  const idx = state.tasks.historyIndex;
  return idx >= 0 ? state.tasks.history[idx] : null;
};
