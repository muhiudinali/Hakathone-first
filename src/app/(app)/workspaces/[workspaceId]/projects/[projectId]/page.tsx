'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectCurrentProject, selectFilteredSortedProjectTasks,
  selectProjectView, selectCurrentUserWorkspaceRole, selectAllUsers,
  selectActiveFilters, selectSelectedTaskIds,
  selectCurrentWorkspaceId, selectProjectMembers,
} from '@/store/selectors';
import {
  setCurrentProject, updateProject, archiveProject, unarchiveProject, deleteProject,
} from '@/store/slices/projectSlice';
import { setCurrentWorkspace } from '@/store/slices/workspaceSlice';
import { setProjectView } from '@/store/slices/settingsSlice';
import { setCreateTaskOpen } from '@/store/slices/uiSlice';
import {
  clearSelection, bulkChangeStatus, bulkAssign, bulkDelete,
} from '@/store/slices/taskSlice';
import {
  Button, IconButton, Badge, EmptyState, ConfirmDialog, Modal, Input, Textarea,
  Dropdown, DropdownItem, DropdownSeparator, Avatar, AvatarGroup, useToast, DynamicIcon,
} from '@/components/ui';
import KanbanBoard from '@/components/features/KanbanBoard';
import ListView from '@/components/features/ListView';
import CalendarView from '@/components/features/CalendarView';
import FilterBar from '@/components/features/FilterBar';
import { canCreateTask, canEditProject, canDeleteProject } from '@/lib/permissions';
import { ViewType, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';
import {
  Columns3, List, Calendar, Plus, Filter, X, MoreHorizontal,
  Archive, Trash2, Edit3, CheckCircle, FolderKanban, Check,
} from 'lucide-react';

interface ProjectPageProps {
  params: Promise<{ workspaceId: string; projectId: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { workspaceId, projectId } = use(params);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const project = useAppSelector(selectCurrentProject);
  const view = useAppSelector(selectProjectView(projectId));
  const tasks = useAppSelector(selectFilteredSortedProjectTasks);
  const role = useAppSelector(selectCurrentUserWorkspaceRole);
  const selectedIds = useAppSelector(selectSelectedTaskIds);
  const filters = useAppSelector(selectActiveFilters);
  const users = useAppSelector(selectAllUsers);
  const projectMembers = useAppSelector(selectProjectMembers(projectId));
  const { addToast } = useToast();

  const [showFilters, setShowFilters] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    if (workspaceId) {
      dispatch(setCurrentWorkspace(workspaceId));
    }
    dispatch(setCurrentProject(projectId));
  }, [workspaceId, projectId, dispatch]);

  const handleOpenEditModal = () => {
    if (project) {
      setEditName(project.name);
      setEditDesc(project.description || '');
    }
    setEditModalOpen(true);
  };

  const hasActiveFilters = filters.assigneeIds.length > 0 || filters.labelIds.length > 0 ||
    filters.priorities.length > 0 || filters.statuses.length > 0 || filters.searchQuery !== '';

  const viewTabs = [
    { id: 'kanban' as ViewType, label: 'Board', icon: <Columns3 size={15} /> },
    { id: 'list' as ViewType, label: 'List', icon: <List size={15} /> },
    { id: 'calendar' as ViewType, label: 'Calendar', icon: <Calendar size={15} /> },
  ];

  if (!project) {
    return (
      <div className="p-6">
        <EmptyState title="Project not found" description="This project may have been deleted." />
      </div>
    );
  }

  const canEdit = role ? canEditProject(role).allowed : false;
  const canDelete = role ? canDeleteProject(role).allowed : false;

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    dispatch(updateProject({
      id: projectId,
      changes: { name: editName.trim(), description: editDesc.trim() },
    }));
    setEditModalOpen(false);
    addToast({ type: 'success', message: 'Project updated' });
  };

  const handleToggleArchive = () => {
    if (project.archived) {
      dispatch(unarchiveProject(projectId));
      addToast({ type: 'success', message: 'Project restored' });
    } else {
      dispatch(archiveProject(projectId));
      addToast({ type: 'info', message: 'Project archived' });
    }
  };

  const handleDeleteProject = () => {
    dispatch(deleteProject(projectId));
    addToast({ type: 'info', message: `Project "${project.name}" deleted` });
    setDeleteConfirmOpen(false);
    router.push('/dashboard');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Project Header */}
      <div className="flex-shrink-0 border-b border-border-primary/80 glass-header px-6 py-3.5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shadow-xs border flex-shrink-0"
              style={{
                backgroundColor: `${project.color}15`,
                borderColor: `${project.color}30`,
                color: project.color,
              }}
            >
              <DynamicIcon icon={project.icon || 'folder'} size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-heading-md text-text-primary font-heading truncate">{project.name}</h1>
                {project.archived && (
                  <Badge size="sm" color="#94A3B8">Archived</Badge>
                )}
              </div>
              {project.description && (
                <p className="text-caption text-text-secondary truncate mt-0.5">{project.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Members avatars */}
            {projectMembers.length > 0 && (
              <div className="hidden md:flex items-center -space-x-1.5 mr-2">
                {projectMembers.slice(0, 4).map(pm => {
                  const u = users[pm.userId];
                  return u ? <Avatar key={pm.id} name={u.name} size="xs" /> : null;
                })}
              </div>
            )}

            {role && canCreateTask(role).allowed && !project.archived && (
              <Button
                size="sm"
                variant="primary"
                icon={<Plus size={15} />}
                onClick={() => dispatch(setCreateTaskOpen(true))}
                className="shadow-sm shadow-indigo-500/20"
              >
                New Task
              </Button>
            )}

            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              tooltip="Filters"
              variant={hasActiveFilters ? 'outline' : 'ghost'}
              className={hasActiveFilters ? 'border-accent-primary text-accent-primary bg-accent-primary/10' : ''}
            >
              <Filter size={16} />
              {hasActiveFilters && <span className="sr-only">Filters active</span>}
            </IconButton>

            {/* Project Options Dropdown */}
            {canEdit && (
              <Dropdown
                trigger={
                  <IconButton tooltip="Project options" variant="ghost">
                    <MoreHorizontal size={16} />
                  </IconButton>
                }
                align="right"
              >
                <DropdownItem icon={<Edit3 size={14} />} onClick={handleOpenEditModal}>
                  Edit project
                </DropdownItem>
                <DropdownItem icon={<Archive size={14} />} onClick={handleToggleArchive}>
                  {project.archived ? 'Unarchive project' : 'Archive project'}
                </DropdownItem>
                {canDelete && (
                  <>
                    <DropdownSeparator />
                    <DropdownItem icon={<Trash2 size={14} />} danger onClick={() => setDeleteConfirmOpen(true)}>
                      Delete project
                    </DropdownItem>
                  </>
                )}
              </Dropdown>
            )}
          </div>
        </div>

        {/* View Tabs - Modern Glass Pill Segmented Control */}
        <div className="flex items-center gap-1.5 mt-3.5 p-1 bg-bg-tertiary/60 border border-border-primary/60 rounded-xl w-fit backdrop-blur-md">
          {viewTabs.map(tab => {
            const isActive = view === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => dispatch(setProjectView({ projectId, view: tab.id }))}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer select-none',
                  isActive
                    ? 'bg-accent-primary text-white shadow-sm shadow-indigo-500/25'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/40 dark:hover:bg-white/5',
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      {showFilters && <FilterBar />}

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex-shrink-0 bg-indigo-600/95 backdrop-blur-xl border-y border-indigo-400/30 text-white px-6 py-2.5 flex items-center gap-3 flex-wrap shadow-lg">
          <span className="text-body-sm font-medium">{selectedIds.length} task{selectedIds.length > 1 ? 's' : ''} selected</span>
          <div className="flex-1" />

          {/* Bulk status change */}
          <select
            className="h-7 px-2 text-xs bg-white/20 border border-white/30 rounded text-white cursor-pointer"
            onChange={(e) => {
              if (e.target.value) {
                dispatch(bulkChangeStatus({ taskIds: selectedIds, status: e.target.value as TaskStatus }));
                addToast({ type: 'success', message: 'Status updated for selected tasks' });
              }
              e.target.value = '';
            }}
            defaultValue=""
          >
            <option value="" disabled className="text-text-primary">Change status</option>
            <option value="backlog" className="text-text-primary">Backlog</option>
            <option value="todo" className="text-text-primary">To Do</option>
            <option value="in_progress" className="text-text-primary">In Progress</option>
            <option value="in_review" className="text-text-primary">In Review</option>
            <option value="done" className="text-text-primary">Done</option>
          </select>

          {/* Bulk assign */}
          <select
            className="h-7 px-2 text-xs bg-white/20 border border-white/30 rounded text-white cursor-pointer"
            onChange={(e) => {
              const val = e.target.value;
              dispatch(bulkAssign({ taskIds: selectedIds, assigneeId: val === 'unassigned' ? null : val }));
              addToast({ type: 'success', message: 'Assignee updated for selected tasks' });
              e.target.value = '';
            }}
            defaultValue=""
          >
            <option value="" disabled className="text-text-primary">Assign to...</option>
            <option value="unassigned" className="text-text-primary">Unassigned</option>
            {Object.values(users).map(u => (
              <option key={u.id} value={u.id} className="text-text-primary">{u.name}</option>
            ))}
          </select>

          <Button size="sm" variant="danger" icon={<Trash2 size={13} />} onClick={() => setBulkDeleteOpen(true)}>
            Delete
          </Button>

          <IconButton onClick={() => dispatch(clearSelection())} tooltip="Clear selection">
            <X size={16} className="text-white" />
          </IconButton>
        </div>
      )}

      {/* View Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'kanban' && <KanbanBoard projectId={projectId} tasks={tasks} />}
        {view === 'list' && <ListView tasks={tasks} />}
        {view === 'calendar' && <CalendarView tasks={tasks} />}
      </div>

      {/* Edit Project Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Project" size="md">
        <div className="space-y-4 mt-4">
          <Input
            label="Project Name"
            icon={<FolderKanban size={15} />}
            value={editName}
            onChange={e => setEditName(e.target.value)}
          />
          <Textarea
            label="Description"
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-border-primary">
            <Button variant="secondary" icon={<X size={14} />} onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button icon={<Check size={14} />} onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Project Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteProject}
        title={`Delete "${project.name}"?`}
        message="All tasks, columns, and history in this project will be permanently removed."
        confirmLabel="Delete Project"
        variant="danger"
      />

      {/* Bulk Delete Tasks Dialog */}
      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={() => {
          dispatch(bulkDelete(selectedIds));
          setBulkDeleteOpen(false);
          addToast({ type: 'info', message: `${selectedIds.length} tasks deleted` });
        }}
        title="Delete tasks"
        message={`Are you sure you want to delete ${selectedIds.length} task(s)? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
