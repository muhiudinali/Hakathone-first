'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCreateWorkspaceOpen, selectCurrentUserId } from '@/store/selectors';
import { createWorkspace, setCurrentWorkspace } from '@/store/slices/workspaceSlice';
import { setCreateWorkspaceOpen } from '@/store/slices/uiSlice';
import { addActivity } from '@/store/slices/activitySlice';
import { Modal, Button, Input, Select, useToast } from '@/components/ui';
import { generateId, PROJECT_COLORS, PROJECT_ICONS } from '@/lib/utils';
import { ViewType, Workspace } from '@/types';

import { Building2, Sparkles, Smile, Palette, Layout, Plus, X } from 'lucide-react';

export default function CreateWorkspaceModal() {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectCreateWorkspaceOpen);
  const currentUserId = useAppSelector(selectCurrentUserId);
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏢');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [defaultView, setDefaultView] = useState<ViewType>('kanban');
  const [error, setError] = useState('');

  const close = () => {
    dispatch(setCreateWorkspaceOpen(false));
    setName('');
    setIcon('🏢');
    setColor(PROJECT_COLORS[0]);
    setDefaultView('kanban');
    setError('');
  };

  const handleCreate = () => {
    if (!name.trim()) {
      setError('Workspace name is required');
      return;
    }
    if (!currentUserId) return;

    const wsId = `ws-${generateId()}`;
    const newWorkspace: Workspace = {
      id: wsId,
      name: name.trim(),
      icon,
      color,
      defaultView,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUserId,
    };

    dispatch(createWorkspace({
      workspace: newWorkspace,
      member: {
        id: generateId(),
        workspaceId: wsId,
        userId: currentUserId,
        role: 'owner',
        joinedAt: new Date().toISOString(),
      },
    }));

    dispatch(setCurrentWorkspace(wsId));

    dispatch(addActivity({
      id: generateId(),
      workspaceId: wsId,
      projectId: '',
      userId: currentUserId,
      action: 'created',
      target: name.trim(),
      timestamp: new Date().toISOString(),
    }));

    addToast({ type: 'success', message: `Workspace "${name.trim()}" created` });
    close();
  };

  return (
    <Modal open={open} onClose={close} title="Create Workspace" size="md">
      <div className="space-y-4 mt-4">
        {/* Quick Presets */}
        <div>
          <label className="text-body-sm font-medium text-text-primary flex items-center gap-1.5 mb-1.5">
            <Sparkles size={14} className="text-accent-primary" /> Quick Presets
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => { setName('Acme Corp (Office)'); setIcon('🏢'); setColor('#3B82F6'); setError(''); }}
              className="p-2.5 border border-border-primary hover:border-accent-primary rounded-xl text-left transition-colors cursor-pointer bg-bg-secondary/70 hover:bg-bg-hover shadow-2xs"
            >
              <div className="text-lg mb-1">🏢</div>
              <div className="text-body-xs font-semibold text-text-primary truncate">Office Workspace</div>
              <div className="text-caption text-text-tertiary truncate">Office ka Kaam</div>
            </button>
            <button
              type="button"
              onClick={() => { setName('Home & Personal (Ghar)'); setIcon('🏡'); setColor('#10B981'); setError(''); }}
              className="p-2.5 border border-border-primary hover:border-accent-primary rounded-xl text-left transition-colors cursor-pointer bg-bg-secondary/70 hover:bg-bg-hover shadow-2xs"
            >
              <div className="text-lg mb-1">🏡</div>
              <div className="text-body-xs font-semibold text-text-primary truncate">Home Workspace</div>
              <div className="text-caption text-text-tertiary truncate">Ghar ka Kaam</div>
            </button>
            <button
              type="button"
              onClick={() => { setName('Tech & Engineering'); setIcon('💻'); setColor('#8B5CF6'); setError(''); }}
              className="p-2.5 border border-border-primary hover:border-accent-primary rounded-xl text-left transition-colors cursor-pointer bg-bg-secondary/70 hover:bg-bg-hover shadow-2xs"
            >
              <div className="text-lg mb-1">💻</div>
              <div className="text-body-xs font-semibold text-text-primary truncate">Tech & Product</div>
              <div className="text-caption text-text-tertiary truncate">Sprint Backlog</div>
            </button>
          </div>
        </div>

        <Input
          label="Workspace Name"
          icon={<Building2 size={14} />}
          placeholder="e.g. Acme Corp, Marketing Team"
          value={name}
          onChange={e => { setName(e.target.value); setError(''); }}
          error={error}
          autoFocus
        />

        {/* Icon Selection */}
        <div>
          <label className="text-body-sm font-medium text-text-primary flex items-center gap-1.5 mb-1.5">
            <Smile size={14} className="text-accent-primary" /> Workspace Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_ICONS.slice(0, 10).map(ic => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                className={`h-9 w-9 text-lg rounded-xl border flex items-center justify-center transition-transform cursor-pointer ${
                  icon === ic ? 'border-accent-primary bg-accent-primary/10 scale-110 shadow-xs' : 'border-border-primary hover:bg-bg-hover'
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <label className="text-body-sm font-medium text-text-primary flex items-center gap-1.5 mb-1.5">
            <Palette size={14} className="text-accent-primary" /> Theme Color
          </label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`h-7 w-7 rounded-full transition-transform cursor-pointer ${
                  color === c ? 'ring-2 ring-offset-2 ring-accent-primary scale-110 shadow-xs' : 'hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-body-sm font-medium text-text-primary flex items-center gap-1.5 mb-1.5">
            <Layout size={14} className="text-accent-primary" /> Default View
          </label>
          <select
            value={defaultView}
            onChange={e => setDefaultView(e.target.value as ViewType)}
            className="w-full h-9 px-3 bg-bg-secondary/70 backdrop-blur-md border border-border-primary rounded-xl text-sm text-text-primary shadow-xs cursor-pointer"
          >
            <option value="kanban">Kanban Board</option>
            <option value="list">List View</option>
            <option value="calendar">Calendar View</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border-primary/80">
          <Button variant="secondary" icon={<X size={15} />} onClick={close}>Cancel</Button>
          <Button variant="primary" icon={<Plus size={15} />} onClick={handleCreate} disabled={!name.trim()}>Create Workspace</Button>
        </div>
      </div>
    </Modal>
  );
}
