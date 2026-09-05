'use client';

import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectCurrentUser, selectCurrentWorkspace, selectDashboardStats,
  selectMyTasks, selectRecentActivity, selectWorkspaceProjects,
  selectAllUsers, selectOverdueTasks, selectAllTasks,
} from '@/store/selectors';
import { setCurrentProject } from '@/store/slices/projectSlice';
import { setCreateTaskOpen, setCreateProjectOpen, setTaskDetailId } from '@/store/slices/uiSlice';
import { Avatar, AvatarGroup, Badge, EmptyState, Button } from '@/components/ui';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/types';
import { formatShortDate, formatRelativeTime, isOverdue } from '@/lib/utils';
import {
  FolderKanban, CheckCircle2, AlertTriangle, Clock, Activity,
  ArrowRight, TrendingUp, Briefcase, Plus, Sparkles, Layers, ArrowUpRight,
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
  const subtasks = useAppSelector(s => s.tasks.subtasks);

  const upcomingTasks = myTasks
    .filter(t => t.dueDate)
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    .slice(0, 5);

  const statCards = [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderKanban,
      color: '#4F46E5',
      badge: 'Active Workspaces',
      bgGradient: 'from-indigo-500/10 to-indigo-500/5',
      borderColor: 'border-indigo-500/20',
      iconBoxBg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'Active Tasks',
      value: stats.activeTasks,
      icon: TrendingUp,
      color: '#F59E0B',
      badge: 'In Progress',
      bgGradient: 'from-amber-500/10 to-amber-500/5',
      borderColor: 'border-amber-500/20',
      iconBoxBg: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Completed Tasks',
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: '#10B981',
      badge: 'Done & Shipped',
      bgGradient: 'from-emerald-500/10 to-emerald-500/5',
      borderColor: 'border-emerald-500/20',
      iconBoxBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Overdue Tasks',
      value: stats.overdueTasks,
      icon: AlertTriangle,
      color: '#EF4444',
      badge: 'Needs Attention',
      bgGradient: 'from-rose-500/10 to-rose-500/5',
      borderColor: 'border-rose-500/20',
      iconBoxBg: 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome & Quick Action */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Sparkles size={12} /> Overview
            </span>
            <span className="text-xs text-text-tertiary">Workspace: {workspace?.name}</span>
          </div>
          <h1 className="text-heading-xl text-text-primary">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {currentUser?.name?.split(' ')[0]}
          </h1>
          <p className="text-body-md text-text-secondary mt-0.5">
            Here&apos;s your daily command center and mission progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => dispatch(setCreateTaskOpen(true))}
            className="shadow-md shadow-indigo-500/20"
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Cards - Classic Glass UI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(stat => (
          <div
            key={stat.label}
            className={`glass-card rounded-2xl p-5 border border-white/70 dark:border-white/10 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-sm`}
          >
            {/* Ambient Background Glow */}
            <div
              className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none group-hover:opacity-35 transition-opacity"
              style={{ backgroundColor: stat.color }}
            />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center border shadow-xs transition-transform duration-300 group-hover:scale-110 ${stat.iconBoxBg}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[11px] font-medium text-text-tertiary px-2 py-0.5 rounded-full bg-bg-tertiary/60 border border-border-primary/60">
                {stat.badge}
              </span>
            </div>
            <div className="text-3xl font-extrabold text-text-primary tracking-tight font-heading relative z-10">
              {stat.value}
            </div>
            <div className="text-caption text-text-secondary mt-1 font-medium relative z-10 flex items-center justify-between">
              <span>{stat.label}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-accent-primary flex items-center text-[10px]">
                View <ArrowUpRight size={12} className="ml-0.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Panels: My Tasks + Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Tasks Panel */}
        <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden border border-white/70 dark:border-white/10 shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-border-primary/80 flex items-center justify-between glass-header">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <h2 className="text-heading-sm text-text-primary">My Priority Tasks</h2>
                <p className="text-caption text-text-tertiary">Assigned to you across active projects</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/my-tasks')}
              className="text-caption text-accent-primary hover:text-accent-primary-hover font-semibold cursor-pointer flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg hover:bg-accent-primary/10"
            >
              View all <ArrowRight size={13} />
            </button>
          </div>

          <div className="divide-y divide-border-secondary/60 flex-1">
            {myTasks.slice(0, 6).map(task => (
              <div
                key={task.id}
                onClick={() => dispatch(setTaskDetailId(task.id))}
                className="px-6 py-3.5 flex items-center gap-3.5 hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-150 cursor-pointer group"
              >
                <div
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0 ring-4 ring-transparent group-hover:ring-accent-primary/20 transition-all"
                  style={{ backgroundColor: STATUS_CONFIG[task.status].color }}
                  title={STATUS_CONFIG[task.status].label}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium text-text-primary truncate group-hover:text-accent-primary transition-colors">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-caption text-text-tertiary">{STATUS_CONFIG[task.status].label}</span>
                    {subtasks[task.id] && subtasks[task.id].length > 0 && (
                      <span className="text-caption text-text-tertiary flex items-center gap-1">
                        • <Layers size={11} /> {subtasks[task.id].length} subtasks
                      </span>
                    )}
                  </div>
                </div>
                <Badge
                  size="sm"
                  color={PRIORITY_CONFIG[task.priority].color}
                >
                  {PRIORITY_CONFIG[task.priority].label}
                </Badge>
                {task.dueDate && (
                  <span className={`text-caption flex items-center gap-1 px-2 py-0.5 rounded-md ${
                    isOverdue(task.dueDate)
                      ? 'text-error bg-error/10 border border-error/20 font-medium'
                      : 'text-text-tertiary bg-bg-tertiary/50'
                  }`}>
                    <Clock size={11} />
                    {formatShortDate(task.dueDate)}
                  </span>
                )}
              </div>
            ))}
            {myTasks.length === 0 && (
              <div className="px-6 py-12 text-center text-body-sm text-text-tertiary">
                <CheckCircle2 size={36} className="mx-auto text-text-tertiary opacity-40 mb-2" />
                No tasks assigned to you right now. You&apos;re all caught up!
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Panel */}
        <div className="glass-card rounded-2xl overflow-hidden border border-white/70 dark:border-white/10 shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-border-primary/80 flex items-center justify-between glass-header">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <Activity size={16} />
              </div>
              <h2 className="text-heading-sm text-text-primary">Recent Activity</h2>
            </div>
            <button
              onClick={() => router.push('/activity')}
              className="text-caption text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
            >
              History
            </button>
          </div>

          <div className="divide-y divide-border-secondary/60 max-h-[420px] overflow-y-auto flex-1">
            {recentActivity.slice(0, 8).map(event => {
              const user = users[event.userId];
              return (
                <div key={event.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                  <Avatar name={user?.name || 'Unknown'} size="xs" className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm text-text-primary leading-snug">
                      <span className="font-semibold text-text-primary">{user?.name?.split(' ')[0]}</span>
                      {' '}<span className="text-text-secondary">{event.action.replace('_', ' ')}</span>
                      {' '}<span className="font-medium text-text-primary">&quot;{event.target}&quot;</span>
                    </p>
                    <p className="text-caption text-text-tertiary mt-0.5 flex items-center gap-1">
                      <Clock size={11} /> {formatRelativeTime(event.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
            {recentActivity.length === 0 && (
              <div className="px-5 py-12 text-center text-body-sm text-text-tertiary">
                No recent activity in this workspace
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderKanban size={18} className="text-accent-primary" />
            <h2 className="text-heading-sm text-text-primary">Projects</h2>
            <span className="text-xs text-text-tertiary bg-bg-tertiary px-2 py-0.5 rounded-full font-medium">
              {projects.length}
            </span>
          </div>
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
          <div className="glass-card border border-white/70 dark:border-white/10 rounded-2xl p-10 text-center">
            <FolderKanban size={44} className="mx-auto text-text-tertiary mb-3 opacity-60" />
            <h3 className="text-body-md font-semibold text-text-primary">No projects yet</h3>
            <p className="text-body-sm text-text-secondary mt-1 mb-5 max-w-md mx-auto">
              Get started by creating your first project to organize your team&apos;s tasks, Kanban boards, and milestones.
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
                  className="glass-card rounded-2xl p-5 border border-white/70 dark:border-white/10 hover:-translate-y-1 hover:shadow-xl hover:border-accent-primary/40 transition-all duration-300 text-left cursor-pointer group relative overflow-hidden"
                >
                  {/* Subtle top specular accent */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 opacity-70 transition-opacity group-hover:opacity-100"
                    style={{ backgroundColor: project.color }}
                  />

                  <div className="flex items-center gap-3.5 mb-3 pt-1">
                    <div
                      className="h-11 w-11 rounded-xl flex items-center justify-center text-xl shadow-xs border transition-transform duration-300 group-hover:scale-105"
                      style={{
                        backgroundColor: `${project.color}15`,
                        borderColor: `${project.color}30`,
                      }}
                    >
                      {project.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-body-md font-bold text-text-primary truncate group-hover:text-accent-primary transition-colors font-heading">
                        {project.name}
                      </h3>
                      <p className="text-caption text-text-tertiary flex items-center gap-1.5 mt-0.5">
                        <Layers size={11} /> {totalCount} {totalCount === 1 ? 'task' : 'tasks'} • {completedCount} done
                      </p>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-body-sm text-text-secondary line-clamp-2 mb-4 leading-relaxed">
                      {project.description}
                    </p>
                  )}

                  <div className="mt-auto pt-2">
                    <div className="flex items-center justify-between text-caption text-text-tertiary font-medium mb-1.5">
                      <span>Progress</span>
                      <span className="text-text-primary font-semibold">{progress}%</span>
                    </div>
                    <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden border border-border-primary/40">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: project.color,
                          boxShadow: `0 0 10px ${project.color}80`,
                        }}
                      />
                    </div>
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
