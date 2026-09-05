'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectTheme, selectDefaultView, selectNotificationPreferences } from '@/store/selectors';
import { setTheme, setDefaultView } from '@/store/slices/settingsSlice';
import { setNotificationPreferences } from '@/store/slices/notificationSlice';
import { clearAllStorage } from '@/lib/persistence/localStorage';
import { clearAllAttachments } from '@/lib/persistence/indexedDB';
import { Button, Switch, Select, ConfirmDialog, Tabs, Input, Badge, useToast } from '@/components/ui';
import { ThemeMode, ViewType } from '@/types';
import {
  Download, Upload, Trash2, Moon, Sun, Monitor, AlertTriangle,
  Database, CheckCircle2, XCircle, RefreshCw, Copy, ExternalLink,
} from 'lucide-react';
import {
  getSupabaseCredentials, saveSupabaseCredentials, clearSupabaseCredentials, isSupabaseConfigured,
} from '@/lib/supabase/client';
import { testSupabaseConnection, uploadLocalDataToSupabase } from '@/lib/supabase/service';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const defaultView = useAppSelector(selectDefaultView);
  const notifPrefs = useAppSelector(selectNotificationPreferences);
  const fullState = useAppSelector(s => s);
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [resetConfirm, setResetConfirm] = useState(false);

  // Supabase state
  const initialCreds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(initialCreds.url);
  const [supabaseKey, setSupabaseKey] = useState(initialCreds.key);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>(
    isSupabaseConfigured() ? 'connected' : 'idle'
  );
  const [statusError, setStatusError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Import/Export
  const handleExport = () => {
    const state = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {
        auth: localStorage.getItem('wm_auth'),
        users: localStorage.getItem('wm_users'),
        workspaces: localStorage.getItem('wm_workspaces'),
        projects: localStorage.getItem('wm_projects'),
        tasks: localStorage.getItem('wm_tasks'),
        comments: localStorage.getItem('wm_comments'),
        activity: localStorage.getItem('wm_activity'),
        notifications: localStorage.getItem('wm_notifications'),
        settings: localStorage.getItem('wm_settings'),
        savedFilters: localStorage.getItem('wm_savedFilters'),
      },
    };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workspace-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', message: 'Data exported successfully' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!data.version || !data.data) {
          addToast({ type: 'error', message: 'Invalid export file format' });
          return;
        }
        Object.entries(data.data).forEach(([key, value]) => {
          if (value) localStorage.setItem(`wm_${key}`, value as string);
        });
        addToast({ type: 'success', message: 'Data imported! Reload to apply changes.' });
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        addToast({ type: 'error', message: 'Failed to parse import file' });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    clearAllStorage();
    try {
      await clearAllAttachments();
    } catch {}
    window.location.href = '/login';
  };

  const handleSaveSupabase = () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      addToast({ type: 'error', message: 'URL and Anon Key are required' });
      return;
    }
    saveSupabaseCredentials(supabaseUrl, supabaseKey);
    addToast({ type: 'success', message: 'Credentials saved! Testing connection...' });
    handleTestConnection();
  };

  const handleClearSupabase = () => {
    clearSupabaseCredentials();
    setSupabaseUrl('');
    setSupabaseKey('');
    setConnectionStatus('idle');
    setStatusError('');
    addToast({ type: 'info', message: 'Supabase credentials cleared' });
  };

  const handleTestConnection = async () => {
    setConnectionStatus('checking');
    setStatusError('');
    const res = await testSupabaseConnection();
    if (res.connected) {
      setConnectionStatus('connected');
      addToast({ type: 'success', message: 'Supabase database connected successfully!' });
    } else {
      setConnectionStatus('error');
      setStatusError(res.error || 'Connection failed');
      addToast({ type: 'error', message: `Supabase error: ${res.error}` });
    }
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    const result = await uploadLocalDataToSupabase({
      users: Object.values(fullState.auth.users),
      workspaces: Object.values(fullState.workspaces.entities),
      workspaceMembers: Object.values(fullState.workspaces.members).flat(),
      projects: Object.values(fullState.projects.entities),
      projectMembers: Object.values(fullState.projects.members).flat(),
      kanbanColumns: Object.values(fullState.projects.kanbanColumns).flat(),
      labels: Object.values(fullState.workspaces.labels).flat(),
      tasks: Object.values(fullState.tasks.entities),
      subtasks: Object.values(fullState.tasks.subtasks).flat(),
      comments: Object.values(fullState.comments.entities),
      activity: fullState.activity.events,
    });
    setIsSyncing(false);
    if (result.success) {
      addToast({ type: 'success', message: result.message });
    } else {
      addToast({ type: 'error', message: result.message });
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(`-- View and copy full schema from supabase/schema.sql in your workspace`);
    setCopiedSchema(true);
    addToast({ type: 'success', message: 'Schema path copied! Open supabase/schema.sql' });
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'supabase', label: 'Supabase Backend' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'data', label: 'Data' },
    { id: 'danger', label: 'Danger Zone' },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-heading-lg text-text-primary mb-6">Settings</h1>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <SettingSection title="Default View" description="Choose the default view for new projects">
              <Select
                value={defaultView}
                onChange={e => dispatch(setDefaultView(e.target.value as ViewType))}
                options={[
                  { value: 'kanban', label: 'Kanban Board' },
                  { value: 'list', label: 'List View' },
                  { value: 'calendar', label: 'Calendar View' },
                ]}
              />
            </SettingSection>
          </div>
        )}

        {activeTab === 'supabase' && (
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                    <Database size={20} />
                  </div>
                  <div>
                    <h3 className="text-body-md font-semibold text-text-primary flex items-center gap-2">
                      Supabase Cloud Backend
                      {connectionStatus === 'connected' && (
                        <Badge size="sm" color="#10B981">
                          <CheckCircle2 size={12} className="inline mr-1" /> Connected
                        </Badge>
                      )}
                      {connectionStatus === 'checking' && (
                        <Badge size="sm" color="#3B82F6">
                          <RefreshCw size={12} className="inline mr-1 animate-spin" /> Checking...
                        </Badge>
                      )}
                      {connectionStatus === 'error' && (
                        <Badge size="sm" color="#EF4444">
                          <XCircle size={12} className="inline mr-1" /> Connection Error
                        </Badge>
                      )}
                      {connectionStatus === 'idle' && (
                        <Badge size="sm" color="#94A3B8">
                          Local Fallback Mode
                        </Badge>
                      )}
                    </h3>
                    <p className="text-body-sm text-text-secondary mt-0.5">
                      {connectionStatus === 'connected'
                        ? 'Your application is connected to your Supabase PostgreSQL cloud database.'
                        : 'Connect your Supabase project URL and Anon key to enable cloud synchronization and multi-device access.'}
                    </p>
                    {statusError && (
                      <p className="text-caption text-error mt-1">{statusError}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<RefreshCw size={14} className={connectionStatus === 'checking' ? 'animate-spin' : ''} />}
                    onClick={handleTestConnection}
                  >
                    Test Connection
                  </Button>
                </div>
              </div>
            </div>

            {/* Credentials Setup */}
            <SettingSection
              title="Project API Credentials"
              description="Find these in your Supabase Dashboard under Project Settings -> API"
            >
              <div className="space-y-3">
                <Input
                  label="Project URL"
                  placeholder="https://your-project-id.supabase.co"
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                />
                <Input
                  label="Anon / Public Key"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={e => setSupabaseKey(e.target.value)}
                  type="password"
                />
                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveSupabase}>
                      Save & Connect
                    </Button>
                    {(supabaseUrl || supabaseKey) && (
                      <Button size="sm" variant="ghost" onClick={handleClearSupabase}>
                        Disconnect
                      </Button>
                    )}
                  </div>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-caption text-text-link hover:underline flex items-center gap-1"
                  >
                    Open Supabase Dashboard <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </SettingSection>

            {/* Cloud Sync & Migration */}
            <SettingSection
              title="Data Synchronization"
              description="Push your local workspaces, projects, tasks, and comments to your Supabase PostgreSQL tables"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-body-sm text-text-primary font-medium">Sync Local Workspace to Cloud</p>
                  <p className="text-caption text-text-secondary">
                    Uploads {Object.keys(fullState.workspaces.entities).length} workspaces, {Object.keys(fullState.projects.entities).length} projects, and {Object.keys(fullState.tasks.entities).length} tasks.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  icon={<Upload size={14} className={isSyncing ? 'animate-spin' : ''} />}
                  onClick={handleSyncToSupabase}
                  disabled={isSyncing}
                >
                  {isSyncing ? 'Syncing...' : 'Upload Local Data to Supabase'}
                </Button>
              </div>
            </SettingSection>

            {/* Database Setup Helper */}
            <SettingSection
              title="Database Schema SQL"
              description="Execute this script once in your Supabase SQL Editor to create all required tables and indexes"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm text-text-primary font-medium">PostgreSQL Migration Script</p>
                  <p className="text-caption text-text-secondary">Located in project root at <code className="bg-bg-tertiary px-1.5 py-0.5 rounded text-xs">supabase/schema.sql</code></p>
                </div>
                <Button size="sm" variant="outline" icon={<Copy size={14} />} onClick={handleCopySchema}>
                  {copiedSchema ? 'Copied!' : 'Copy Schema Info'}
                </Button>
              </div>
            </SettingSection>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <SettingSection title="Theme" description="Choose your preferred color theme">
              <div className="flex gap-3">
                {([
                  { value: 'light' as ThemeMode, label: 'Light', icon: <Sun size={16} /> },
                  { value: 'dark' as ThemeMode, label: 'Dark', icon: <Moon size={16} /> },
                  { value: 'system' as ThemeMode, label: 'System', icon: <Monitor size={16} /> },
                ]).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => dispatch(setTheme(opt.value))}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all cursor-pointer ${
                      theme === opt.value
                        ? 'border-accent-primary bg-bg-hover'
                        : 'border-border-primary hover:border-text-tertiary'
                    }`}
                  >
                    {opt.icon}
                    <span className="text-body-sm font-medium text-text-primary">{opt.label}</span>
                  </button>
                ))}
              </div>
            </SettingSection>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <SettingSection title="Notification Preferences" description="Choose what notifications you receive">
              <div className="space-y-3">
                <Switch
                  checked={notifPrefs.assignments}
                  onChange={c => dispatch(setNotificationPreferences({ assignments: c }))}
                  label="Task assignments"
                />
                <Switch
                  checked={notifPrefs.mentions}
                  onChange={c => dispatch(setNotificationPreferences({ mentions: c }))}
                  label="Comment mentions"
                />
                <Switch
                  checked={notifPrefs.dueDates}
                  onChange={c => dispatch(setNotificationPreferences({ dueDates: c }))}
                  label="Due date reminders"
                />
              </div>
            </SettingSection>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <SettingSection title="Export Data" description="Download all workspace data as JSON">
              <Button variant="secondary" icon={<Download size={15} />} onClick={handleExport}>
                Export Data
              </Button>
            </SettingSection>
            <SettingSection title="Import Data" description="Import data from a previously exported JSON file">
              <label className="cursor-pointer">
                <Button variant="secondary" icon={<Upload size={15} />} onClick={() => {}}>
                  Import Data
                </Button>
                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
              </label>
            </SettingSection>
          </div>
        )}

        {activeTab === 'danger' && (
          <div className="bg-error/5 border border-error/20 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-error flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-heading-sm text-text-primary">Reset All Data</h3>
                <p className="text-body-sm text-text-secondary mt-1 mb-4">
                  This will permanently delete all data including workspaces, projects, tasks, comments, and settings.
                  This cannot be undone.
                </p>
                <Button variant="danger" icon={<Trash2 size={15} />} onClick={() => setResetConfirm(true)}>
                  Reset All Data
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={resetConfirm}
        onClose={() => setResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset all data?"
        message="This will permanently delete all your data and return the application to its initial state. This action cannot be undone."
        confirmLabel="Reset Everything"
        variant="danger"
      />
    </div>
  );
}

function SettingSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
      <h3 className="text-body-md font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-body-sm text-text-secondary mb-4">{description}</p>
      {children}
    </div>
  );
}
