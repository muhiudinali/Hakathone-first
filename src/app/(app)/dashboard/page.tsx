'use client';

import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectCurrentUser, selectCurrentWorkspace, selectDashboardStats,
  selectMyTasks, selectRecentActivity, selectWorkspaceProjects,
  selectAllUsers, selectOverdueTasks, selectAllTasks,
} from '@/store/selectors';
import { setCurrentProject } from '@/store/slices/projectSlice';
import { setCreateTaskOpen, setCreateProjectOpen } from '@/store/slices/uiSlice';
import { Avatar, AvatarGroup, Badge, EmptyState, Button } from '@/components/ui';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/types';
import { formatShortDate, formatRelativeTime, isOverdue } from '@/lib/utils';
import {
  FolderKanban, CheckCircle2, AlertTriangle, Clock, Activity,
  ArrowRight, TrendingUp, Briefcase, Plus,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const workspace = useAppSelector(selectCurrentWorkspace);
  const stats = useAppSelector(selectDashboardStats);
  const myTasks = useAppSelector(selectMyTasks);
  const recentActivity = useAppSelector(selectRecentActivity);
  const projects = useAppSelector(selectWorkspaceProjects);
  const users = useAppSelector(selectAllUsers);
  const overdueTasks = useAppSelector(selectOverdueTasks);
  const allTasks = useAppSelector(selectAllTasks);

  const upcomingTasks = myTasks
    .filter(t => t.dueDate)
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    .slice(0, 5);

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: FolderKanban, color: '#3B82F6', bg: 'bg-info/10' },
    { label: 'Active Tasks', value: stats.activeTasks, icon: TrendingUp, color: '#F59E0B', bg: 'bg-warning/10' },
    { label: 'Completed', value: stats.completedTasks, icon: CheckCircle2, color: '#10B981', bg: 'bg-success/10' },
    { label: 'Overdue', value: stats.overdueTasks, icon: AlertTriangle, color: '#EF4444', bg: 'bg-error/10' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome & Quick Action */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-heading-xl text-text-primary">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {currentUser?.name?.split(' ')[0]}
          </h1>
          <p className="text-body-md text-text-secondary mt-1">
            Here&apos;s what&apos;s happening in {workspace?.name}
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => dispatch(setCreateTaskOpen(true))}
          className="shadow-sm font-medium"
        >
          New Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(stat => (
          <div key={stat.label} className="bg-bg-secondary border border-border-primary rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.bg}`}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
            <div className="text-caption text-text-secondary mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Tasks */}
        <div className="lg:col-span-2 bg-bg-secondary border border-border-primary rounded-xl">
          <div className="px-5 py-4 border-b border-border-primary flex items-center justify-between">
            <h2 className="text-heading-sm text-text-primary">My Tasks</h2>
            <button
              onClick={() => router.push('/my-tasks')}
              className="text-caption text-text-link hover:underline cursor-pointer flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-border-secondary">
            {myTasks.slice(0, 6).map(task => (
              <div key={task.id} className="px-5 py-3 flex items-center gap-3 hover:bg-bg-hover transition-colors cursor-pointer">
                <div
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: STATUS_CONFIG[task.status].color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm text-text-primary truncate">{task.title}</p>
                  <p className="text-caption text-text-tertiary">{STATUS_CONFIG[task.status].label}</p>
                </div>
                <Badge
                  size="sm"
                  color={PRIORITY_CONFIG[task.priority].color}
                >
                  {PRIORITY_CONFIG[task.priority].label}
                </Badge>
                {task.dueDate && (
                  <span className={`text-caption ${isOverdue(task.dueDate) ? 'text-error font-medium' : 'text-text-tertiary'}`}>
                    {formatShortDate(task.dueDate)}
                  </span>
                )}
              </div>
            ))}
            {myTasks.length === 0 && (
              <div className="px-5 py-10 text-center text-body-sm text-text-tertiary">
                No tasks assigned to you
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-bg-secondary border border-border-primary rounded-xl">
          <div className="px-5 py-4 border-b border-border-primary">
            <h2 className="text-heading-sm text-text-primary">Recent Activity</h2>
          </div>
          <div className="divide-y divide-border-secondary max-h-[400px] overflow-y-auto">
            {recentActivity.slice(0, 10).map(event => {
              const user = users[event.userId];
              return (
                <div key={event.id} className="px-5 py-3 flex items-start gap-3">
                  <Avatar name={user?.name || 'Unknown'} size="xs" className="mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-body-sm text-text-primary">
                      <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                      {' '}<span className="text-text-secondary">{event.action.replace('_', ' ')}</span>
                      {' '}<span className="text-text-primary">{event.target}</span>
                    </p>
                    <p className="text-caption text-text-tertiary mt-0.5">{formatRelativeTime(event.timestamp)}</p>
                  </div>
                </div>
              );
            })}
            {recentActivity.length === 0 && (
              <div className="px-5 py-8 text-center text-body-sm text-text-tertiary">No recent activity</div>
            )}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-heading-sm text-text-primary">Projects</h2>
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus size={14} />}
            onClick={() => dispatch(setCreateProjectOpen(true))}
          >
            Create Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-8 text-center">
            <FolderKanban size={40} className="mx-auto text-text-tertiary mb-3 opacity-60" />
            <h3 className="text-body-md font-medium text-text-primary">No projects yet</h3>
            <p className="text-body-sm text-text-secondary mt-1 mb-4">
              Get started by creating your first project to organize your team&apos;s tasks and boards.
            </p>
            <Button
              variant="primary"
              icon={<Plus size={15} />}
              onClick={() => dispatch(setCreateProjectOpen(true))}
            >
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => {
            const projectTasks = Object.values(allTasks || {}).filter(t => t.projectId === project.id);
            const completedCount = projectTasks.filter(t => t.status === 'done').length;
            const totalCount = projectTasks.length;
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <button
                key={project.id}
                onClick={() => {
                  dispatch(setCurrentProject(project.id));
                  router.push(`/workspaces/${workspace?.id}/projects/${project.id}`);
                }}
                className="bg-bg-secondary border border-border-primary rounded-xl p-5 hover:shadow-md hover:border-border-focus/30 transition-all duration-200 text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: `${project.color}15` }}>
                    {project.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-body-md font-semibold text-text-primary truncate group-hover:text-text-link transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-caption text-text-tertiary">{totalCount} tasks</p>
                  </div>
                </div>
                {project.description && (
                  <p className="text-body-sm text-text-secondary line-clamp-2 mb-3">{project.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-3">
                    <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%`, backgroundColor: project.color }}
                      />
                    </div>
                  </div>
                  <span className="text-caption text-text-tertiary font-medium">{progress}%</span>
                </div>
              </button>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
