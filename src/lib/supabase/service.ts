import { getSupabaseClient, isSupabaseConfigured } from './client';
import {
  Workspace, WorkspaceMember, Project, ProjectMember,
  Task, Subtask, KanbanColumn, Label, Comment, ActivityEvent, User,
} from '@/types';

export interface SupabaseSyncResult {
  success: boolean;
  message: string;
  counts?: Record<string, number>;
}

export async function testSupabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { connected: false, error: 'Supabase credentials not configured' };
  }
  const client = getSupabaseClient();
  if (!client) {
    return { connected: false, error: 'Client initialization failed' };
  }

  try {
    const { error } = await client.from('workspaces').select('id').limit(1);
    if (error) {
      return { connected: false, error: error.message };
    }
    return { connected: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown network error';
    return { connected: false, error: msg };
  }
}

/**
 * Upload entire local dataset (workspaces, projects, tasks, etc.) to Supabase tables.
 */
export async function uploadLocalDataToSupabase(data: {
  users?: User[];
  workspaces: Workspace[];
  workspaceMembers: WorkspaceMember[];
  projects: Project[];
  projectMembers: ProjectMember[];
  kanbanColumns: KanbanColumn[];
  labels: Label[];
  tasks: Task[];
  subtasks: Subtask[];
  comments?: Comment[];
  activity?: ActivityEvent[];
}): Promise<SupabaseSyncResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client is not configured.' };
  }

  try {
    // 1. Upload Profiles
    if (data.users && data.users.length > 0) {
      const profiles = data.users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar || '',
        created_at: u.createdAt,
      }));
      await client.from('profiles').upsert(profiles, { onConflict: 'id' });
    }

    // 2. Upload Workspaces
    if (data.workspaces.length > 0) {
      const ws = data.workspaces.map(w => ({
        id: w.id,
        name: w.name,
        icon: w.icon,
        color: w.color,
        default_view: w.defaultView,
        created_by: w.createdBy,
        created_at: w.createdAt,
        updated_at: w.updatedAt,
      }));
      await client.from('workspaces').upsert(ws, { onConflict: 'id' });
    }

    // 3. Upload Workspace Members
    if (data.workspaceMembers.length > 0) {
      const wm = data.workspaceMembers.map(m => ({
        id: m.id,
        workspace_id: m.workspaceId,
        user_id: m.userId,
        role: m.role,
        joined_at: m.joinedAt,
      }));
      await client.from('workspace_members').upsert(wm, { onConflict: 'id' });
    }

    // 4. Upload Projects
    if (data.projects.length > 0) {
      const projs = data.projects.map(p => ({
        id: p.id,
        workspace_id: p.workspaceId,
        name: p.name,
        description: p.description || '',
        icon: p.icon,
        color: p.color,
        archived: p.archived,
        template: p.template || null,
        created_by: p.createdBy,
        created_at: p.createdAt,
        updated_at: p.updatedAt,
      }));
      await client.from('projects').upsert(projs, { onConflict: 'id' });
    }

    // 5. Upload Project Members
    if (data.projectMembers.length > 0) {
      const pm = data.projectMembers.map(m => ({
        id: m.id,
        project_id: m.projectId,
        user_id: m.userId,
        role: m.role,
        joined_at: m.joinedAt,
      }));
      await client.from('project_members').upsert(pm, { onConflict: 'id' });
    }

    // 6. Upload Kanban Columns
    if (data.kanbanColumns.length > 0) {
      const cols = data.kanbanColumns.map(c => ({
        id: c.id,
        project_id: c.projectId,
        title: c.title,
        status: c.status,
        order: c.order,
        color: c.color || '#3B82F6',
      }));
      await client.from('kanban_columns').upsert(cols, { onConflict: 'id' });
    }

    // 7. Upload Labels
    if (data.labels.length > 0) {
      const lbls = data.labels.map(l => ({
        id: l.id,
        workspace_id: l.workspaceId,
        name: l.name,
        color: l.color,
      }));
      await client.from('labels').upsert(lbls, { onConflict: 'id' });
    }

    // 8. Upload Tasks
    if (data.tasks.length > 0) {
      const ts = data.tasks.map(t => ({
        id: t.id,
        project_id: t.projectId,
        title: t.title,
        description: t.description || '',
        status: t.status,
        priority: t.priority,
        due_date: t.dueDate || null,
        assignee_id: t.assigneeId || null,
        label_ids: t.labelIds || [],
        order: t.order,
        created_by: t.createdBy,
        created_at: t.createdAt,
        updated_at: t.updatedAt,
      }));
      await client.from('tasks').upsert(ts, { onConflict: 'id' });
    }

    // 9. Upload Subtasks
    if (data.subtasks.length > 0) {
      const sts = data.subtasks.map(s => ({
        id: s.id,
        task_id: s.taskId,
        title: s.title,
        completed: s.completed,
        order: s.order,
        created_at: s.createdAt,
      }));
      await client.from('subtasks').upsert(sts, { onConflict: 'id' });
    }

    // 10. Upload Comments
    if (data.comments && data.comments.length > 0) {
      const cmts = data.comments.map(c => ({
        id: c.id,
        task_id: c.taskId,
        author_id: c.authorId,
        content: c.content,
        mentions: c.mentions || [],
        created_at: c.createdAt,
        updated_at: c.updatedAt,
      }));
      await client.from('comments').upsert(cmts, { onConflict: 'id' });
    }

    // 11. Upload Activity
    if (data.activity && data.activity.length > 0) {
      const acts = data.activity.map(a => ({
        id: a.id,
        workspace_id: a.workspaceId,
        project_id: a.projectId,
        task_id: a.taskId || null,
        user_id: a.userId,
        action: a.action,
        target: a.target,
        metadata: a.metadata || null,
        timestamp: a.timestamp,
      }));
      await client.from('activity_events').upsert(acts, { onConflict: 'id' });
    }

    return {
      success: true,
      message: 'All local data successfully synced to Supabase!',
      counts: {
        workspaces: data.workspaces.length,
        projects: data.projects.length,
        tasks: data.tasks.length,
        subtasks: data.subtasks.length,
      },
    };
  } catch (err: unknown) {
    console.error('Error uploading data to Supabase:', err);
    const msg = err instanceof Error ? err.message : 'Upload failed';
    return { success: false, message: msg };
  }
}

/**
 * Fetch full workspace and project dataset from Supabase.
 */
export async function fetchAllFromSupabase(): Promise<{
  workspaces: Workspace[];
  workspaceMembers: WorkspaceMember[];
  projects: Project[];
  projectMembers: ProjectMember[];
  kanbanColumns: KanbanColumn[];
  labels: Label[];
  tasks: Task[];
  subtasks: Subtask[];
  comments: Comment[];
  activity: ActivityEvent[];
} | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const [
      wsRes, wmRes, projRes, pmRes, colRes, lblRes, taskRes, subtaskRes, cmtRes, actRes,
    ] = await Promise.all([
      client.from('workspaces').select('*'),
      client.from('workspace_members').select('*'),
      client.from('projects').select('*'),
      client.from('project_members').select('*'),
      client.from('kanban_columns').select('*').order('order', { ascending: true }),
      client.from('labels').select('*'),
      client.from('tasks').select('*').order('order', { ascending: true }),
      client.from('subtasks').select('*').order('order', { ascending: true }),
      client.from('comments').select('*'),
      client.from('activity_events').select('*').order('timestamp', { ascending: false }),
    ]);

    if (wsRes.error || !wsRes.data) return null;

    const workspaces: Workspace[] = (wsRes.data || []).map(w => ({
      id: w.id,
      name: w.name,
      icon: w.icon || '🏢',
      color: w.color || '#3B82F6',
      defaultView: w.default_view || 'kanban',
      createdBy: w.created_by || '',
      createdAt: w.created_at,
      updatedAt: w.updated_at,
    }));

    const workspaceMembers: WorkspaceMember[] = (wmRes.data || []).map(m => ({
      id: m.id,
      workspaceId: m.workspace_id,
      userId: m.user_id,
      role: m.role,
      joinedAt: m.joined_at,
    }));

    const projects: Project[] = (projRes.data || []).map(p => ({
      id: p.id,
      workspaceId: p.workspace_id,
      name: p.name,
      description: p.description || '',
      icon: p.icon || '📁',
      color: p.color || '#3B82F6',
      archived: p.archived || false,
      template: p.template || undefined,
      createdBy: p.created_by || '',
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    const projectMembers: ProjectMember[] = (pmRes.data || []).map(m => ({
      id: m.id,
      projectId: m.project_id,
      userId: m.user_id,
      role: m.role,
      joinedAt: m.joined_at,
    }));

    const kanbanColumns: KanbanColumn[] = (colRes.data || []).map(c => ({
      id: c.id,
      projectId: c.project_id,
      title: c.title,
      status: c.status,
      order: c.order,
      color: c.color,
    }));

    const labels: Label[] = (lblRes.data || []).map(l => ({
      id: l.id,
      workspaceId: l.workspace_id,
      name: l.name,
      color: l.color,
    }));

    const tasks: Task[] = (taskRes.data || []).map(t => ({
      id: t.id,
      projectId: t.project_id,
      title: t.title,
      description: t.description || '',
      status: t.status,
      priority: t.priority,
      dueDate: t.due_date,
      assigneeId: t.assignee_id,
      labelIds: t.label_ids || [],
      order: t.order,
      createdBy: t.created_by || '',
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }));

    const subtasks: Subtask[] = (subtaskRes.data || []).map(s => ({
      id: s.id,
      taskId: s.task_id,
      title: s.title,
      completed: s.completed,
      order: s.order,
      createdAt: s.created_at,
    }));

    const comments: Comment[] = (cmtRes.data || []).map(c => ({
      id: c.id,
      taskId: c.task_id,
      authorId: c.author_id,
      content: c.content,
      mentions: c.mentions || [],
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));

    const activity: ActivityEvent[] = (actRes.data || []).map(a => ({
      id: a.id,
      workspaceId: a.workspace_id,
      projectId: a.project_id,
      taskId: a.task_id || undefined,
      userId: a.user_id,
      action: a.action,
      target: a.target,
      metadata: a.metadata || undefined,
      timestamp: a.timestamp,
    }));

    return {
      workspaces,
      workspaceMembers,
      projects,
      projectMembers,
      kanbanColumns,
      labels,
      tasks,
      subtasks,
      comments,
      activity,
    };
  } catch (err) {
    console.error('Failed to fetch from Supabase', err);
    return null;
  }
}
