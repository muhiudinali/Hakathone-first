-- ============================================================
-- WORKSPACE MANAGER SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor
-- ============================================================

-- 1. Profiles (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Workspaces
CREATE TABLE IF NOT EXISTS public.workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🏢',
  color TEXT DEFAULT '#3B82F6',
  default_view TEXT DEFAULT 'kanban',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Workspace Members
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '📁',
  color TEXT DEFAULT '#3B82F6',
  archived BOOLEAN DEFAULT FALSE,
  template TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Project Members
CREATE TABLE IF NOT EXISTS public.project_members (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Kanban Columns
CREATE TABLE IF NOT EXISTS public.kanban_columns (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  "order" INT NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#3B82F6'
);

-- 7. Labels
CREATE TABLE IF NOT EXISTS public.labels (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6'
);

-- 8. Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  assignee_id TEXT,
  label_ids TEXT[] DEFAULT '{}',
  "order" INT NOT NULL DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Subtasks
CREATE TABLE IF NOT EXISTS public.subtasks (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  "order" INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Comments
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  content TEXT NOT NULL,
  mentions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Activity Events
CREATE TABLE IF NOT EXISTS public.activity_events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  task_id TEXT,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON public.projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_task ON public.subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_task ON public.comments(task_id);
CREATE INDEX IF NOT EXISTS idx_activity_workspace ON public.activity_events(workspace_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

-- Allow full access for authenticated users & anon users with API key
DO $$
BEGIN
  CREATE POLICY "Allow all read access" ON public.profiles FOR SELECT USING (true);
  CREATE POLICY "Allow all write access" ON public.profiles FOR ALL USING (true);

  CREATE POLICY "Allow all read access" ON public.workspaces FOR SELECT USING (true);
  CREATE POLICY "Allow all write access" ON public.workspaces FOR ALL USING (true);

  CREATE POLICY "Allow all read access" ON public.workspace_members FOR SELECT USING (true);
  CREATE POLICY "Allow all write access" ON public.workspace_members FOR ALL USING (true);

  CREATE POLICY "Allow all read access" ON public.projects FOR SELECT USING (true);
  CREATE POLICY "Allow all write access" ON public.projects FOR ALL USING (true);

  CREATE POLICY "Allow all read access" ON public.project_members FOR SELECT USING (true);
  CREATE POLICY "Allow all write access" ON public.project_members FOR ALL USING (true);

  CREATE POLICY "Allow all read access" ON public.kanban_columns FOR SELECT USING (true);
  CREATE POLICY "Allow all write access" ON public.kanban_columns FOR ALL USING (true);

  CREATE POLICY "Allow all read access" ON public.labels FOR SELECT USING (true);
  CREATE POLICY "Allow all write access" ON public.labels FOR ALL USING (true);

  CREATE POLICY "Allow all read access" ON public.tasks FOR SELECT USING (true);
  CREATE POLICY "Allow all write access" ON public.tasks FOR ALL USING (true);

  CREATE POLICY "Allow all read access" ON public.subtasks FOR SELECT USING (true);
  CREATE POLICY "Allow all write access" ON public.subtasks FOR ALL USING (true);

  CREATE POLICY "Allow all read access" ON public.comments FOR SELECT USING (true);
  CREATE POLICY "Allow all write access" ON public.comments FOR ALL USING (true);

  CREATE POLICY "Allow all read access" ON public.activity_events FOR SELECT USING (true);
  CREATE POLICY "Allow all write access" ON public.activity_events FOR ALL USING (true);
EXCEPTION WHEN OTHERS THEN
  -- Policies already exist
  NULL;
END $$;

-- ============================================================
-- REALTIME ENABLEMENT
-- ============================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.subtasks;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.workspaces;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
