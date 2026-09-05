// ============================================================
// ENUMS / UNION TYPES
// ============================================================

export type Role = 'owner' | 'admin' | 'member' | 'viewer';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type ActivityAction =
  | 'created'
  | 'edited'
  | 'status_changed'
  | 'assigned'
  | 'commented'
  | 'comment_edited'
  | 'comment_deleted'
  | 'completed'
  | 'deleted'
  | 'moved'
  | 'priority_changed'
  | 'label_added'
  | 'label_removed'
  | 'subtask_added'
  | 'subtask_completed'
  | 'attachment_added'
  | 'member_added'
  | 'member_removed'
  | 'role_changed';

export type ViewType = 'kanban' | 'list' | 'calendar';

export type ThemeMode = 'light' | 'dark' | 'system';

export type NotificationType = 'assignment' | 'mention' | 'due_date' | 'comment' | 'status_change';

export type SyncStatus = 'synced' | 'pending' | 'error';

// ============================================================
// CORE ENTITIES
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string; // URL or initials fallback
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  color: string;
  defaultView: ViewType;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: Role;
  joinedAt: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  archived: boolean;
  template?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: Role;
  joinedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  assigneeId: string | null;
  labelIds: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  order: number;
  createdAt: string;
}

export interface KanbanColumn {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  order: number;
  color: string;
}

export interface Label {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  mentions: string[]; // user IDs
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  taskId: string;
  filename: string;
  fileType: string;
  size: number;
  dataUrl?: string; // base64 for small files
  storedInIDB: boolean; // true if stored in IndexedDB
  createdAt: string;
  uploadedBy: string;
}

export interface ActivityEvent {
  id: string;
  workspaceId: string;
  projectId: string;
  taskId?: string;
  userId: string;
  action: ActivityAction;
  target: string; // description of what was affected
  metadata?: Record<string, string>; // old/new values
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  assignments: boolean;
  mentions: boolean;
  dueDates: boolean;
}

export interface SavedFilter {
  id: string;
  workspaceId: string;
  name: string;
  filters: FilterState;
  createdAt: string;
}

export interface FilterState {
  assigneeIds: string[];
  labelIds: string[];
  priorities: Priority[];
  statuses: TaskStatus[];
  dueDateFrom: string | null;
  dueDateTo: string | null;
  searchQuery: string;
}

export interface SortState {
  field: 'dueDate' | 'priority' | 'createdAt' | 'title';
  direction: 'asc' | 'desc';
}

export interface AppSettings {
  theme: ThemeMode;
  defaultView: ViewType;
  sidebarCollapsed: boolean;
  projectViews: Record<string, ViewType>;
}

// ============================================================
// HISTORY (UNDO/REDO)
// ============================================================

export interface HistoryEntry {
  id: string;
  action: string;
  description: string;
  previousState: unknown;
  newState: unknown;
  timestamp: string;
}

// ============================================================
// UI STATE
// ============================================================

export interface ModalState {
  createTask: boolean;
  editTask: string | null; // task id
  deleteTask: string | null;
  createProject: boolean;
  createWorkspace: boolean;
  inviteMember: boolean;
  commandPalette: boolean;
  taskDetail: string | null;
  confirmation: ConfirmationState | null;
}

export interface ConfirmationState {
  title: string;
  message: string;
  confirmLabel: string;
  variant: 'danger' | 'warning' | 'default';
  onConfirmAction: string; // serializable action type
  onConfirmPayload?: unknown;
}

// ============================================================
// TEMPLATE
// ============================================================

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  tasks: Omit<Task, 'id' | 'projectId' | 'createdAt' | 'updatedAt' | 'createdBy'>[];
}

// ============================================================
// IMPORT/EXPORT
// ============================================================

export interface ExportData {
  version: string;
  exportedAt: string;
  workspace: Workspace;
  members: WorkspaceMember[];
  projects: Project[];
  projectMembers: ProjectMember[];
  tasks: Task[];
  subtasks: Subtask[];
  kanbanColumns: KanbanColumn[];
  labels: Label[];
  comments: Comment[];
  activity: ActivityEvent[];
  settings: Partial<AppSettings>;
}

// ============================================================
// PERMISSION RESULT
// ============================================================

export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
}

// ============================================================
// STATUS / PRIORITY CONFIG
// ============================================================

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: string }> = {
  backlog: { label: 'Backlog', color: '#6B7280', icon: 'Circle' },
  todo: { label: 'Todo', color: '#3B82F6', icon: 'CircleDot' },
  in_progress: { label: 'In Progress', color: '#F59E0B', icon: 'Timer' },
  review: { label: 'Review', color: '#8B5CF6', icon: 'Eye' },
  done: { label: 'Done', color: '#10B981', icon: 'CheckCircle2' },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: string; level: number }> = {
  low: { label: 'Low', color: '#6B7280', icon: 'ArrowDown', level: 0 },
  medium: { label: 'Medium', color: '#F59E0B', icon: 'ArrowRight', level: 1 },
  high: { label: 'High', color: '#F97316', icon: 'ArrowUp', level: 2 },
  urgent: { label: 'Urgent', color: '#EF4444', icon: 'AlertTriangle', level: 3 },
};

export const ROLE_CONFIG: Record<Role, { label: string; level: number }> = {
  viewer: { label: 'Viewer', level: 0 },
  member: { label: 'Member', level: 1 },
  admin: { label: 'Admin', level: 2 },
  owner: { label: 'Owner', level: 3 },
};

export const DEFAULT_FILTER_STATE: FilterState = {
  assigneeIds: [],
  labelIds: [],
  priorities: [],
  statuses: [],
  dueDateFrom: null,
  dueDateTo: null,
  searchQuery: '',
};
