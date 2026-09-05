'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectAllUsers, selectCurrentWorkspaceLabels, selectCreateTaskOpen,
  selectCurrentUserWorkspaceRole, selectWorkspaceProjects, selectCurrentProjectId,
} from '@/store/selectors';
import { createTask } from '@/store/slices/taskSlice';
import { addActivity } from '@/store/slices/activitySlice';
import { setCreateTaskOpen } from '@/store/slices/uiSlice';
import { Modal, Button, Input, Textarea, Select, useToast } from '@/components/ui';
import { canCreateTask } from '@/lib/permissions';
import { TaskStatus, Priority, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types';
import { generateId } from '@/lib/utils';

interface CreateTaskModalProps {
  projectId?: string;
}

export default function CreateTaskModal({ projectId }: CreateTaskModalProps) {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectCreateTaskOpen);
  const users = useAppSelector(selectAllUsers);
  const labels = useAppSelector(selectCurrentWorkspaceLabels);
  const role = useAppSelector(selectCurrentUserWorkspaceRole);
  const currentUserId = useAppSelector(s => s.auth.currentUserId);
  const wsId = useAppSelector(s => s.workspaces.currentWorkspaceId);
  const currentActiveProjectId = useAppSelector(selectCurrentProjectId);
  const workspaceProjects = useAppSelector(selectWorkspaceProjects);
  const { addToast } = useToast();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [error, setError] = useState('');

  const activeProjectId = selectedProjectId || projectId || currentActiveProjectId || workspaceProjects[0]?.id || '';

  const close = () => {
    dispatch(setCreateTaskOpen(false));
    setSelectedProjectId('');
    setTitle('');
    setDescription('');
    setStatus('todo');
    setPriority('medium');
    setAssigneeId('');
    setDueDate('');
    setSelectedLabels([]);
    setError('');
  };

  const handleCreate = () => {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    const finalProjectId = projectId || activeProjectId || workspaceProjects[0]?.id;
    if (!finalProjectId) {
      setError('Please select a project for this task');
      return;
    }
    if (!currentUserId) return;

    const taskId = `task-${generateId()}`;
    dispatch(createTask({
      id: taskId,
      projectId: finalProjectId,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      assigneeId: assigneeId || null,
      labelIds: selectedLabels,
      order: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUserId,
    }));

    if (wsId) {
      dispatch(addActivity({
        id: generateId(),
        workspaceId: wsId,
        projectId: finalProjectId,
        taskId,
        userId: currentUserId,
        action: 'created',
        target: title.trim(),
        timestamp: new Date().toISOString(),
      }));
    }

    addToast({ type: 'success', message: 'Task created' });
    close();
  };

  if (!role || !canCreateTask(role).allowed) return null;

  return (
    <Modal open={open} onClose={close} title="Create Task" size="md">
      <div className="space-y-4 mt-4">
        {/* Project Selector if multiple or not pinned */}
        {!projectId && workspaceProjects.length > 0 && (
          <div>
            <label className="text-body-sm font-medium text-text-primary block mb-1">Project</label>
            <select
              value={activeProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="w-full h-9 px-3 bg-bg-secondary border border-border-primary rounded-lg text-sm text-text-primary"
            >
              {workspaceProjects.map(p => (
                <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
              ))}
            </select>
          </div>
        )}

        <Input
          label="Title"
          placeholder="What needs to be done?"
          value={title}
          onChange={e => { setTitle(e.target.value); setError(''); }}
          error={error}
          autoFocus
        />

        <Textarea
          label="Description"
          placeholder="Add details..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Status"
            value={status}
            onChange={e => setStatus(e.target.value as TaskStatus)}
            options={Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <Select
            label="Priority"
            value={priority}
            onChange={e => setPriority(e.target.value as Priority)}
            options={Object.entries(PRIORITY_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Assignee"
            value={assigneeId}
            onChange={e => setAssigneeId(e.target.value)}
            options={[
              { value: '', label: 'Unassigned' },
              ...Object.values(users).map(u => ({ value: u.id, label: u.name })),
            ]}
          />
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>

        {labels.length > 0 && (
          <div>
            <label className="text-body-sm font-medium text-text-primary block mb-1.5">Labels</label>
            <div className="flex flex-wrap gap-1.5">
              {labels.map(label => {
                const selected = selectedLabels.includes(label.id);
                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => {
                      setSelectedLabels(prev =>
                        selected ? prev.filter(id => id !== label.id) : [...prev, label.id]
                      );
                    }}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-all cursor-pointer ${
                      selected
                        ? 'text-white border-transparent'
                        : 'border-border-primary text-text-secondary hover:bg-bg-hover'
                    }`}
                    style={selected ? { backgroundColor: label.color } : {}}
                  >
                    {label.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-border-primary">
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!title.trim()}>Create Task</Button>
        </div>
      </div>
    </Modal>
  );
}
