# Workspace Manager — Google Workflow Edition

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.12+-764ABC?style=flat&logo=redux)](https://redux-toolkit.js.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)

An enterprise-grade, high-performance project and workspace management suite inspired by **Google Workflow & Google Workspace (Material 3)** aesthetics. Built with Next.js 16 (Turbopack), React 19, Redux Toolkit, and Supabase Cloud.

---

## 📌 Project Overview

**Workspace Manager** is designed for modern teams, freelancers, and engineering organizations who demand zero-latency task management, intuitive multi-workspace isolation, and clean Google Material 3 visual ergonomics.

Whether tracking software sprints, managing client projects, or organizing personal workflows, Workspace Manager delivers an offline-first architecture with instant cloud synchronization.

---

## 🚀 Key Functions & Features

### 1. Multi-Tier Workspace & Project Hierarchy
- **Isolated Workspaces**: Create separate environments for different teams, organizations, or personal goals.
- **Projects & Categorization**: Group tasks within dedicated projects featuring customizable icons, categories, and color codes.
- **Role-Based Access Control (RBAC)**: Enforce security with granular permissions across 4 tiers:
  - **Owner**: Full destructive, billing, and organizational authority.
  - **Admin**: Member management, project creation, and settings control.
  - **Member**: Create, edit, and assign tasks.
  - **Viewer**: Read-only oversight for stakeholders and auditors.

### 2. Full Task Management & Workflow Pipeline (CRUD)
- **5-Stage Workflow Pipeline**: Tasks move fluidly through `Backlog` → `To Do` → `In Progress` → `Review` → `Done`.
- **Rich Task Metadata**: Assign priority levels (`Low`, `Medium`, `High`, `Urgent`), due dates, assignees, tags, descriptions, and checklist subtasks.
- **Activity & Audit Logging**: Real-time event tracking capturing task creation, edits, assignments, and completions.

### 3. Three Core Interactive Project Views
- **Interactive Kanban Board**:
  - Drag-and-drop tasks between workflow columns powered by `@dnd-kit`.
  - Real-time column metrics, priority indicators, and quick-add task triggers.
- **High-Density Relational List View**:
  - Spreadsheet-inspired relational table with column sorting, status filters, and bulk actions.
  - Optimized for power users managing high-volume tasks.
- **Monthly Calendar View**:
  - Date-based schedule mapping tasks to completion deadlines.
  - Visual status color-coding for rapid deadline tracking.

### 4. Google Material 3 / Google Workflow Design System
- **Google 4-Color Signature Accent Bar**: Visual continuity using Google Blue (`#1A73E8`), Green (`#34A853`), Amber (`#F9AB00`), and Red (`#EA4335`).
- **Signature "+ Create" Pill**: Floating action button with a custom Google multi-color icon.
- **Google Workspace Search Pill**: Header search bar inspired by Google Drive and Gmail with `⌘K` shortcut integration.
- **Tonal Status Chips & Rounded Surfaces**: Clean Material 3 borders, elevation shadows, and geometric typography (`Roboto`, `Roboto Mono`, `Google Sans`/`Outfit`).
- **Dynamic Light & Dark Themes**: Fully integrated high-contrast dark mode (`#202124`) and clean light mode (`#F8FAFD`).

### 5. Developer & Power User Productivity
- **Command Palette (`⌘K` / `Ctrl+K`)**: Instant fuzzy search across tasks, projects, workspaces, and navigation routes.
- **Global Quick Shortcuts**:
  - Press `C` anywhere to open the Quick Task Creation modal.
  - `⌘Z` / `⌘Y` for full state undo/redo capability.
  - `?` to open the interactive keyboard cheat sheet.
- **Instant Demo Authentication**: One-click frictionless evaluator access without mandatory registration walls.

---

## 💡 Key Uses & Real-World Benefits

| Benefit / Use Case | How Workspace Manager Solves It |
| :--- | :--- |
| **Zero-Latency Execution** | Local Redux state guarantees that UI clicks, drags, and edits happen at **0ms delay**, eliminating sluggish spinner spinners. |
| **Offline-First Reliability** | Work continues seamlessly when offline or during spotty internet connections. Changes persist in local storage and sync to Supabase when reconnected. |
| **Multi-Project Isolation** | Freelancers and agencies can manage completely independent workspaces for distinct clients under a single dashboard. |
| **Distraction-Free Focus** | Clean Google Workspace typography and uncluttered Material 3 layouts reduce cognitive fatigue during long working sessions. |
| **Hackathon & Evaluation Ready** | Built with an auto-login demo evaluator flow so judges and evaluators can immediately explore full CRUD capabilities in seconds. |
| **Enterprise Cloud Sync** | Ready for PostgreSQL backends with pre-built Supabase schemas, tables, relational foreign keys, and RLS policies (`supabase/schema.sql`). |

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Server & Client Components)
- **UI & Runtime**: [React 19](https://react.dev/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) & [React-Redux](https://react-redux.js.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with Vanilla CSS custom design tokens
- **Drag and Drop**: [@dnd-kit/core](https://dndkit.com/) & [@dnd-kit/sortable](https://dndkit.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Utilities**: [date-fns](https://date-fns.org/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL cloud database with RLS)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict typing)

---

## 📁 Repository Structure

```text
├── src/
│   ├── app/
│   │   ├── (app)/                       # Authenticated Application Shell
│   │   │   ├── activity/                # Workspace Audit Log & Activity Stream
│   │   │   ├── dashboard/               # Google Workflow Overview & Metrics
│   │   │   ├── my-tasks/                # Personal Task Queue & Filters
│   │   │   ├── profile/                 # User Settings & Account Management
│   │   │   ├── settings/                # System Preferences & Theme Controls
│   │   │   └── workspaces/              # Dynamic Workspace & Project Views
│   │   ├── login/                       # Sign In Portal
│   │   ├── signup/                      # Account Registration
│   │   ├── globals.css                  # Google Material 3 tokens & CSS variables
│   │   ├── layout.tsx                   # Root Layout with Font Configurations
│   │   └── page.tsx                     # Product Landing Page
│   ├── components/
│   │   ├── layout/                      # Header, Sidebar, Navigation
│   │   ├── ui/                          # Button, Badge, Modal, Drawer, Tabs
│   │   ├── CommandPalette.tsx           # Global ⌘K Quick Action Search
│   │   └── ShortcutsModal.tsx           # Keyboard Navigation Guide
│   ├── lib/                             # Utilities, Local Storage, Supabase Client
│   ├── store/                           # Redux Toolkit Slices & Selectors
│   │   ├── slices/                      # auth, workspace, project, task, ui, settings
│   │   └── index.ts                     # Redux Store Configuration
│   └── types/                           # TypeScript Interfaces & Enums
├── supabase/
│   └── schema.sql                       # PostgreSQL Database Schema & RLS Policies
├── public/                              # Static Assets & Icons
└── package.json                         # Dependencies and Scripts
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js**: `v18.18.0` or higher (Node 20+ recommended)
- **npm**, **pnpm**, or **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/muhiudinali/Hakathone-first.git
   cd Hakathone-first
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional for Cloud Sync)**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase credentials if enabling PostgreSQL synchronization:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
   *(Note: The app runs in fully operational offline-first mode without Supabase credentials).*

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>⌘</kbd> + <kbd>K</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd> | Open Google Command Palette |
| <kbd>C</kbd> | Quick Create Task |
| <kbd>⌘</kbd> + <kbd>Z</kbd> / <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Undo State Action |
| <kbd>⌘</kbd> + <kbd>Y</kbd> / <kbd>Ctrl</kbd> + <kbd>Y</kbd> | Redo State Action |
| <kbd>?</kbd> | Toggle Keyboard Shortcuts Cheat Sheet |
| <kbd>Esc</kbd> | Close Active Modals / Drawers |

---

## 📄 License & Attribution

This project was built for the **Full-Stack Hackathon**. Feel free to use, fork, and build upon this repository.
