'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/selectors';
import { login } from '@/store/slices/authSlice';
import {
  Kanban, ListOrdered, Calendar, ShieldCheck, Zap, Cloud,
  CheckCircle2, ArrowRight, Sparkles, ChevronDown, ChevronUp,
  Layers, Users, Clock, Database, Laptop, Smartphone, Search,
  Command, Plus, ExternalLink, Activity, Building2, Home, FolderKanban,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [activePreviewTab, setActivePreviewTab] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleLaunchApp = () => {
    if (!isAuthenticated) {
      // Auto login with default demo user for instant frictionless evaluator experience
      dispatch(login('user-alex'));
    }
    router.push('/dashboard');
  };

  const faqItems = [
    {
      question: 'How does the Supabase Cloud backend integration work?',
      answer: 'Workspace Manager employs a hybrid cloud architecture. When Supabase credentials are configured, your workspaces, projects, tasks, and comments seamlessly sync to your PostgreSQL cloud tables in real-time, while maintaining instant local cache for offline reliability.',
    },
    {
      question: 'Can I use this app without an internet connection?',
      answer: 'Yes! The application is architected offline-first. All state transitions, task changes, and attachments persist locally via Redux and LocalStorage/IndexedDB. When your connection resumes, your work remains fully intact.',
    },
    {
      question: 'What are the 3 core project views provided?',
      answer: 'Every project includes an Interactive Kanban Board (with customizable columns and priority color coding), a High-Density Relational List View (with column sorting and bulk actions), and a Monthly Calendar View (mapping due dates and timelines).',
    },
    {
      question: 'How do role-based permissions (RBAC) work?',
      answer: 'Workspaces and projects support 4 granular security tiers: Owner (full destructive and settings control), Admin (member management and project creation), Member (task creation and editing), and Viewer (read-only access).',
    },
    {
      question: 'What keyboard shortcuts are available?',
      answer: 'Power users can navigate with ⌘K / Ctrl+K (Command Palette), press "C" to create a new task instantly from anywhere, ⌘Z for Undo, ⌘Y for Redo, and "?" to view the full cheat sheet.',
    },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-accent-primary/20 selection:text-accent-primary">
      {/* Background Gradient Mesh & Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-500/15 via-purple-500/10 to-transparent blur-3xl rounded-full opacity-70" />
        <div className="absolute top-96 -left-48 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full opacity-50" />
        <div className="absolute top-96 -right-48 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full opacity-50" />
      </div>

      {/* ============================================================
          STICKY GOOGLE WORKSPACE NAVIGATION BAR
          ============================================================ */}
      <header className="sticky top-0 z-50 bg-bg-secondary/95 backdrop-blur-md border-b border-border-primary transition-all duration-200">
        <div className="google-bar" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-[#1A73E8] to-[#34A853] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
              <Layers size={20} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg tracking-tight text-text-primary flex items-center gap-1.5">
                Workspace <span className="gradient-text font-extrabold">Manager</span>
              </span>
              <span className="text-[10px] text-text-tertiary -mt-1 tracking-wider uppercase font-semibold">
                Google Workflow Suite
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
            <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#views" className="hover:text-text-primary transition-colors">Views</a>
            <a href="#workflows" className="hover:text-text-primary transition-colors">Workflows</a>
            <a href="#architecture" className="hover:text-text-primary transition-colors">Architecture</a>
            <a href="#faq" className="hover:text-text-primary transition-colors">FAQ</a>
          </nav>

          {/* CTA Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/login')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-full transition-colors cursor-pointer"
            >
              <Users size={14} />
              Sign In
            </button>
            <button
              onClick={handleLaunchApp}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-accent-primary hover:bg-accent-primary-hover rounded-full shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer active:scale-95"
            >
              <span>{isAuthenticated ? 'Open Dashboard' : 'Launch Demo'}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        {/* Announcement Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-[#292A2D] border border-border-primary text-xs font-medium text-text-primary mb-6 shadow-2xs hover:border-accent-primary transition-colors cursor-default">
          <span className="flex items-center gap-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4285F4]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#EA4335]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#FBBC04]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#34A853]" />
          </span>
          <span className="text-text-secondary font-normal">Google Workflow Theme •</span>
          <span className="gradient-text font-bold">Workspace Suite</span>
          <Sparkles size={13} className="text-accent-primary ml-0.5" />
        </div>

        {/* Main Display Headline */}
        <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-text-primary">
          One workspace for every <br className="hidden sm:inline" />
          <span className="gradient-text">project, task & team.</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-xl text-text-secondary leading-relaxed mb-8">
          The speed of Linear meets the flexibility of Notion and Jira. Plan sprints, track Kanban boards, and manage complex relational task hierarchies with real-time Supabase cloud sync.
        </p>

        {/* Dual Hero Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
          <button
            onClick={handleLaunchApp}
            className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold text-white bg-accent-primary hover:bg-accent-primary-hover rounded-xl shadow-lg shadow-accent-primary/30 hover:shadow-xl hover:shadow-accent-primary/40 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 active:scale-95"
          >
            <Sparkles size={18} />
            <span>Open Demo Workspace</span>
            <ArrowRight size={16} />
          </button>
          <a
            href="#views"
            className="w-full sm:w-auto px-6 py-3.5 text-base font-semibold text-text-primary bg-bg-secondary hover:bg-bg-hover border border-border-primary rounded-xl shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Explore Interactive Views</span>
            <ChevronDown size={16} className="text-text-tertiary" />
          </a>
        </div>

        {/* Hero Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-text-secondary font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cloud size={14} className="text-indigo-500" />
            <span>Supabase Cloud PostgreSQL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap size={14} className="text-amber-500" />
            <span>Offline-First State Engine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-blue-500" />
            <span>Granular RBAC Security</span>
          </div>
        </div>
      </section>

      {/* ============================================================
          INTERACTIVE PRODUCT PREVIEW (MACOS GLASS WINDOW)
          ============================================================ */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-2xl border border-border-primary/80 bg-bg-secondary shadow-2xl shadow-indigo-500/10 overflow-hidden">
          {/* Window Title Bar */}
          <div className="h-11 px-4 border-b border-border-primary bg-bg-tertiary/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
              <div className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
              <div className="h-3 w-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
              <div className="h-4 w-px bg-border-primary mx-2" />
              <span className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-md bg-blue-500 flex items-center justify-center text-white shadow-2xs">
                  <Building2 size={12} />
                </span>
                <span>My Workspace</span>
                <span className="text-text-tertiary">/</span>
                <span className="text-text-primary font-semibold">Sprint Deliverables</span>
              </span>
            </div>

            {/* View Switcher Tabs inside Mockup */}
            <div className="flex items-center gap-1 bg-bg-secondary p-1 rounded-lg border border-border-primary text-xs">
              <button
                onClick={() => setActivePreviewTab('kanban')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                  activePreviewTab === 'kanban'
                    ? 'bg-accent-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Kanban size={13} />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setActivePreviewTab('list')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                  activePreviewTab === 'list'
                    ? 'bg-accent-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <ListOrdered size={13} />
                <span>List</span>
              </button>
              <button
                onClick={() => setActivePreviewTab('calendar')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                  activePreviewTab === 'calendar'
                    ? 'bg-accent-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Calendar size={13} />
                <span>Calendar</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Cloud Connected</span>
              </div>
            </div>
          </div>

          {/* Window Body: Dynamic View Renderer */}
          <div className="p-4 sm:p-6 bg-bg-primary/50 min-h-[440px]">
            {activePreviewTab === 'kanban' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Column 1: Todo */}
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-3.5 shadow-xs">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-border-secondary">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-xs font-bold text-text-primary uppercase tracking-wider">To Do</span>
                      <span className="text-xs text-text-tertiary bg-bg-tertiary px-1.5 py-0.2 rounded-full">2</span>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-3 bg-bg-primary border border-border-primary rounded-lg hover:border-indigo-500/40 transition-colors shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">Architecture</span>
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded">MEDIUM</span>
                      </div>
                      <h4 className="text-xs font-semibold text-text-primary mb-1">Set up Supabase RLS policies</h4>
                      <p className="text-[11px] text-text-secondary line-clamp-2">Ensure profile and workspace rows are isolated per user identity.</p>
                      <div className="mt-3 flex items-center justify-between text-[10px] text-text-tertiary">
                        <span className="flex items-center gap-1 text-text-secondary"><Clock size={11} /> Sep 12</span>
                        <div className="h-5 w-5 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-[10px]">AM</div>
                      </div>
                    </div>
                    <div className="p-3 bg-bg-primary border border-border-primary rounded-lg shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">Frontend</span>
                        <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.2 rounded">HIGH</span>
                      </div>
                      <h4 className="text-xs font-semibold text-text-primary mb-1">Mobile navigation drawer</h4>
                      <div className="mt-2.5 flex items-center justify-between text-[10px] text-text-tertiary">
                        <span className="text-text-secondary">2 subtasks</span>
                        <div className="h-5 w-5 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-[10px]">SC</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: In Progress */}
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-3.5 shadow-xs">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-border-secondary">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold text-text-primary uppercase tracking-wider">In Progress</span>
                      <span className="text-xs text-text-tertiary bg-bg-tertiary px-1.5 py-0.2 rounded-full">1</span>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-3 bg-bg-primary border-2 border-indigo-500/40 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Core</span>
                        <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.2 rounded">URGENT</span>
                      </div>
                      <h4 className="text-xs font-semibold text-text-primary mb-1">Interactive Kanban Drag & Drop</h4>
                      <p className="text-[11px] text-text-secondary line-clamp-2">Optimistic state dispatch with Redux Toolkit and auto-persist.</p>
                      <div className="mt-3 flex items-center justify-between text-[10px] text-text-tertiary">
                        <span className="flex items-center gap-1 text-emerald-500 font-medium">● 3/3 Subtasks</span>
                        <div className="h-5 w-5 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px]">DK</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Done */}
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-3.5 shadow-xs">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-border-secondary">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Done</span>
                      <span className="text-xs text-text-tertiary bg-bg-tertiary px-1.5 py-0.2 rounded-full">2</span>
                    </div>
                  </div>
                  <div className="space-y-2.5 opacity-85">
                    <div className="p-3 bg-bg-primary border border-border-primary rounded-lg shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold text-text-tertiary bg-bg-tertiary px-2 py-0.5 rounded-full">Design</span>
                        <span className="text-emerald-500 text-xs"><CheckCircle2 size={13} /></span>
                      </div>
                      <h4 className="text-xs font-medium line-through text-text-secondary mb-1">Design token palette revamp</h4>
                      <div className="mt-2.5 flex items-center justify-between text-[10px] text-text-tertiary">
                        <span>Completed 2h ago</span>
                        <div className="h-5 w-5 rounded-full bg-slate-500 text-white font-bold flex items-center justify-center text-[10px]">AM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'list' && (
              <div className="bg-bg-secondary border border-border-primary rounded-xl overflow-hidden shadow-xs">
                <div className="px-4 py-3 bg-bg-tertiary/40 border-b border-border-primary grid grid-cols-12 text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                  <div className="col-span-5">Task Title</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Priority</div>
                  <div className="col-span-3 text-right">Assignee</div>
                </div>
                <div className="divide-y divide-border-secondary text-xs">
                  <div className="px-4 py-3 grid grid-cols-12 items-center hover:bg-bg-hover">
                    <div className="col-span-5 font-medium text-text-primary flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>Configure Supabase database replication</span>
                    </div>
                    <div className="col-span-2"><span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-500">In Progress</span></div>
                    <div className="col-span-2"><span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-500/10 text-red-500">HIGH</span></div>
                    <div className="col-span-3 text-right text-text-secondary">Alex Morgan</div>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-12 items-center hover:bg-bg-hover">
                    <div className="col-span-5 font-medium text-text-primary flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span>Implement Command Palette shortcuts (⌘K)</span>
                    </div>
                    <div className="col-span-2"><span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-500">Done</span></div>
                    <div className="col-span-2"><span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500">MEDIUM</span></div>
                    <div className="col-span-3 text-right text-text-secondary">Sarah Chen</div>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-12 items-center hover:bg-bg-hover">
                    <div className="col-span-5 font-medium text-text-primary flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                      <span>Subtask cascade progress calculation</span>
                    </div>
                    <div className="col-span-2"><span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/10 text-purple-500">Review</span></div>
                    <div className="col-span-2"><span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500">LOW</span></div>
                    <div className="col-span-3 text-right text-text-secondary">Daniel Kim</div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'calendar' && (
              <div className="bg-bg-secondary border border-border-primary rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">September 2026</h4>
                  <div className="flex gap-1 text-[11px] text-text-secondary">
                    <span className="px-2 py-0.5 bg-bg-tertiary rounded">Month</span>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-text-tertiary mb-1">
                  <div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div><div>SUN</div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className={`h-14 p-1.5 border border-border-secondary rounded-lg text-left ${i === 4 ? 'bg-indigo-500/5 border-indigo-500/30' : 'bg-bg-primary'}`}>
                      <span className={`text-[10px] font-semibold ${i === 4 ? 'text-indigo-500 font-bold' : 'text-text-tertiary'}`}>{i + 1}</span>
                      {i === 4 && (
                        <div className="mt-1 bg-indigo-500 text-white text-[9px] px-1 py-0.5 rounded truncate font-medium">Sprint Release</div>
                      )}
                      {i === 7 && (
                        <div className="mt-1 bg-emerald-500 text-white text-[9px] px-1 py-0.5 rounded truncate font-medium">Client Demo</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          THREE-VIEW ARCHITECTURE SHOWCASE
          ============================================================ */}
      <section id="views" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border-primary/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Three Unified Views</h2>
          <p className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            Switch perspectives with zero friction.
          </p>
          <p className="text-body-md text-text-secondary mt-3">
            Every team member thinks differently. View your project as a fluid visual Kanban board, a high-density relational table, or a date-mapped calendar with a single click.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Kanban size={24} />
            </div>
            <h3 className="font-heading text-xl font-bold text-text-primary mb-2">Visual Kanban Board</h3>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              Drag-and-drop tasks across custom status swimlanes. Enjoy column WIP counters, color badges, priority pills, and quick task creation.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <ListOrdered size={24} />
            </div>
            <h3 className="font-heading text-xl font-bold text-text-primary mb-2">Relational List Table</h3>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              Designed for power users managing high volume tasks. Multi-column sorting, multi-select bulk operations, and instantaneous filter chips.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Calendar size={24} />
            </div>
            <h3 className="font-heading text-xl font-bold text-text-primary mb-2">Monthly Calendar</h3>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              Never miss a critical client milestone. Visual timeline mapping with overdue alerts, weekend highlights, and click-to-schedule cards.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          BENTO GRID: CORE FEATURE MATRIX
          ============================================================ */}
      <section id="features" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border-primary/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Enterprise Foundations</h2>
          <p className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            Engineered for speed, scale & collaboration.
          </p>
          <p className="text-body-md text-text-secondary mt-3">
            70+ discrete features covering 14 architecture domains — built from the ground up without third-party template bloat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Cloud Backend */}
          <div className="glass-card rounded-2xl p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Database size={20} />
              </div>
              <div>
                <h3 className="text-body-md font-bold text-text-primary">Supabase PostgreSQL Cloud Backend</h3>
                <span className="text-caption text-text-tertiary">Real-time data synchronization with RLS security</span>
              </div>
            </div>
            <p className="text-body-sm text-text-secondary mb-4">
              Your workspaces, projects, tasks, and comments are persisted securely to PostgreSQL. Enjoy zero-latency optimistic updates locally, with background cloud replication and cascade deletes.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-secondary text-center text-xs">
              <div className="p-2 bg-bg-tertiary/60 rounded-lg">
                <span className="font-bold text-indigo-500 block">PostgreSQL</span>
                <span className="text-[10px] text-text-tertiary">Cloud Engine</span>
              </div>
              <div className="p-2 bg-bg-tertiary/60 rounded-lg">
                <span className="font-bold text-emerald-500 block">CASCADE</span>
                <span className="text-[10px] text-text-tertiary">Foreign Keys</span>
              </div>
              <div className="p-2 bg-bg-tertiary/60 rounded-lg">
                <span className="font-bold text-blue-500 block">RLS</span>
                <span className="text-[10px] text-text-tertiary">Row-Level Security</span>
              </div>
            </div>
          </div>

          {/* Card 2: Offline-First */}
          <div className="glass-card rounded-2xl p-6">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
              <Zap size={20} />
            </div>
            <h3 className="text-body-md font-bold text-text-primary mb-2">Offline-First Engine</h3>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              Work uninterrupted on planes or spotty Wi-Fi. Full state persistence across localStorage and IndexedDB attachments with automatic sync upon reconnect.
            </p>
          </div>

          {/* Card 3: RBAC Security */}
          <div className="glass-card rounded-2xl p-6">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-body-md font-bold text-text-primary mb-2">Role-Based Access Control</h3>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              Enforce strict role hierarchies: Owner, Admin, Member, and Viewer. Protect danger zones, member invites, and task editing with programmatic permission gates.
            </p>
          </div>

          {/* Card 4: Command Palette */}
          <div className="glass-card rounded-2xl p-6">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
              <Command size={20} />
            </div>
            <h3 className="text-body-md font-bold text-text-primary mb-2">Omnipresent ⌘K Palette</h3>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              Instant fuzzy search across tasks, navigation to any project, theme toggles, and shortcut action triggers. Control the entire application without touching your mouse.
            </p>
          </div>

          {/* Card 5: Subtasks & Comments */}
          <div className="glass-card rounded-2xl p-6">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="text-body-md font-bold text-text-primary mb-2">Subtasks & Rich Audit Logs</h3>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              Break down complex work into nested subtasks with automated completion percentages. Full chronological activity audit stream tracks every status transition.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          WORKFLOW DEMONSTRATION (OFFICE VS PERSONAL)
          ============================================================ */}
      <section id="workflows" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border-primary/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Versatile Workflows</h2>
          <p className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            Adapts effortlessly from Corporate Sprints to Household Chores.
          </p>
          <p className="text-body-md text-text-secondary mt-3">
            One engine, endless workflows. Separate work and personal life into distinct workspaces with isolated members, custom labels, and tailored project views.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Office Workflow */}
          <div className="glass-card rounded-2xl p-7 border-l-4 border-l-indigo-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500 shadow-2xs">
                <Building2 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Office Operations & Sprints</h3>
                <span className="text-xs text-indigo-500 font-medium">Enterprise & Engineering Workflow</span>
              </div>
            </div>
            <ul className="space-y-3 text-body-sm text-text-secondary">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                <span>Sprint planning with Backlog, In Progress, Review, and Done swimlanes.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                <span>Assign tasks to engineering and design teammates with due dates and labels.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                <span>Granular permission gating ensures only project admins can archive or delete.</span>
              </li>
            </ul>
          </div>

          {/* Home Workflow */}
          <div className="glass-card rounded-2xl p-7 border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-2xs">
                <Home size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Personal & Household Management</h3>
                <span className="text-xs text-emerald-500 font-medium">Daily Chores & Budget Tracking</span>
              </div>
            </div>
            <ul className="space-y-3 text-body-sm text-text-secondary">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Organize grocery shopping, kitchen repairs, and utility bill due dates.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Checklist subtasks for complex family projects like solar savings or home cleaning.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Switch between workspaces instantly in 1 click from the sidebar dropdown.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================================
          METRICS & ARCHITECTURE STATS BANNER
          ============================================================ */}
      <section id="architecture" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-cyan-500/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="font-heading text-3xl sm:text-5xl font-extrabold gradient-text">14</div>
              <div className="text-xs sm:text-sm font-semibold text-text-primary mt-1">Domain Modules</div>
              <div className="text-[11px] text-text-tertiary">Architectural Breadth</div>
            </div>
            <div>
              <div className="font-heading text-3xl sm:text-5xl font-extrabold gradient-text">70+</div>
              <div className="text-xs sm:text-sm font-semibold text-text-primary mt-1">Discrete Features</div>
              <div className="text-[11px] text-text-tertiary">Complete Hackathon Spec</div>
            </div>
            <div>
              <div className="font-heading text-3xl sm:text-5xl font-extrabold gradient-text">&lt;50ms</div>
              <div className="text-xs sm:text-sm font-semibold text-text-primary mt-1">Interaction Latency</div>
              <div className="text-[11px] text-text-tertiary">Optimistic State Engine</div>
            </div>
            <div>
              <div className="font-heading text-3xl sm:text-5xl font-extrabold gradient-text">100%</div>
              <div className="text-xs sm:text-sm font-semibold text-text-primary mt-1">Type-Safe & Tested</div>
              <div className="text-[11px] text-text-tertiary">Next.js 16 + React 19</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FAQ ACCORDION SECTION
          ============================================================ */}
      <section id="faq" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-border-primary/60">
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Frequently Asked Questions</h2>
          <p className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            Everything you need to know.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, idx) => (
            <div
              key={idx}
              className="glass-card rounded-xl border border-border-primary overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-bg-hover transition-colors"
              >
                <span className="font-heading text-base font-semibold text-text-primary">{item.question}</span>
                {openFaq === idx ? (
                  <ChevronUp size={18} className="text-indigo-500 flex-shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-text-tertiary flex-shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-body-sm text-text-secondary border-t border-border-secondary leading-relaxed animate-fade-in">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          COMPREHENSIVE FOOTER
          ============================================================ */}
      <footer className="relative z-10 border-t border-border-primary/80 bg-bg-secondary/70 glass-panel py-12 px-4 sm:px-6 lg:px-8 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white">
              <Layers size={15} />
            </div>
            <span className="font-heading font-bold text-text-primary">Workspace Manager</span>
            <span className="text-caption text-text-tertiary">• Full-Stack Hackathon Project</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-text-secondary text-xs">
            <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#views" className="hover:text-text-primary transition-colors">Views</a>
            <a href="#architecture" className="hover:text-text-primary transition-colors">Architecture</a>
            <a href="#faq" className="hover:text-text-primary transition-colors">FAQ</a>
            <a
              href="https://github.com/muhiudinali/Hakathone-first"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-primary flex items-center gap-1 transition-colors"
            >
              GitHub <ExternalLink size={11} />
            </a>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Operational • All Systems Normal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
