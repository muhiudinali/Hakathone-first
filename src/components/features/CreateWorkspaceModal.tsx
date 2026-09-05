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
        <Input
          label="Workspace Name"
          placeholder="e.g. Acme Corp, Marketing Team"
          value={name}
          onChange={e => { setName(e.target.value); setError(''); }}
          error={error}
          autoFocus
        />

        {/* Icon Selection */}
        <div>
          <label className="text-body-sm font-medium text-text-primary block mb-1.5">Workspace Icon</label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_ICONS.slice(0, 10).map(ic => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                className={`h-9 w-9 text-lg rounded-lg border flex items-center justify-center transition-transform cursor-pointer ${
                  icon === ic ? 'border-accent-primary bg-bg-hover scale-110 shadow-sm' : 'border-border-primary hover:bg-bg-hover'
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <label className="text-body-sm font-medium text-text-primary block mb-1.5">Theme Color</label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`h-7 w-7 rounded-full transition-transform cursor-pointer ${
                  color === c ? 'ring-2 ring-offset-2 ring-accent-primary scale-110' : 'hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>

        <Select
          label="Default View"
          value={defaultView}
          onChange={e => setDefaultView(e.target.value as ViewType)}
          options={[
            { value: 'kanban', label: 'Kanban Board' },
            { value: 'list', label: 'List View' },
            { value: 'calendar', label: 'Calendar View' },
          ]}
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-border-primary">
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>Create Workspace</Button>
        </div>
      </div>
    </Modal>
  );
}
