'use client';

import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectCurrentUser, selectCurrentWorkspace, selectDashboardStats,
  selectMyTasks, selectRecentActivity, selectWorkspaceProjects,
  selectAllUsers, selectOverdueTasks, selectAllTasks,
} from '@/store/selectors';
import { setCurrentProject } from '@/store/slices/projectSlice';
import { setCreateTaskOpen, setCreateProjectOpen, setTaskDetailId, setCommandPaletteOpen } from '@/store/slices/uiSlice';
import { Avatar, AvatarGroup, Badge, EmptyState, Button, DynamicIcon } from '@/components/ui';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/types';
import { formatShortDate, formatRelativeTime, isOverdue, cn } from '@/lib/utils';
import {
  FolderKanban, CheckCircle2, AlertTriangle, Clock, Activity,
  ArrowRight, TrendingUp, Briefcase, Plus, Sparkles, Layers, ArrowUpRight,
  BarChart3, CheckSquare, Settings,
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

  const totalTasksCount = Object.keys(allTasks || {}).length;
  const completedRate = totalTasksCount > 0 
    ? Math.round((stats.completedTasks / totalTasksCount) * 100) 
    : 100;

  // Soft UI Stat Cards matching the user's reference image
  const statCards = [
    {
      label: "Today's Projects",
      value: stats.totalProjects,
      icon: FolderKanban,
      trend: '+55%',
      trendContext: 'than last week',
      trendPositive: true,
    },
    {
      label: "Today's Tasks",
      value: stats.activeTasks,
      icon: CheckSquare,
      trend: '+3%',
      trendContext: 'than last month',
      trendPositive: true,
    },
    {
      label: 'Completed Tasks',
      value: stats.completedTasks,
      icon: CheckCircle2,
      trend: '+12%',
      trendContext: 'than yesterday',
      trendPositive: true,
    },
    {
      label: 'Team Efficiency',
      value: `${completedRate}%`,
      icon: BarChart3,
      trend: stats.overdueTasks === 0 ? '+5%' : `-${stats.overdueTasks}%`,
      trendContext: 'than yesterday',
      trendPositive: stats.overdueTasks === 0,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome & Quick Actions Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs">
              <Sparkles size={12} /> Live Workspace
            </span>
            <span className="text-xs text-text-tertiary">{workspace?.name || 'Workspace'}</span>
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
            className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 shadow-md shadow-slate-900/15"
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Row 1: 4 Stat Cards - Soft UI Style Matching Reference Image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map(stat => (
          <div
            key={stat.label}
            className="soft-card rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center justify-between gap-3">
              {/* Dark squircle icon tile on left - EXACTLY matching reference image */}
              <div className="h-12 w-12 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shadow-md shadow-slate-900/20 flex-shrink-0">
                <stat.icon size={22} className="text-white" />
              </div>
              {/* Label and Big Bold Metric on right */}
              <div className="text-right min-w-0">
                <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider block truncate">
                  {stat.label}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight font-heading mt-0.5 block">
                  {stat.value}
                </span>
              </div>
            </div>

            {/* Bottom trend row with divider */}
            <div className="pt-3.5 mt-3.5 border-t border-border-primary/60 flex items-center text-xs">
              <span className={cn('font-bold mr-1.5', stat.trendPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                {stat.trend}
              </span>
              <span className="text-text-tertiary font-normal">
                {stat.trendContext}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: 3 Visual Chart Cards - Matching Reference Image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Bar Chart (Weekly Velocity) */}
        <div className="soft-card rounded-2xl p-5 flex flex-col justify-between">
          <div className="relative w-full h-44 mb-2">
            <svg className="w-full h-full" viewBox="0 0 300 160" preserveAspectRatio="none">
              {/* Dashed Horizontal Grid lines */}
              <line x1="35" y1="20" x2="295" y2="20" stroke="currentColor" strokeDasharray="3 3" className="text-border-primary/80" strokeWidth="1" />
              <line x1="35" y1="50" x2="295" y2="50" stroke="currentColor" strokeDasharray="3 3" className="text-border-primary/80" strokeWidth="1" />
              <line x1="35" y1="80" x2="295" y2="80" stroke="currentColor" strokeDasharray="3 3" className="text-border-primary/80" strokeWidth="1" />
              <line x1="35" y1="110" x2="295" y2="110" stroke="currentColor" strokeDasharray="3 3" className="text-border-primary/80" strokeWidth="1" />
              <line x1="35" y1="140" x2="295" y2="140" stroke="currentColor" strokeDasharray="3 3" className="text-border-primary/80" strokeWidth="1" />

              {/* Y-axis text */}
              <text x="12" y="24" className="text-[10px] fill-current text-text-tertiary font-medium">50</text>
              <text x="12" y="54" className="text-[10px] fill-current text-text-tertiary font-medium">40</text>
              <text x="12" y="84" className="text-[10px] fill-current text-text-tertiary font-medium">30</text>
              <text x="12" y="114" className="text-[10px] fill-current text-text-tertiary font-medium">20</text>
              <text x="12" y="144" className="text-[10px] fill-current text-text-tertiary font-medium">10</text>

              {/* Bars (Mon to Sun) */}
              <rect x="52" y="45" width="8" height="95" rx="4" className="fill-emerald-500 hover:fill-emerald-400 transition-colors cursor-pointer" />
              <rect x="88" y="25" width="8" height="115" rx="4" className="fill-emerald-500 hover:fill-emerald-400 transition-colors cursor-pointer" />
              <rect x="124" y="65" width="8" height="75" rx="4" className="fill-emerald-500 hover:fill-emerald-400 transition-colors cursor-pointer" />
              <rect x="160" y="30" width="8" height="110" rx="4" className="fill-emerald-500 hover:fill-emerald-400 transition-colors cursor-pointer" />
              <rect x="196" y="20" width="8" height="120" rx="4" className="fill-emerald-500 hover:fill-emerald-400 transition-colors cursor-pointer" />
              <rect x="232" y="85" width="8" height="55" rx="4" className="fill-emerald-500 hover:fill-emerald-400 transition-colors cursor-pointer" />
              <rect x="268" y="105" width="8" height="35" rx="4" className="fill-emerald-500 hover:fill-emerald-400 transition-colors cursor-pointer" />
            </svg>
          </div>
          <div>
            <h3 className="text-body-md font-bold text-text-primary">Weekly Task Velocity</h3>
            <p className="text-body-sm text-text-secondary mt-0.5">
              (<span className="text-emerald-600 dark:text-emerald-400 font-bold">+15%</span>) increase in today&apos;s completed tasks
            </p>
            <div className="flex items-center gap-1.5 text-caption text-text-tertiary mt-3 pt-3 border-t border-border-primary/60">
              <Clock size={13} /> updated 4 mins ago
            </div>
          </div>
        </div>

        {/* Chart 2: Electric Blue Line Chart (Sprint Progress) */}
        <div className="soft-card rounded-2xl p-5 flex flex-col justify-between">
          <div className="relative w-full h-44 mb-2">
            <svg className="w-full h-full" viewBox="0 0 300 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284C7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Dashed Horizontal Grid lines */}
              <line x1="35" y1="20" x2="295" y2="20" stroke="currentColor" strokeDasharray="3 3" className="text-border-primary/80" strokeWidth="1" />
              <line x1="35" y1="50" x2="295" y2="50" stroke="currentColor" strokeDasharray="3 3" className="text-border-primary/80" strokeWidth="1" />
              <line x1="35" y1="80" x2="295" y2="80" stroke="currentColor" strokeDasharray="3 3" className="text-border-primary/80" strokeWidth="1" />
              <line x1="35" y1="110" x2="295" y2="110" stroke="currentColor" strokeDasharray="3 3" className="text-border-primary/80" strokeWidth="1" />
              <line x1="35" y1="140" x2="295" y2="140" stroke="currentColor" strokeDasharray="3 3" className="text-border-primary/80" strokeWidth="1" />

              {/* Y-axis text */}
              <text x="12" y="24" className="text-[10px] fill-current text-text-tertiary font-medium">600</text>
              <text x="12" y="54" className="text-[10px] fill-current text-text-tertiary font-medium">500</text>
              <text x="12" y="84" className="text-[10px] fill-current text-text-tertiary font-medium">400</text>
              <text x="12" y="114" className="text-[10px] fill-current text-text-tertiary font-medium">300</text>
              <text x="12" y="144" className="text-[10px] fill-current text-text-tertiary font-medium">200</text>

              {/* Area fill */}
              <path
                d="M 52 140 C 85 125, 115 100, 140 100 C 170 100, 185 70, 205 60 C 235 45, 255 40, 280 25 L 280 145 L 52 145 Z"
                fill="url(#blueGradient)"
              />

              {/* Curve */}
              <path
                d="M 52 140 C 85 125, 115 100, 140 100 C 170 100, 185 70, 205 60 C 235 45, 255 40, 280 25"
                fill="none"
                stroke="#0284C7"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Circular Data Nodes */}
              <circle cx="52" cy="140" r="4.5" className="fill-white dark:fill-slate-900" stroke="#0284C7" strokeWidth="2.5" />
              <circle cx="140" cy="100" r="4.5" className="fill-white dark:fill-slate-900" stroke="#0284C7" strokeWidth="2.5" />
              <circle cx="205" cy="60" r="4.5" className="fill-white dark:fill-slate-900" stroke="#0284C7" strokeWidth="2.5" />
              <circle cx="280" cy="25" r="4.5" className="fill-white dark:fill-slate-900" stroke="#0284C7" strokeWidth="2.5" />
            </svg>
          </div>
          <div>
            <h3 className="text-body-md font-bold text-text-primary">Sprint Progress Velocity</h3>
            <p className="text-body-sm text-text-secondary mt-0.5">
              (<span className="text-sky-600 dark:text-sky-400 font-bold">+82%</span>) on-schedule milestone velocity
            </p>
            <div className="flex items-center gap-1.5 text-caption text-text-tertiary mt-3 pt-3 border-t border-border-primary/60">
              <Clock size={13} /> campaign sent 2 days ago
            </div>
          </div>
        </div>

        {/* Chart 3: Emerald Green Line Chart + Floating Quick Settings Action */}
        <div className="soft-card rounded-2xl p-5 flex flex-col justify-between relative">
          <div className="relative w-full h-44 mb-2">
            <svg className="w-full h-full" viewBox="0 0 300 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Dashed Horizontal Grid lines */}
              <line x1="35" y1="20" x2="295" y2="20" stroke="currentColor" strokeDasharray="3 3" className="text-border-primary/80" strokeWidth="1" />
              <line x1="35" y1="50" x2="295" y2="50" stroke="currentColor" strokeDasharray="3 3" className="text-border-primary/80" strokeWidth="1" />
              <line x1="35" y1="80" x2="295" y2="80" stroke="currentColor" strokeDasharray="3 3" className="text-border-primary/80" strokeWidth="1" />
              <line x1="35" y1="110" x2="295" y2="110" stroke="currentColor" strokeDasharray="3 3" className="text-border-primary/80" strokeWidth="1" />
              <line x1="35" y1="140" x2="295" y2="140" stroke="currentColor" strokeDasharray="3 3" className="text-border-primary/80" strokeWidth="1" />

              {/* Y-axis text */}
              <text x="12" y="24" className="text-[10px] fill-current text-text-tertiary font-medium">600</text>
              <text x="12" y="54" className="text-[10px] fill-current text-text-tertiary font-medium">500</text>
              <text x="12" y="84" className="text-[10px] fill-current text-text-tertiary font-medium">400</text>
              <text x="12" y="114" className="text-[10px] fill-current text-text-tertiary font-medium">300</text>
              <text x="12" y="144" className="text-[10px] fill-current text-text-tertiary font-medium">200</text>

              {/* Area fill */}
              <path
                d="M 52 145 C 80 140, 110 95, 140 100 C 170 105, 190 45, 215 75 C 240 100, 260 40, 280 35 L 280 145 L 52 145 Z"
                fill="url(#greenGradient)"
              />

              {/* Curve */}
              <path
                d="M 52 145 C 80 140, 110 95, 140 100 C 170 105, 190 45, 215 75 C 240 100, 260 40, 280 35"
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Circular Data Nodes */}
              <circle cx="52" cy="145" r="4.5" className="fill-white dark:fill-slate-900" stroke="#10B981" strokeWidth="2.5" />
              <circle cx="140" cy="100" r="4.5" className="fill-white dark:fill-slate-900" stroke="#10B981" strokeWidth="2.5" />
              <circle cx="215" cy="75" r="4.5" className="fill-white dark:fill-slate-900" stroke="#10B981" strokeWidth="2.5" />
              <circle cx="280" cy="35" r="4.5" className="fill-white dark:fill-slate-900" stroke="#10B981" strokeWidth="2.5" />
            </svg>
          </div>
          <div>
            <h3 className="text-body-md font-bold text-text-primary">Completed Sprints & Velocity</h3>
            <p className="text-body-sm text-text-secondary mt-0.5">
              (<span className="text-emerald-600 dark:text-emerald-400 font-bold">+28%</span>) throughput increase across teams
            </p>
            <div className="flex items-center gap-1.5 text-caption text-text-tertiary mt-3 pt-3 border-t border-border-primary/60">
              <Clock size={13} /> just updated
            </div>
          </div>

          {/* Floating Settings Gear Button - Exactly matching the user's reference image */}
          <button
            onClick={() => dispatch(setCommandPaletteOpen(true))}
            className="absolute -bottom-2 -right-2 sm:bottom-4 sm:right-4 h-11 w-11 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:rotate-90 hover:scale-105 transition-all duration-300 z-10 cursor-pointer"
            title="Command Palette & Settings (⌘K)"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Row 3: Priority Tasks & Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Tasks Panel */}
        <div className="lg:col-span-2 soft-card rounded-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border-primary/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center shadow-xs">
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
                className="px-6 py-3.5 flex items-center gap-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-150 cursor-pointer group"
              >
                <div
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0 ring-4 ring-transparent group-hover:ring-accent-primary/20 transition-all"
                  style={{ backgroundColor: STATUS_CONFIG[task.status].color }}
                  title={STATUS_CONFIG[task.status].label}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-semibold text-text-primary truncate group-hover:text-accent-primary transition-colors">
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
        <div className="soft-card rounded-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border-primary/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center shadow-xs">
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
                <div key={event.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
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

      {/* Row 4: Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderKanban size={18} className="text-accent-primary" />
            <h2 className="text-heading-sm text-text-primary">Active Project Suites</h2>
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
          <div className="soft-card rounded-2xl p-10 text-center">
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  className="soft-card rounded-2xl p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 text-left cursor-pointer group relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Subtle top color bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: project.color }}
                  />

                  <div>
                    <div className="flex items-center gap-3.5 mb-3 pt-1">
                      <div
                        className="h-11 w-11 rounded-xl flex items-center justify-center shadow-xs border transition-transform duration-300 group-hover:scale-105"
                        style={{
                          backgroundColor: `${project.color}15`,
                          borderColor: `${project.color}30`,
                          color: project.color,
                        }}
                      >
                        <DynamicIcon icon={project.icon || 'folder'} size={20} />
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
                  </div>

                  <div className="mt-4 pt-2">
                    <div className="flex items-center justify-between text-caption text-text-tertiary font-medium mb-1.5">
                      <span>Progress</span>
                      <span className="text-text-primary font-semibold">{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-border-primary/40">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: project.color,
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
