import {
  User, Workspace, WorkspaceMember, Project, ProjectMember,
  Task, Subtask, KanbanColumn, Label, Comment, ActivityEvent,
  Notification, Role, ViewType
} from '@/types';
import { DEMO_USERS } from './users';

export interface SeedData {
  users: User[];
  workspaces: Workspace[];
  workspaceMembers: WorkspaceMember[];
  projects: Project[];
  projectMembers: ProjectMember[];
  tasks: Task[];
  subtasks: Subtask[];
  kanbanColumns: KanbanColumn[];
  labels: Label[];
  comments: Comment[];
  activity: ActivityEvent[];
  notifications: Notification[];
}

export function generateSeedData(): SeedData {
  const users = [...DEMO_USERS];

  // ── 1 Clean Workspace ──
  const workspaces: Workspace[] = [
    {
      id: 'ws-main',
      name: 'My Workspace',
      icon: 'building',
      color: '#3B82F6',
      defaultView: 'kanban' as ViewType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user-alex',
    },
  ];

  // ── Workspace Members ──
  const workspaceMembers: WorkspaceMember[] = [
    { id: 'wm-main-1', workspaceId: 'ws-main', userId: 'user-alex', role: 'owner' as Role, joinedAt: new Date().toISOString() },
    { id: 'wm-main-2', workspaceId: 'ws-main', userId: 'user-sarah', role: 'admin' as Role, joinedAt: new Date().toISOString() },
    { id: 'wm-main-3', workspaceId: 'ws-main', userId: 'user-daniel', role: 'member' as Role, joinedAt: new Date().toISOString() },
    { id: 'wm-main-4', workspaceId: 'ws-main', userId: 'user-emily', role: 'member' as Role, joinedAt: new Date().toISOString() },
  ];

  // ── Standard Workspace Labels ──
  const labels: Label[] = [
    { id: 'label-bug', workspaceId: 'ws-main', name: 'Bug', color: '#EF4444' },
    { id: 'label-feature', workspaceId: 'ws-main', name: 'Feature', color: '#3B82F6' },
    { id: 'label-improvement', workspaceId: 'ws-main', name: 'Improvement', color: '#10B981' },
    { id: 'label-urgent', workspaceId: 'ws-main', name: 'Urgent', color: '#F97316' },
    { id: 'label-design', workspaceId: 'ws-main', name: 'Design', color: '#8B5CF6' },
    { id: 'label-docs', workspaceId: 'ws-main', name: 'Documentation', color: '#06B6D4' },
  ];

  // ── Clean empty projects, tasks, comments, activity ──
  const projects: Project[] = [];
  const projectMembers: ProjectMember[] = [];
  const kanbanColumns: KanbanColumn[] = [];
  const tasks: Task[] = [];
  const subtasks: Subtask[] = [];
  const comments: Comment[] = [];
  const activity: ActivityEvent[] = [];
  const notifications: Notification[] = [];

  return {
    users,
    workspaces,
    workspaceMembers,
    projects,
    projectMembers,
    tasks,
    subtasks,
    kanbanColumns,
    labels,
    comments,
    activity,
    notifications,
  };
}
