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

  // Google Workflow Stat Cards with signature 4-color accents
  const statCards = [
    {
      label: "Active Projects",
      value: stats.totalProjects,
      icon: FolderKanban,
      trend: '+55%',
      trendContext: 'vs last week',
      trendPositive: true,
      color: '#1A73E8',
      iconBg: 'bg-[#E8F0FE] text-[#1A73E8] dark:bg-[#1A73E8]/20 dark:text-[#8AB4F8]',
    },
    {
      label: "Today's Tasks",
      value: stats.activeTasks,
      icon: CheckSquare,
      trend: '+3%',
      trendContext: 'vs last month',
      trendPositive: true,
      color: '#34A853',
      iconBg: 'bg-[#E6F4EA] text-[#34A853] dark:bg-[#34A853]/20 dark:text-[#81C995]',
    },
    {
      label: 'Completed Tasks',
      value: stats.completedTasks,
      icon: CheckCircle2,
      trend: '+12%',
      trendContext: 'vs yesterday',
      trendPositive: true,
      color: '#F9AB00',
      iconBg: 'bg-[#FEF7E0] text-[#B06000] dark:bg-[#F9AB00]/20 dark:text-[#FDD663]',
    },
    {
      label: 'Team Efficiency',
      value: `${completedRate}%`,
      icon: BarChart3,
      trend: stats.overdueTasks === 0 ? '+5%' : `-${stats.overdueTasks}%`,
      trendContext: 'completion rate',
      trendPositive: stats.overdueTasks === 0,
      color: '#EA4335',
      iconBg: 'bg-[#FCE8E6] text-[#EA4335] dark:bg-[#EA4335]/20 dark:text-[#F28B82]',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome & Quick Actions Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-[#E8F0FE] text-[#1967D2] dark:bg-[#1A73E8]/20 dark:text-[#8AB4F8] border border-[#D2E3FC] dark:border-transparent shadow-2xs">
              <span className="flex items-center gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4285F4]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#EA4335]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#FBBC04]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#34A853]" />
              </span>
              Google Workflow Engine
            </span>
            <span className="text-xs text-text-tertiary">{workspace?.name || 'Workspace'}</span>
          </div>
          <h1 className="text-heading-xl text-text-primary">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {currentUser?.name?.split(' ')[0]}
          </h1>
          <p className="text-body-md text-text-secondary mt-0.5">
            Real-time project pipeline, team velocity, and workflow orchestration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => dispatch(setCreateTaskOpen(true))}
            className="rounded-full px-5 py-2.5 shadow-sm hover:shadow-md"
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Row 1: 4 Google Color Accent Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map(stat => (
          <div
            key={stat.label}
            className="google-card p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center justify-between gap-3">
              {/* Google Material Tonal Icon Tile */}
              <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs transition-transform group-hover:scale-105', stat.iconBg)}>
                <stat.icon size={22} />
              </div>
              {/* Metric & Label */}
              <div className="text-right min-w-0">
                <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block truncate">
                  {stat.label}
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight font-heading mt-0.5 block">
                  {stat.value}
                </span>
              </div>
            </div>

            {/* Bottom trend row with divider */}
            <div className="pt-3.5 mt-3.5 border-t border-border-primary flex items-center justify-between text-xs">
              <span className={cn('px-2 py-0.5 rounded-full font-medium text-[11px]', stat.trendPositive ? 'bg-[#E6F4EA] text-[#137333] dark:bg-[#137333]/25 dark:text-[#81C995]' : 'bg-[#FCE8E6] text-[#C5221F] dark:bg-[#C5221F]/25 dark:text-[#F28B82]')}>
                {stat.trend}
              </span>
              <span className="text-text-tertiary font-normal">
                {stat.trendContext}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Google Workflow Execution Pipeline Tracker */}
      <div className="google-card p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-[#E8F0FE] dark:bg-[#1A73E8]/20 text-[#1A73E8] dark:text-[#8AB4F8] flex items-center justify-center shadow-2xs">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="text-body-md font-semibold text-text-primary">Workflow Execution Pipeline</h3>
              <p className="text-caption text-text-tertiary">Real-time status tracking across workspace life-cycle</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-caption font-medium px-3 py-1 rounded-full bg-[#E6F4EA] dark:bg-[#137333]/25 text-[#137333] dark:text-[#81C995] border border-[#CEEAD6] dark:border-transparent flex items-center gap-1.5 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34A853] animate-pulse" />
              All Pipelines Healthy
            </span>
          </div>
        </div>

        {/* 4 Pipeline Stage Nodes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {[
            { stage: '1. Backlog & Triage', count: myTasks.filter(t => t.status === 'backlog' || t.status === 'todo').length, color: '#1A73E8', bg: 'bg-[#E8F0FE] text-[#1967D2] dark:bg-[#1A73E8]/20 dark:text-[#8AB4F8]', border: 'border-[#D2E3FC] dark:border-transparent' },
            { stage: '2. In Execution', count: myTasks.filter(t => t.status === 'in_progress').length, color: '#FBBC04', bg: 'bg-[#FEF7E0] text-[#B06000] dark:bg-[#FBBC04]/20 dark:text-[#FDD663]', border: 'border-[#FEEFC3] dark:border-transparent' },
            { stage: '3. Peer Review', count: myTasks.filter(t => t.status === 'review').length, color: '#EA4335', bg: 'bg-[#FCE8E6] text-[#C5221F] dark:bg-[#EA4335]/20 dark:text-[#F28B82]', border: 'border-[#FAD2CF] dark:border-transparent' },
            { stage: '4. Verified Done', count: myTasks.filter(t => t.status === 'done').length, color: '#34A853', bg: 'bg-[#E6F4EA] text-[#137333] dark:bg-[#34A853]/20 dark:text-[#81C995]', border: 'border-[#CEEAD6] dark:border-transparent' },
          ].map((node) => (
            <div key={node.stage} className={cn('p-3.5 rounded-2xl border flex flex-col justify-between transition-all hover:shadow-xs', node.bg, node.border)}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider">{node.stage}</span>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: node.color }} />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-bold font-heading">{node.count}</span>
                <span className="text-caption opacity-80">tasks active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: 3 Visual Chart Cards - Google Cloud / Workspace Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Bar Chart (Weekly Velocity - Google Green) */}
        <div className="google-card p-5 flex flex-col justify-between">
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

              {/* Google Green Bars (Mon to Sun) */}
              <rect x="52" y="45" width="9" height="95" rx="4.5" className="fill-[#34A853] hover:fill-[#1E8E3E] transition-colors cursor-pointer" />
              <rect x="88" y="25" width="9" height="115" rx="4.5" className="fill-[#34A853] hover:fill-[#1E8E3E] transition-colors cursor-pointer" />
              <rect x="124" y="65" width="9" height="75" rx="4.5" className="fill-[#34A853] hover:fill-[#1E8E3E] transition-colors cursor-pointer" />
              <rect x="160" y="30" width="9" height="110" rx="4.5" className="fill-[#34A853] hover:fill-[#1E8E3E] transition-colors cursor-pointer" />
              <rect x="196" y="20" width="9" height="120" rx="4.5" className="fill-[#34A853] hover:fill-[#1E8E3E] transition-colors cursor-pointer" />
              <rect x="232" y="85" width="9" height="55" rx="4.5" className="fill-[#34A853] hover:fill-[#1E8E3E] transition-colors cursor-pointer" />
              <rect x="268" y="105" width="9" height="35" rx="4.5" className="fill-[#34A853] hover:fill-[#1E8E3E] transition-colors cursor-pointer" />
            </svg>
          </div>
          <div>
            <h3 className="text-body-md font-semibold text-text-primary">Weekly Task Velocity</h3>
            <p className="text-body-sm text-text-secondary mt-0.5">
              (<span className="text-[#137333] dark:text-[#81C995] font-semibold">+15%</span>) increase in today&apos;s completed tasks
            </p>
            <div className="flex items-center gap-1.5 text-caption text-text-tertiary mt-3 pt-3 border-t border-border-primary">
              <Clock size={13} /> updated 4 mins ago
            </div>
          </div>
        </div>

        {/* Chart 2: Google Blue Line Chart (Sprint Progress) */}
        <div className="google-card p-5 flex flex-col justify-between">
          <div className="relative w-full h-44 mb-2">
            <svg className="w-full h-full" viewBox="0 0 300 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1A73E8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1A73E8" stopOpacity="0.0" />
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
                stroke="#1A73E8"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Circular Data Nodes */}
              <circle cx="52" cy="140" r="4.5" className="fill-white dark:fill-[#202124]" stroke="#1A73E8" strokeWidth="2.5" />
              <circle cx="140" cy="100" r="4.5" className="fill-white dark:fill-[#202124]" stroke="#1A73E8" strokeWidth="2.5" />
              <circle cx="205" cy="60" r="4.5" className="fill-white dark:fill-[#202124]" stroke="#1A73E8" strokeWidth="2.5" />
              <circle cx="280" cy="25" r="4.5" className="fill-white dark:fill-[#202124]" stroke="#1A73E8" strokeWidth="2.5" />
            </svg>
          </div>
          <div>
            <h3 className="text-body-md font-semibold text-text-primary">Sprint Progress Velocity</h3>
            <p className="text-body-sm text-text-secondary mt-0.5">
              (<span className="text-[#1A73E8] dark:text-[#8AB4F8] font-semibold">+82%</span>) on-schedule milestone velocity
            </p>
            <div className="flex items-center gap-1.5 text-caption text-text-tertiary mt-3 pt-3 border-t border-border-primary">
              <Clock size={13} /> updated 2 days ago
            </div>
          </div>
        </div>

        {/* Chart 3: Google Yellow/Amber Line Chart */}
        <div className="google-card p-5 flex flex-col justify-between relative">
          <div className="relative w-full h-44 mb-2">
            <svg className="w-full h-full" viewBox="0 0 300 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F9AB00" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#F9AB00" stopOpacity="0.0" />
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
                fill="url(#amberGradient)"
              />

              {/* Curve */}
              <path
                d="M 52 145 C 80 140, 110 95, 140 100 C 170 105, 190 45, 215 75 C 240 100, 260 40, 280 35"
                fill="none"
                stroke="#F9AB00"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Circular Data Nodes */}
              <circle cx="52" cy="145" r="4.5" className="fill-white dark:fill-[#202124]" stroke="#F9AB00" strokeWidth="2.5" />
              <circle cx="140" cy="100" r="4.5" className="fill-white dark:fill-[#202124]" stroke="#F9AB00" strokeWidth="2.5" />
              <circle cx="215" cy="75" r="4.5" className="fill-white dark:fill-[#202124]" stroke="#F9AB00" strokeWidth="2.5" />
              <circle cx="280" cy="35" r="4.5" className="fill-white dark:fill-[#202124]" stroke="#F9AB00" strokeWidth="2.5" />
            </svg>
          </div>
          <div>
            <h3 className="text-body-md font-semibold text-text-primary">Completed Sprints & Velocity</h3>
            <p className="text-body-sm text-text-secondary mt-0.5">
              (<span className="text-[#B06000] dark:text-[#FDD663] font-semibold">+28%</span>) throughput increase across teams
            </p>
            <div className="flex items-center gap-1.5 text-caption text-text-tertiary mt-3 pt-3 border-t border-border-primary">
              <Clock size={13} /> just updated
            </div>
          </div>

          {/* Floating Settings Gear Button */}
          <button
            onClick={() => dispatch(setCommandPaletteOpen(true))}
            className="absolute -bottom-2 -right-2 sm:bottom-4 sm:right-4 h-11 w-11 rounded-full bg-white dark:bg-[#303134] shadow-md border border-border-primary flex items-center justify-center text-text-secondary hover:text-accent-primary hover:rotate-90 hover:scale-105 transition-all duration-300 z-10 cursor-pointer"
            title="Command Palette & Settings (⌘K)"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Row 3: Priority Tasks & Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Tasks Panel - Google Tasks Styled */}
        <div className="lg:col-span-2 google-card overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border-primary flex items-center justify-between bg-bg-tertiary/40">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-[#E8F0FE] text-[#1A73E8] dark:bg-[#1A73E8]/20 dark:text-[#8AB4F8] flex items-center justify-center shadow-2xs">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <h2 className="text-heading-sm text-text-primary">Google Tasks Overview</h2>
                <p className="text-caption text-text-tertiary">Assigned to you across active projects</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/my-tasks')}
              className="text-caption text-accent-primary hover:text-accent-primary-hover font-medium cursor-pointer flex items-center gap-1 transition-colors px-3 py-1 rounded-full hover:bg-[#E8F0FE] dark:hover:bg-[#1A73E8]/20"
            >
              View all <ArrowRight size={13} />
            </button>
          </div>

          <div className="divide-y divide-border-secondary flex-1">
            {myTasks.slice(0, 6).map(task => (
              <div
                key={task.id}
                onClick={() => dispatch(setTaskDetailId(task.id))}
                className="px-6 py-3.5 flex items-center gap-3.5 hover:bg-[#F8FAFD] dark:hover:bg-[#303134] transition-all duration-150 cursor-pointer group"
              >
                <div
                  className="h-4 w-4 rounded-full border-2 border-border-primary group-hover:border-[#1A73E8] flex items-center justify-center transition-colors flex-shrink-0"
                  title={STATUS_CONFIG[task.status].label}
                >
                  <div className="h-1.5 w-1.5 rounded-full opacity-0 group-hover:opacity-100 bg-[#1A73E8] transition-opacity" />
                </div>
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
                  <span className={`text-caption flex items-center gap-1 px-2.5 py-0.5 rounded-full ${
                    isOverdue(task.dueDate)
                      ? 'text-[#C5221F] bg-[#FCE8E6] dark:bg-[#C5221F]/20 font-medium'
                      : 'text-text-tertiary bg-bg-tertiary'
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
        <div className="google-card overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border-primary flex items-center justify-between bg-bg-tertiary/40">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-[#FEF7E0] text-[#B06000] dark:bg-[#FBBC04]/20 dark:text-[#FDD663] flex items-center justify-center shadow-2xs">
                <Activity size={16} />
              </div>
              <h2 className="text-heading-sm text-text-primary">Recent Activity</h2>
            </div>
            <button
              onClick={() => router.push('/activity')}
              className="text-caption text-text-tertiary hover:text-text-primary transition-colors cursor-pointer px-2.5 py-1 rounded-full hover:bg-bg-hover"
            >
              History
            </button>
          </div>

          <div className="divide-y divide-border-secondary max-h-[420px] overflow-y-auto flex-1">
            {recentActivity.slice(0, 8).map(event => {
              const user = users[event.userId];
              return (
                <div key={event.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-[#F8FAFD] dark:hover:bg-[#303134] transition-colors">
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
            <span className="text-xs text-text-tertiary bg-bg-tertiary px-2.5 py-0.5 rounded-full font-medium">
              {projects.length}
            </span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus size={14} />}
            onClick={() => dispatch(setCreateProjectOpen(true))}
            className="rounded-full"
          >
            Create Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="google-card p-10 text-center">
            <FolderKanban size={44} className="mx-auto text-text-tertiary mb-3 opacity-60" />
            <h3 className="text-body-md font-semibold text-text-primary">No projects yet</h3>
            <p className="text-body-sm text-text-secondary mt-1 mb-5 max-w-md mx-auto">
              Get started by creating your first project to organize your team&apos;s tasks, Kanban boards, and milestones.
            </p>
            <Button
              variant="primary"
              icon={<Plus size={15} />}
              onClick={() => dispatch(setCreateProjectOpen(true))}
              className="rounded-full"
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
                  className="google-card p-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300 text-left cursor-pointer group relative overflow-hidden flex flex-col justify-between"
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
