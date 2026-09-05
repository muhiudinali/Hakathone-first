import {
  User, Workspace, WorkspaceMember, Project, ProjectMember,
  Task, Subtask, KanbanColumn, Label, Comment, ActivityEvent,
  Notification, TaskStatus, Priority, Role, ViewType
} from '@/types';
import { DEMO_USERS } from './users';
import { generateId } from '@/lib/utils';

// ============================================================
// SEED DATA GENERATOR
// ============================================================

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

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

  // ── Labels ──
  const labels: Label[] = [
    { id: 'label-bug', workspaceId: 'ws-1', name: 'Bug', color: '#EF4444' },
    { id: 'label-feature', workspaceId: 'ws-1', name: 'Feature', color: '#3B82F6' },
    { id: 'label-improvement', workspaceId: 'ws-1', name: 'Improvement', color: '#10B981' },
    { id: 'label-urgent', workspaceId: 'ws-1', name: 'Urgent', color: '#F97316' },
    { id: 'label-design', workspaceId: 'ws-1', name: 'Design', color: '#8B5CF6' },
    { id: 'label-docs', workspaceId: 'ws-1', name: 'Documentation', color: '#06B6D4' },
    { id: 'label-research', workspaceId: 'ws-1', name: 'Research', color: '#F59E0B' },
    { id: 'label-testing', workspaceId: 'ws-1', name: 'Testing', color: '#EC4899' },
    // Workspace 2 labels
    { id: 'label-client', workspaceId: 'ws-2', name: 'Client', color: '#3B82F6' },
    { id: 'label-internal', workspaceId: 'ws-2', name: 'Internal', color: '#10B981' },
    { id: 'label-review', workspaceId: 'ws-2', name: 'Needs Review', color: '#F59E0B' },
    { id: 'label-blocked', workspaceId: 'ws-2', name: 'Blocked', color: '#EF4444' },
  ];

  // ── Workspaces ──
  const workspaces: Workspace[] = [
    {
      id: 'ws-1',
      name: 'Acme Corp (Office)',
      icon: '🏢',
      color: '#3B82F6',
      defaultView: 'kanban' as ViewType,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(1),
      createdBy: 'user-alex',
    },
    {
      id: 'ws-2',
      name: 'Home & Personal (Ghar)',
      icon: '🏡',
      color: '#10B981',
      defaultView: 'kanban' as ViewType,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(1),
      createdBy: 'user-alex',
    },
  ];

  // ── Workspace Members ──
  const workspaceMembers: WorkspaceMember[] = [
    { id: 'wm-1', workspaceId: 'ws-1', userId: 'user-alex', role: 'owner' as Role, joinedAt: daysAgo(90) },
    { id: 'wm-2', workspaceId: 'ws-1', userId: 'user-sarah', role: 'admin' as Role, joinedAt: daysAgo(85) },
    { id: 'wm-3', workspaceId: 'ws-1', userId: 'user-daniel', role: 'member' as Role, joinedAt: daysAgo(80) },
    { id: 'wm-4', workspaceId: 'ws-1', userId: 'user-emily', role: 'viewer' as Role, joinedAt: daysAgo(70) },
    { id: 'wm-5', workspaceId: 'ws-2', userId: 'user-alex', role: 'owner' as Role, joinedAt: daysAgo(60) },
    { id: 'wm-6', workspaceId: 'ws-2', userId: 'user-sarah', role: 'member' as Role, joinedAt: daysAgo(55) },
    { id: 'wm-7', workspaceId: 'ws-2', userId: 'user-daniel', role: 'member' as Role, joinedAt: daysAgo(50) },
  ];

  // ── Projects ──
  const projects: Project[] = [
    {
      id: 'proj-1', workspaceId: 'ws-1', name: 'Office Operations & Client Work (Office ka Kaam)', description: 'Daily office operations, client project deliverables, sprint planning, and administrative tasks',
      icon: '💼', color: '#3B82F6', archived: false, template: 'Office & Operations', createdAt: daysAgo(60), updatedAt: daysAgo(1), createdBy: 'user-alex',
    },
    {
      id: 'proj-2', workspaceId: 'ws-1', name: 'Software Engineering & Platform', description: 'Web and mobile engineering, backend architecture, API endpoints, and code quality',
      icon: '💻', color: '#8B5CF6', archived: false, template: 'Product Development', createdAt: daysAgo(45), updatedAt: daysAgo(2), createdBy: 'user-sarah',
    },
    {
      id: 'proj-3', workspaceId: 'ws-1', name: 'Marketing & Client Outreach', description: 'Fourth quarter marketing campaign across all channels and client acquisition',
      icon: '📈', color: '#F59E0B', archived: false, template: 'Marketing Campaign', createdAt: daysAgo(30), updatedAt: daysAgo(1), createdBy: 'user-alex',
    },
    {
      id: 'proj-4', workspaceId: 'ws-1', name: 'API Platform', description: 'Public API platform for third-party integrations',
      icon: '⚡', color: '#06B6D4', archived: false, createdAt: daysAgo(20), updatedAt: daysAgo(5), createdBy: 'user-sarah',
    },
    {
      id: 'proj-5', workspaceId: 'ws-2', name: 'Home Maintenance & Chores (Ghar ka Kaam)', description: 'Weekly grocery shopping, utility bill payments, kitchen plumbing repairs, and home deep cleaning',
      icon: '🏠', color: '#10B981', archived: false, template: 'Home & Household', createdAt: daysAgo(40), updatedAt: daysAgo(1), createdBy: 'user-alex',
    },
    {
      id: 'proj-6', workspaceId: 'ws-2', name: 'Household Budget & Bills (Ghar ka Budget)', description: 'Monthly budget allocation, electricity solar savings plan, and emergency family reserve fund',
      icon: '💵', color: '#06B6D4', archived: false, createdAt: daysAgo(25), updatedAt: daysAgo(3), createdBy: 'user-alex',
    },
    {
      id: 'proj-7', workspaceId: 'ws-2', name: 'Personal Health & Fitness', description: 'Daily workout routine, steps tracking, health checkups, and prescription refills',
      icon: '🏃', color: '#F43F5E', archived: false, createdAt: daysAgo(15), updatedAt: daysAgo(2), createdBy: 'user-sarah',
    },
  ];

  // ── Project Members ──
  const projectMembers: ProjectMember[] = [
    // proj-1 members
    { id: 'pm-1', projectId: 'proj-1', userId: 'user-alex', role: 'owner' as Role, joinedAt: daysAgo(60) },
    { id: 'pm-2', projectId: 'proj-1', userId: 'user-sarah', role: 'admin' as Role, joinedAt: daysAgo(58) },
    { id: 'pm-3', projectId: 'proj-1', userId: 'user-daniel', role: 'member' as Role, joinedAt: daysAgo(55) },
    { id: 'pm-4', projectId: 'proj-1', userId: 'user-emily', role: 'viewer' as Role, joinedAt: daysAgo(50) },
    // proj-2 members
    { id: 'pm-5', projectId: 'proj-2', userId: 'user-sarah', role: 'owner' as Role, joinedAt: daysAgo(45) },
    { id: 'pm-6', projectId: 'proj-2', userId: 'user-alex', role: 'admin' as Role, joinedAt: daysAgo(44) },
    { id: 'pm-7', projectId: 'proj-2', userId: 'user-daniel', role: 'member' as Role, joinedAt: daysAgo(42) },
    // proj-3 members
    { id: 'pm-8', projectId: 'proj-3', userId: 'user-alex', role: 'owner' as Role, joinedAt: daysAgo(30) },
    { id: 'pm-9', projectId: 'proj-3', userId: 'user-emily', role: 'viewer' as Role, joinedAt: daysAgo(28) },
    { id: 'pm-10', projectId: 'proj-3', userId: 'user-sarah', role: 'member' as Role, joinedAt: daysAgo(28) },
    // proj-4 members
    { id: 'pm-11', projectId: 'proj-4', userId: 'user-sarah', role: 'owner' as Role, joinedAt: daysAgo(20) },
    { id: 'pm-12', projectId: 'proj-4', userId: 'user-daniel', role: 'member' as Role, joinedAt: daysAgo(18) },
    { id: 'pm-13', projectId: 'proj-4', userId: 'user-alex', role: 'member' as Role, joinedAt: daysAgo(18) },
    // proj-5 members
    { id: 'pm-14', projectId: 'proj-5', userId: 'user-alex', role: 'owner' as Role, joinedAt: daysAgo(40) },
    { id: 'pm-15', projectId: 'proj-5', userId: 'user-sarah', role: 'member' as Role, joinedAt: daysAgo(35) },
    // proj-6 members
    { id: 'pm-16', projectId: 'proj-6', userId: 'user-alex', role: 'owner' as Role, joinedAt: daysAgo(25) },
    { id: 'pm-17', projectId: 'proj-6', userId: 'user-daniel', role: 'member' as Role, joinedAt: daysAgo(22) },
    // proj-7 members
    { id: 'pm-18', projectId: 'proj-7', userId: 'user-sarah', role: 'owner' as Role, joinedAt: daysAgo(15) },
    { id: 'pm-19', projectId: 'proj-7', userId: 'user-alex', role: 'member' as Role, joinedAt: daysAgo(14) },
  ];

  // ── Kanban Columns (default for each project) ──
  const kanbanColumns: KanbanColumn[] = [];
  const defaultStatuses: { status: TaskStatus; title: string; color: string }[] = [
    { status: 'backlog', title: 'Backlog', color: '#6B7280' },
    { status: 'todo', title: 'Todo', color: '#3B82F6' },
    { status: 'in_progress', title: 'In Progress', color: '#F59E0B' },
    { status: 'review', title: 'Review', color: '#8B5CF6' },
    { status: 'done', title: 'Done', color: '#10B981' },
  ];
  projects.forEach(proj => {
    defaultStatuses.forEach((s, i) => {
      kanbanColumns.push({
        id: `col-${proj.id}-${s.status}`,
        projectId: proj.id,
        title: s.title,
        status: s.status,
        order: i,
        color: s.color,
      });
    });
  });

  // ── Tasks ──
  const tasks: Task[] = [];
  const subtasks: Subtask[] = [];
  const comments: Comment[] = [];
  const activity: ActivityEvent[] = [];

  const statuses: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done'];
  const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];
  const userIds = ['user-alex', 'user-sarah', 'user-daniel', 'user-emily'];

  // Project 1 - Website Redesign tasks
  const proj1Tasks = [
    { title: 'Prepare Q3 Client Proposal & Pitch Deck', desc: 'Create presentation slides covering project scope, timelines, and cost estimate', status: 'in_progress' as TaskStatus, priority: 'urgent' as Priority, due: daysFromNow(2) },
    { title: 'Weekly Team Sprint Planning & Review', desc: 'Review sprint backlog, assign tickets to developers, and finalize milestone goals', status: 'done' as TaskStatus, priority: 'high' as Priority, due: daysAgo(2) },
    { title: 'Code Review & Staging Deployment', desc: 'Review pull requests, verify test coverage, and deploy release candidate to staging', status: 'review' as TaskStatus, priority: 'high' as Priority, due: daysFromNow(1) },
    { title: 'Monthly Financial Expense & Budget Audit', desc: 'Audit monthly operational expenses, verify team reimbursements, and balance sheet', status: 'todo' as TaskStatus, priority: 'medium' as Priority, due: daysFromNow(5) },
    { title: 'Conduct Candidate Technical Interview', desc: 'Interview senior developer candidate and submit evaluation scorecard', status: 'todo' as TaskStatus, priority: 'medium' as Priority, due: daysFromNow(4) },
    { title: 'Security & Access Control Audit', desc: 'Review active team permissions, rotate API tokens, and verify MFA compliance', status: 'backlog' as TaskStatus, priority: 'high' as Priority, due: daysFromNow(10) },
    { title: 'Client Support SLA & Escalation Review', desc: 'Analyze open support tickets and average resolution turnaround times', status: 'done' as TaskStatus, priority: 'medium' as Priority, due: daysAgo(5) },
    { title: 'Vendor SaaS Contract & License Renewal', desc: 'Negotiate annual software tooling licenses and seat allotments', status: 'todo' as TaskStatus, priority: 'low' as Priority, due: daysFromNow(14) },
    { title: 'Quarterly OKR & Performance Alignment', desc: 'Align department key results and team milestone goals for the quarter', status: 'done' as TaskStatus, priority: 'high' as Priority, due: daysAgo(7) },
    { title: 'Office Workstation & Hardware Upgrade', desc: 'Review ergonomic equipment requests and procure developer monitors', status: 'backlog' as TaskStatus, priority: 'low' as Priority, due: daysFromNow(20) },
  ];

  proj1Tasks.forEach((t, i) => {
    const taskId = `task-p1-${i}`;
    const assignee = pick(userIds.slice(0, 3)); // Don't assign to viewer
    tasks.push({
      id: taskId, projectId: 'proj-1', title: t.title, description: t.desc,
      status: t.status, priority: t.priority, dueDate: t.due, assigneeId: assignee,
      labelIds: i % 3 === 0 ? ['label-feature'] : i % 3 === 1 ? ['label-urgent'] : ['label-improvement'],
      order: i, createdAt: daysAgo(60 - i), updatedAt: daysAgo(Math.max(0, 5 - i)), createdBy: 'user-alex',
    });

    // Add subtasks to some tasks
    if (i < 5) {
      const subtaskTitles = i === 0
        ? ['Analyze client requirements', 'Draft executive summary & scope', 'Prepare pricing & deliverables slides', 'Schedule presentation meeting']
        : i === 1
        ? ['Review unassigned backlog issues', 'Estimate story points with team', 'Define sprint goal & timeline']
        : i === 2
        ? ['Run automated test suite', 'Verify responsive design on mobile', 'Approve GitHub PR #42', 'Deploy to staging environment']
        : i === 3
        ? ['Collect vendor invoices & receipts', 'Review team expense claims', 'Reconcile company bank statement']
        : ['Review candidate resume & GitHub portfolio', 'Conduct coding session & architecture discussion', 'Submit interview feedback form'];

      subtaskTitles.forEach((st, si) => {
        subtasks.push({
          id: `st-p1-${i}-${si}`, taskId, title: st,
          completed: t.status === 'done' ? true : si < Math.floor(subtaskTitles.length / 2),
          order: si, createdAt: daysAgo(55 - i),
        });
      });
    }
  });

  // Project 2 - Mobile App v2 tasks
  const proj2Tasks = [
    { title: 'User research interviews', desc: 'Conduct interviews with 10 power users for feature feedback', status: 'done' as TaskStatus, priority: 'high' as Priority, due: daysAgo(15) },
    { title: 'Define v2 feature set', desc: 'Finalize feature list based on user feedback and business goals', status: 'done' as TaskStatus, priority: 'urgent' as Priority, due: daysAgo(12) },
    { title: 'Update app architecture', desc: 'Migrate to new state management and navigation patterns', status: 'done' as TaskStatus, priority: 'high' as Priority, due: daysAgo(8) },
    { title: 'Push notification system', desc: 'Implement push notifications with customizable preferences', status: 'in_progress' as TaskStatus, priority: 'high' as Priority, due: daysFromNow(2) },
    { title: 'Offline mode support', desc: 'Add offline data caching and sync mechanism', status: 'in_progress' as TaskStatus, priority: 'urgent' as Priority, due: daysFromNow(5) },
    { title: 'Dark mode implementation', desc: 'Complete dark mode theme for all screens', status: 'in_progress' as TaskStatus, priority: 'medium' as Priority, due: daysFromNow(4) },
    { title: 'Biometric authentication', desc: 'Add Face ID and fingerprint login support', status: 'todo' as TaskStatus, priority: 'high' as Priority, due: daysFromNow(8) },
    { title: 'In-app purchase flow', desc: 'Implement subscription and one-time purchase flows', status: 'todo' as TaskStatus, priority: 'high' as Priority, due: daysFromNow(12) },
    { title: 'Widget development', desc: 'Create home screen widgets for key metrics', status: 'todo' as TaskStatus, priority: 'medium' as Priority, due: daysFromNow(15) },
    { title: 'App Store optimization', desc: 'Update screenshots, description, and keywords for ASO', status: 'backlog' as TaskStatus, priority: 'medium' as Priority, due: daysFromNow(20) },
    { title: 'Beta testing program', desc: 'Set up TestFlight/Play Store beta channel and recruit testers', status: 'backlog' as TaskStatus, priority: 'medium' as Priority, due: daysFromNow(18) },
    { title: 'Crash reporting setup', desc: 'Integrate Sentry/Crashlytics for crash monitoring', status: 'review' as TaskStatus, priority: 'high' as Priority, due: daysFromNow(1) },
  ];

  proj2Tasks.forEach((t, i) => {
    const taskId = `task-p2-${i}`;
    tasks.push({
      id: taskId, projectId: 'proj-2', title: t.title, description: t.desc,
      status: t.status, priority: t.priority, dueDate: t.due, assigneeId: pick(['user-sarah', 'user-alex', 'user-daniel']),
      labelIds: i % 4 === 0 ? ['label-feature'] : i % 4 === 1 ? ['label-bug'] : i % 4 === 2 ? ['label-improvement'] : ['label-testing'],
      order: i, createdAt: daysAgo(45 - i), updatedAt: daysAgo(Math.max(0, 3 - i)), createdBy: 'user-sarah',
    });

    if (i < 3) {
      ['Research phase', 'Implementation', 'Testing'].forEach((st, si) => {
        subtasks.push({
          id: `st-p2-${i}-${si}`, taskId, title: st,
          completed: t.status === 'done', order: si, createdAt: daysAgo(40 - i),
        });
      });
    }
  });

  // Project 3 - Q4 Marketing tasks
  const proj3Tasks = [
    { title: 'Define campaign objectives', desc: 'Set SMART goals and KPIs for Q4 campaigns', status: 'done' as TaskStatus, priority: 'high' as Priority, due: daysAgo(5) },
    { title: 'Audience segmentation', desc: 'Create detailed audience segments for targeting', status: 'done' as TaskStatus, priority: 'high' as Priority, due: daysAgo(3) },
    { title: 'Content strategy document', desc: 'Outline content pillars, formats, and distribution channels', status: 'in_progress' as TaskStatus, priority: 'high' as Priority, due: daysFromNow(2) },
    { title: 'Design social media templates', desc: 'Create branded templates for Instagram, Twitter, LinkedIn', status: 'in_progress' as TaskStatus, priority: 'medium' as Priority, due: daysFromNow(5) },
    { title: 'Write blog post series', desc: 'Draft 5 blog posts for the thought leadership series', status: 'todo' as TaskStatus, priority: 'medium' as Priority, due: daysFromNow(10) },
    { title: 'Email campaign setup', desc: 'Create nurture sequences in email automation platform', status: 'todo' as TaskStatus, priority: 'medium' as Priority, due: daysFromNow(8) },
    { title: 'Influencer outreach', desc: 'Identify and reach out to industry influencers for partnerships', status: 'todo' as TaskStatus, priority: 'low' as Priority, due: daysFromNow(15) },
    { title: 'PPC campaign optimization', desc: 'Optimize Google Ads and Meta Ads campaigns', status: 'backlog' as TaskStatus, priority: 'high' as Priority, due: daysFromNow(20) },
    { title: 'Analytics dashboard setup', desc: 'Build marketing analytics dashboard in Data Studio', status: 'backlog' as TaskStatus, priority: 'medium' as Priority, due: daysFromNow(18) },
    { title: 'End-of-quarter report', desc: 'Compile campaign performance report and ROI analysis', status: 'backlog' as TaskStatus, priority: 'medium' as Priority, due: daysFromNow(30) },
  ];

  proj3Tasks.forEach((t, i) => {
    const taskId = `task-p3-${i}`;
    tasks.push({
      id: taskId, projectId: 'proj-3', title: t.title, description: t.desc,
      status: t.status, priority: t.priority, dueDate: t.due, assigneeId: pick(['user-alex', 'user-sarah']),
      labelIds: i < 3 ? ['label-research'] : ['label-feature'],
      order: i, createdAt: daysAgo(30 - i), updatedAt: daysAgo(Math.max(0, 2 - i)), createdBy: 'user-alex',
    });
  });

  // Project 4 - API Platform tasks
  const proj4Tasks = [
    { title: 'API design review', desc: 'Review and finalize RESTful API design document', status: 'done' as TaskStatus, priority: 'high' as Priority, due: daysAgo(8) },
    { title: 'Authentication middleware', desc: 'Implement OAuth2 and API key authentication', status: 'in_progress' as TaskStatus, priority: 'urgent' as Priority, due: daysFromNow(3) },
    { title: 'Rate limiting service', desc: 'Build rate limiting with Redis for API endpoints', status: 'in_progress' as TaskStatus, priority: 'high' as Priority, due: daysFromNow(5) },
    { title: 'API documentation generator', desc: 'Set up automated API docs with OpenAPI/Swagger', status: 'todo' as TaskStatus, priority: 'medium' as Priority, due: daysFromNow(10) },
    { title: 'Webhook system', desc: 'Implement webhook registration and event delivery', status: 'todo' as TaskStatus, priority: 'high' as Priority, due: daysFromNow(12) },
    { title: 'SDK development (JavaScript)', desc: 'Create JavaScript/TypeScript SDK for the API', status: 'todo' as TaskStatus, priority: 'medium' as Priority, due: daysFromNow(15) },
    { title: 'SDK development (Python)', desc: 'Create Python SDK for the API', status: 'backlog' as TaskStatus, priority: 'medium' as Priority, due: daysFromNow(20) },
    { title: 'Developer portal', desc: 'Build developer portal with guides and examples', status: 'backlog' as TaskStatus, priority: 'medium' as Priority, due: daysFromNow(25) },
    { title: 'Load testing', desc: 'Run load tests and optimize performance bottlenecks', status: 'backlog' as TaskStatus, priority: 'high' as Priority, due: daysFromNow(18) },
    { title: 'API versioning strategy', desc: 'Define and implement API versioning approach', status: 'review' as TaskStatus, priority: 'high' as Priority, due: daysFromNow(1) },
  ];

  proj4Tasks.forEach((t, i) => {
    const taskId = `task-p4-${i}`;
    tasks.push({
      id: taskId, projectId: 'proj-4', title: t.title, description: t.desc,
      status: t.status, priority: t.priority, dueDate: t.due, assigneeId: pick(['user-sarah', 'user-daniel', 'user-alex']),
      labelIds: i % 2 === 0 ? ['label-feature'] : ['label-docs'],
      order: i, createdAt: daysAgo(20 - i), updatedAt: daysAgo(Math.max(0, 2 - i)), createdBy: 'user-sarah',
    });
  });

  // Project 5 - Home Maintenance & Chores (ws-2)
  const proj5Tasks = [
    { title: 'Weekly Grocery & Household Shopping', desc: 'Buy fresh vegetables, milk, eggs, bread, pantry essentials and cleaning supplies', status: 'in_progress' as TaskStatus, priority: 'high' as Priority, due: daysFromNow(1) },
    { title: 'Pay Monthly Household Utility Bills', desc: 'Pay electricity, gas, water, and home fiber internet WiFi bills before due date', status: 'todo' as TaskStatus, priority: 'urgent' as Priority, due: daysFromNow(2) },
    { title: 'Kitchen Plumbing & Sink Leak Repair', desc: 'Inspect kitchen pipe leakage, replace worn rubber washer, and seal pipe joints', status: 'backlog' as TaskStatus, priority: 'high' as Priority, due: daysFromNow(5) },
    { title: 'Whole House Deep Cleaning & Organization', desc: 'Vacuum carpets, wash window curtains, deep clean kitchen counters and bathrooms', status: 'todo' as TaskStatus, priority: 'medium' as Priority, due: daysFromNow(4) },
    { title: 'AC Servicing & Filter Cleaning', desc: 'Wash internal dust filters and schedule technician for compressor service', status: 'review' as TaskStatus, priority: 'medium' as Priority, due: daysFromNow(3) },
    { title: 'Car & Bike Routine Maintenance', desc: 'Perform engine oil change, check brake pads, tire pressure, and battery health', status: 'backlog' as TaskStatus, priority: 'medium' as Priority, due: daysFromNow(7) },
    { title: 'Monthly Family Medicines & Health Checkup', desc: 'Refill monthly prescription medicines and book routine health checkup', status: 'done' as TaskStatus, priority: 'high' as Priority, due: daysAgo(2) },
  ];

  proj5Tasks.forEach((t, i) => {
    const taskId = `task-p5-${i}`;
    tasks.push({
      id: taskId, projectId: 'proj-5', title: t.title, description: t.desc,
      status: t.status, priority: t.priority, dueDate: t.due, assigneeId: pick(['user-alex', 'user-sarah']),
      labelIds: i < 2 ? ['label-client'] : ['label-internal'],
      order: i, createdAt: daysAgo(40 - i * 3), updatedAt: daysAgo(Math.max(0, 3 - i)), createdBy: 'user-alex',
    });

    // Subtasks for home chores
    const homeSubtaskMap: Record<number, string[]> = {
      0: ['Fresh milk, eggs, and whole wheat bread', 'Potatoes, onions, tomatoes, and seasonal fruits', 'Rice, lentils, and cooking oil', 'Laundry detergent & dishwasher soap'],
      1: ['Pay Electricity bill online via banking app', 'Pay Sui Gas bill', 'Pay Home High-Speed Fiber Internet / WiFi', 'Pay Water & Sanitation tax'],
      2: ['Inspect leak under the sink basin', 'Buy plumbing Teflon tape and new rubber washer', 'Tighten pipe connection or call local plumber'],
      3: ['Vacuum and mop living room & bedroom floors', 'Wipe down kitchen cabinets and stove', 'Deep clean bathrooms and mirrors', 'Organize clothes wardrobe'],
      4: ['Remove and wash indoor AC air filters', 'Clean outdoor compressor coils', 'Check remote batteries & cooling performance'],
      5: ['Engine oil & oil filter replacement', 'Check brake fluid and brake pads', 'Inspect tire air pressure and wash vehicle'],
      6: ['Check current prescription medicine stock', 'Order monthly medicines online', 'Book routine blood pressure and sugar check'],
    };

    if (homeSubtaskMap[i]) {
      homeSubtaskMap[i].forEach((st, si) => {
        subtasks.push({
          id: `st-p5-${i}-${si}`, taskId, title: st,
          completed: t.status === 'done' ? true : si < Math.floor(homeSubtaskMap[i].length / 2),
          order: si, createdAt: daysAgo(35 - i),
        });
      });
    }
  });

  // Project 6 - Household Budget & Bills (ws-2)
  const proj6Tasks = [
    { title: 'Monthly Salary Allocation & Household Budget', desc: 'Distribute monthly income into savings, rent, utilities, groceries, and investments', status: 'done' as TaskStatus, priority: 'high' as Priority, due: daysAgo(10) },
    { title: 'Review Solar Panel Proposal to Cut Bills', desc: 'Evaluate 5kW vs 7kW on-grid solar system quotes and net metering payback period', status: 'in_progress' as TaskStatus, priority: 'high' as Priority, due: daysFromNow(4) },
    { title: 'Emergency Family Reserve Fund Deposit', desc: 'Transfer 15% of monthly savings into high-yield emergency reserve fund', status: 'todo' as TaskStatus, priority: 'medium' as Priority, due: daysFromNow(8) },
    { title: 'Audit Past Month Food & Dining Out Expenses', desc: 'Analyze grocery spending vs food deliveries and optimize monthly budget', status: 'todo' as TaskStatus, priority: 'low' as Priority, due: daysFromNow(12) },
  ];

  proj6Tasks.forEach((t, i) => {
    const taskId = `task-p6-${i}`;
    tasks.push({
      id: taskId, projectId: 'proj-6', title: t.title, description: t.desc,
      status: t.status, priority: t.priority, dueDate: t.due, assigneeId: pick(['user-alex', 'user-daniel']),
      labelIds: ['label-internal'],
      order: i, createdAt: daysAgo(25 - i * 2), updatedAt: daysAgo(Math.max(0, 2 - i)), createdBy: 'user-alex',
    });
  });

  // Project 7 - Personal Health & Fitness (ws-2)
  const proj7Tasks = [
    { title: 'Morning Jog & 10,000 Steps Daily Routine', desc: 'Maintain consistent 30-minute cardio and walk 10,000 steps daily', status: 'in_progress' as TaskStatus, priority: 'high' as Priority, due: daysFromNow(2) },
    { title: 'Annual Family Dental & Eye Vision Checkup', desc: 'Schedule appointments for annual dental cleaning and vision check', status: 'todo' as TaskStatus, priority: 'medium' as Priority, due: daysFromNow(10) },
    { title: 'Daily 30-Minute Reading Habit', desc: 'Read personal growth, engineering, or literature books daily before bed', status: 'done' as TaskStatus, priority: 'medium' as Priority, due: daysAgo(3) },
    { title: 'Daily Water Intake & Hydration Tracker', desc: 'Drink at least 3 liters of fresh water daily to stay hydrated', status: 'in_progress' as TaskStatus, priority: 'low' as Priority, due: daysFromNow(5) },
  ];

  proj7Tasks.forEach((t, i) => {
    const taskId = `task-p7-${i}`;
    tasks.push({
      id: taskId, projectId: 'proj-7', title: t.title, description: t.desc,
      status: t.status, priority: t.priority, dueDate: t.due, assigneeId: pick(['user-sarah', 'user-alex']),
      labelIds: ['label-internal'],
      order: i, createdAt: daysAgo(15 - i * 2), updatedAt: daysAgo(Math.max(0, 1)), createdBy: 'user-sarah',
    });
  });

  // ── Comments ──
  const commentData = [
    { taskId: 'task-p1-4', authorId: 'user-sarah', content: 'I think we should use a card-based layout for the product page. It will work better on mobile.', mentions: [] },
    { taskId: 'task-p1-4', authorId: 'user-alex', content: 'Good idea @Sarah Chen. Let\'s also consider adding a comparison view for products.', mentions: ['user-sarah'] },
    { taskId: 'task-p1-4', authorId: 'user-daniel', content: 'I can start working on the responsive grid component once the wireframe is approved.', mentions: [] },
    { taskId: 'task-p1-5', authorId: 'user-alex', content: 'Navigation should support mega-menu for the enterprise section. @Daniel Kim can you look into this?', mentions: ['user-daniel'] },
    { taskId: 'task-p1-5', authorId: 'user-daniel', content: 'Sure, I\'ll research some implementation patterns and share options by EOD.', mentions: [] },
    { taskId: 'task-p2-3', authorId: 'user-sarah', content: 'Push notifications need to respect the user\'s quiet hours setting. Let\'s add that to the spec.', mentions: [] },
    { taskId: 'task-p2-3', authorId: 'user-daniel', content: 'Agreed. I\'ll update the notification preferences schema to include quiet hours.', mentions: [] },
    { taskId: 'task-p2-4', authorId: 'user-alex', content: 'Offline mode is critical for the v2 launch. @Sarah Chen should we prioritize this over dark mode?', mentions: ['user-sarah'] },
    { taskId: 'task-p2-4', authorId: 'user-sarah', content: 'Yes, let\'s prioritize offline. Dark mode can follow in a patch release.', mentions: [] },
    { taskId: 'task-p3-2', authorId: 'user-alex', content: 'Content strategy needs to align with the SEO keyword research we did last month.', mentions: [] },
    { taskId: 'task-p4-1', authorId: 'user-sarah', content: 'OAuth2 implementation is mostly done. Need to test refresh token flow.', mentions: [] },
    { taskId: 'task-p4-1', authorId: 'user-daniel', content: 'I can help with testing. Let me set up the test environment.', mentions: [] },
  ];

  commentData.forEach((c, i) => {
    comments.push({
      id: `comment-${i}`, taskId: c.taskId, authorId: c.authorId, content: c.content,
      mentions: c.mentions, createdAt: hoursAgo(48 - i * 4), updatedAt: hoursAgo(48 - i * 4),
    });
  });

  // ── Activity Events ──
  const activityData = [
    { projectId: 'proj-1', taskId: 'task-p1-0', userId: 'user-alex', action: 'completed' as const, target: 'Audit current website analytics' },
    { projectId: 'proj-1', taskId: 'task-p1-1', userId: 'user-sarah', action: 'completed' as const, target: 'Competitor analysis report' },
    { projectId: 'proj-1', taskId: 'task-p1-4', userId: 'user-alex', action: 'status_changed' as const, target: 'Design product page layout' },
    { projectId: 'proj-1', taskId: 'task-p1-4', userId: 'user-sarah', action: 'commented' as const, target: 'Design product page layout' },
    { projectId: 'proj-1', taskId: 'task-p1-5', userId: 'user-daniel', action: 'assigned' as const, target: 'Build navigation component' },
    { projectId: 'proj-2', taskId: 'task-p2-0', userId: 'user-sarah', action: 'completed' as const, target: 'User research interviews' },
    { projectId: 'proj-2', taskId: 'task-p2-3', userId: 'user-sarah', action: 'created' as const, target: 'Push notification system' },
    { projectId: 'proj-2', taskId: 'task-p2-4', userId: 'user-alex', action: 'assigned' as const, target: 'Offline mode support' },
    { projectId: 'proj-2', taskId: 'task-p2-5', userId: 'user-daniel', action: 'status_changed' as const, target: 'Dark mode implementation' },
    { projectId: 'proj-3', taskId: 'task-p3-0', userId: 'user-alex', action: 'completed' as const, target: 'Define campaign objectives' },
    { projectId: 'proj-3', taskId: 'task-p3-2', userId: 'user-alex', action: 'edited' as const, target: 'Content strategy document' },
    { projectId: 'proj-4', taskId: 'task-p4-1', userId: 'user-sarah', action: 'status_changed' as const, target: 'Authentication middleware' },
    { projectId: 'proj-4', taskId: 'task-p4-9', userId: 'user-daniel', action: 'status_changed' as const, target: 'API versioning strategy' },
  ];

  activityData.forEach((a, i) => {
    const ws = projects.find(p => p.id === a.projectId)?.workspaceId || 'ws-1';
    activity.push({
      id: `act-${i}`, workspaceId: ws, projectId: a.projectId, taskId: a.taskId,
      userId: a.userId, action: a.action, target: a.target,
      timestamp: hoursAgo(72 - i * 5),
    });
  });

  // ── Notifications ──
  const notifications: Notification[] = [
    { id: 'notif-1', userId: 'user-alex', type: 'assignment', title: 'New Assignment', message: 'You were assigned to "Design product page layout"', link: '/workspaces/ws-1/projects/proj-1', read: false, createdAt: hoursAgo(2) },
    { id: 'notif-2', userId: 'user-alex', type: 'mention', title: 'Mentioned in Comment', message: 'Sarah Chen mentioned you in a comment on "Offline mode support"', link: '/workspaces/ws-1/projects/proj-2', read: false, createdAt: hoursAgo(5) },
    { id: 'notif-3', userId: 'user-alex', type: 'due_date', title: 'Task Due Soon', message: '"Create pricing page" is due in 3 days', link: '/workspaces/ws-1/projects/proj-1', read: false, createdAt: hoursAgo(8) },
    { id: 'notif-4', userId: 'user-alex', type: 'comment', title: 'New Comment', message: 'Daniel Kim commented on "Build navigation component"', link: '/workspaces/ws-1/projects/proj-1', read: true, createdAt: hoursAgo(24) },
    { id: 'notif-5', userId: 'user-alex', type: 'status_change', title: 'Task Completed', message: '"Competitor analysis report" was marked as done', link: '/workspaces/ws-1/projects/proj-1', read: true, createdAt: hoursAgo(48) },
    { id: 'notif-6', userId: 'user-sarah', type: 'assignment', title: 'New Assignment', message: 'You were assigned to "Rate limiting service"', link: '/workspaces/ws-1/projects/proj-4', read: false, createdAt: hoursAgo(3) },
    { id: 'notif-7', userId: 'user-sarah', type: 'due_date', title: 'Task Overdue', message: '"Push notification system" is overdue', link: '/workspaces/ws-1/projects/proj-2', read: false, createdAt: hoursAgo(6) },
    { id: 'notif-8', userId: 'user-daniel', type: 'mention', title: 'Mentioned in Comment', message: 'Alex Morgan mentioned you in "Build navigation component"', link: '/workspaces/ws-1/projects/proj-1', read: false, createdAt: hoursAgo(4) },
  ];

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
