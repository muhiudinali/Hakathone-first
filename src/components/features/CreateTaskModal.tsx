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

import { Plus, X, Type, FolderKanban, Calendar, Tag, CheckCircle2, Flag, User, FileText } from 'lucide-react';

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

  const effectiveRole = role || 'member';
  if (effectiveRole === 'viewer') return null;

  return (
    <Modal open={open} onClose={close} title="Create Task" size="md">
      <div className="space-y-4 mt-4">
        {/* Project Selector if multiple or not pinned */}
        {!projectId && workspaceProjects.length > 0 && (
          <div>
            <label className="text-body-sm font-medium text-text-primary flex items-center gap-1.5 mb-1.5">
              <FolderKanban size={14} className="text-accent-primary" /> Project
            </label>
            <select
              value={activeProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="w-full h-9 px-3 bg-bg-secondary/70 backdrop-blur-md border border-border-primary rounded-xl text-sm text-text-primary shadow-xs"
            >
              {workspaceProjects.map(p => (
                <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
              ))}
            </select>
          </div>
        )}

        <Input
          label="Title"
          icon={<Type size={14} />}
          placeholder="What needs to be done?"
          value={title}
          onChange={e => { setTitle(e.target.value); setError(''); }}
          error={error}
          autoFocus
        />

        <Textarea
          label="Description"
          placeholder="Add details, notes, or checklist..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-body-sm font-medium text-text-primary flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 size={13} className="text-accent-primary" /> Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as TaskStatus)}
              className="w-full h-9 px-3 bg-bg-secondary/70 backdrop-blur-md border border-border-primary rounded-xl text-sm text-text-primary shadow-xs"
            >
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-body-sm font-medium text-text-primary flex items-center gap-1.5 mb-1.5">
              <Flag size={13} className="text-accent-primary" /> Priority
            </label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
              className="w-full h-9 px-3 bg-bg-secondary/70 backdrop-blur-md border border-border-primary rounded-xl text-sm text-text-primary shadow-xs"
            >
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-body-sm font-medium text-text-primary flex items-center gap-1.5 mb-1.5">
              <User size={13} className="text-accent-primary" /> Assignee
            </label>
            <select
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
              className="w-full h-9 px-3 bg-bg-secondary/70 backdrop-blur-md border border-border-primary rounded-xl text-sm text-text-primary shadow-xs"
            >
              <option value="">Unassigned</option>
              {Object.values(users).map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <Input
            label="Due Date"
            icon={<Calendar size={14} />}
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>

        {labels.length > 0 && (
          <div>
            <label className="text-body-sm font-medium text-text-primary flex items-center gap-1.5 mb-1.5">
              <Tag size={13} className="text-accent-primary" /> Labels
            </label>
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
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border transition-all cursor-pointer ${
                      selected
                        ? 'text-white border-transparent shadow-2xs'
                        : 'border-border-primary text-text-secondary hover:bg-bg-hover'
                    }`}
                    style={selected ? { backgroundColor: label.color } : {}}
                  >
                    <Tag size={10} />
                    {label.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-border-primary/80">
          <Button variant="secondary" icon={<X size={15} />} onClick={close}>Cancel</Button>
          <Button variant="primary" icon={<Plus size={15} />} onClick={handleCreate} disabled={!title.trim()}>Create Task</Button>
        </div>
      </div>
    </Modal>
  );
}
