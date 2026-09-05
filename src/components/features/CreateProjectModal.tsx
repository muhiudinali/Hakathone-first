'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectCreateProjectOpen, selectCurrentWorkspaceId, selectCurrentUserId,
  selectCurrentWorkspaceMembers, selectAllUsers,
} from '@/store/selectors';
import { createProject, setCurrentProject } from '@/store/slices/projectSlice';
import { createTask } from '@/store/slices/taskSlice';
import { setCreateProjectOpen } from '@/store/slices/uiSlice';
import { addActivity } from '@/store/slices/activitySlice';
import { Modal, Button, Input, Textarea, Avatar, Checkbox, useToast } from '@/components/ui';
import { generateId, PROJECT_COLORS, PROJECT_ICONS } from '@/lib/utils';
import { PROJECT_TEMPLATES } from '@/lib/mock-data/templates';
import { KanbanColumn, Project, ProjectMember } from '@/types';

export default function CreateProjectModal() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectCreateProjectOpen);
  const currentWorkspaceId = useAppSelector(selectCurrentWorkspaceId);
  const currentUserId = useAppSelector(selectCurrentUserId);
  const wsMembers = useAppSelector(selectCurrentWorkspaceMembers);
  const users = useAppSelector(selectAllUsers);
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('blank');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    currentUserId ? [currentUserId] : []
  );
  const [error, setError] = useState('');

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (templateId === 'blank') return;
    const tpl = PROJECT_TEMPLATES.find(t => t.id === templateId);
    if (tpl) {
      setName(tpl.name);
      setDescription(tpl.description);
      setIcon(tpl.icon);
    }
  };

  const close = () => {
    dispatch(setCreateProjectOpen(false));
    setName('');
    setDescription('');
    setIcon('📁');
    setColor(PROJECT_COLORS[0]);
    setSelectedTemplateId('blank');
    setSelectedMemberIds(currentUserId ? [currentUserId] : []);
    setError('');
  };

  const handleCreate = () => {
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    if (!currentWorkspaceId || !currentUserId) return;

    const projectId = `proj-${generateId()}`;
    const newProject: Project = {
      id: projectId,
      workspaceId: currentWorkspaceId,
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      archived: false,
      createdBy: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Default Kanban columns
    const kanbanColumns: KanbanColumn[] = [
      { id: `col-${generateId()}`, projectId, title: 'Backlog', status: 'backlog', order: 0, color: '#94A3B8' },
      { id: `col-${generateId()}`, projectId, title: 'To Do', status: 'todo', order: 1, color: '#3B82F6' },
      { id: `col-${generateId()}`, projectId, title: 'In Progress', status: 'in_progress', order: 2, color: '#F59E0B' },
      { id: `col-${generateId()}`, projectId, title: 'In Review', status: 'review', order: 3, color: '#8B5CF6' },
      { id: `col-${generateId()}`, projectId, title: 'Done', status: 'done', order: 4, color: '#10B981' },
    ];

    // Project members
    const members: ProjectMember[] = selectedMemberIds.map(userId => ({
      id: generateId(),
      projectId,
      userId,
      role: userId === currentUserId ? 'owner' : 'member',
      joinedAt: new Date().toISOString(),
    }));

    dispatch(createProject({ project: newProject, members, kanbanColumns }));

    // If a template was selected, seed the template tasks!
    const tpl = PROJECT_TEMPLATES.find(t => t.id === selectedTemplateId);
    if (tpl && tpl.tasks) {
      tpl.tasks.forEach((t, i) => {
        dispatch(createTask({
          id: `task-${generateId()}-${i}`,
          projectId,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate,
          assigneeId: t.assigneeId,
          labelIds: t.labelIds,
          order: i,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: currentUserId,
        }));
      });
    }

    dispatch(addActivity({
      id: generateId(),
      workspaceId: currentWorkspaceId,
      projectId,
      userId: currentUserId,
      action: 'created',
      target: name.trim(),
      timestamp: new Date().toISOString(),
    }));

    dispatch(setCurrentProject(projectId));
    addToast({ type: 'success', message: `Project "${name.trim()}" created` });
    close();
    router.push(`/workspaces/${currentWorkspaceId}/projects/${projectId}`);
  };

  return (
    <Modal open={open} onClose={close} title="Create Project" size="lg">
      <div className="space-y-5 mt-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Template Selector */}
        <div>
          <label className="text-body-sm font-medium text-text-primary block mb-2">Start from a Template</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleSelectTemplate('blank')}
              className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                selectedTemplateId === 'blank'
                  ? 'border-accent-primary bg-bg-hover ring-1 ring-accent-primary'
                  : 'border-border-primary hover:bg-bg-hover'
              }`}
            >
              <div className="text-lg mb-1">✨</div>
              <div className="text-body-sm font-medium text-text-primary">Blank</div>
              <div className="text-caption text-text-tertiary truncate">Start fresh</div>
            </button>
            {PROJECT_TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tpl.id)}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  selectedTemplateId === tpl.id
                    ? 'border-accent-primary bg-bg-hover ring-1 ring-accent-primary'
                    : 'border-border-primary hover:bg-bg-hover'
                }`}
              >
                <div className="text-lg mb-1">{tpl.icon}</div>
                <div className="text-body-sm font-medium text-text-primary truncate">{tpl.name}</div>
                <div className="text-caption text-text-tertiary">{tpl.tasks.length} tasks</div>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Project Name"
          placeholder="e.g. Website Redesign"
          value={name}
          onChange={e => { setName(e.target.value); setError(''); }}
          error={error}
        />

        <Textarea
          label="Description"
          placeholder="What is this project about?"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
        />

        {/* Icon & Color Selection */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-body-sm font-medium text-text-primary block mb-1.5">Project Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {PROJECT_ICONS.slice(0, 10).map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`h-8 w-8 text-base rounded-md border flex items-center justify-center cursor-pointer transition-transform ${
                    icon === ic ? 'border-accent-primary bg-bg-hover scale-110' : 'border-border-primary hover:bg-bg-hover'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-body-sm font-medium text-text-primary block mb-1.5">Color Tag</label>
            <div className="flex flex-wrap gap-1.5">
              {PROJECT_COLORS.slice(0, 10).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`h-7 w-7 rounded-full cursor-pointer transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-accent-primary scale-110' : 'hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Assign Members */}
        <div>
          <label className="text-body-sm font-medium text-text-primary block mb-2">Project Members</label>
          <div className="space-y-1.5 max-h-36 overflow-y-auto border border-border-primary rounded-lg p-2 bg-bg-secondary">
            {wsMembers.map(m => {
              const u = users[m.userId];
              if (!u) return null;
              const isChecked = selectedMemberIds.includes(m.userId);
              return (
                <label
                  key={m.userId}
                  className="flex items-center gap-2.5 p-1.5 rounded hover:bg-bg-hover cursor-pointer"
                >
                  <Checkbox
                    checked={isChecked}
                    onChange={checked => {
                      if (checked) {
                        setSelectedMemberIds([...selectedMemberIds, m.userId]);
                      } else {
                        setSelectedMemberIds(selectedMemberIds.filter(id => id !== m.userId));
                      }
                    }}
                  />
                  <Avatar name={u.name} size="xs" />
                  <span className="text-body-sm text-text-primary flex-1 truncate">{u.name}</span>
                  <span className="text-caption text-text-tertiary capitalize">{m.role}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border-primary">
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>Create Project</Button>
        </div>
      </div>
    </Modal>
  );
}
