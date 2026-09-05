'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectTheme, selectDefaultView, selectNotificationPreferences } from '@/store/selectors';
import { setTheme, setDefaultView } from '@/store/slices/settingsSlice';
import { setNotificationPreferences } from '@/store/slices/notificationSlice';
import { clearAllStorage } from '@/lib/persistence/localStorage';
import { clearAllAttachments } from '@/lib/persistence/indexedDB';
import { Button, Switch, Select, ConfirmDialog, Tabs, useToast } from '@/components/ui';
import { ThemeMode, ViewType } from '@/types';
import { Download, Upload, Trash2, Moon, Sun, Monitor, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const defaultView = useAppSelector(selectDefaultView);
  const notifPrefs = useAppSelector(selectNotificationPreferences);
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [resetConfirm, setResetConfirm] = useState(false);

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

  const tabs = [
    { id: 'general', label: 'General' },
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
