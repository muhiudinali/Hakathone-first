'use client';

import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  closestCorners, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectProjectKanbanColumns, selectAllUsers, selectCurrentWorkspaceLabels } from '@/store/selectors';
import { moveTask } from '@/store/slices/taskSlice';
import { addKanbanColumn, updateKanbanColumn, deleteKanbanColumn } from '@/store/slices/projectSlice';
import { setTaskDetailId } from '@/store/slices/uiSlice';
import { addActivity } from '@/store/slices/activitySlice';
import { Task, TaskStatus, STATUS_CONFIG, PRIORITY_CONFIG, KanbanColumn } from '@/types';
import {
  Avatar, Badge, useToast, Button, Input, Modal, Dropdown, DropdownItem, IconButton,
} from '@/components/ui';
import { cn, generateId, formatShortDate, isOverdue, PROJECT_COLORS } from '@/lib/utils';
import {
  MessageSquare, CheckSquare, Clock, Plus, MoreHorizontal, Trash2, Edit2,
} from 'lucide-react';

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
}

export default function KanbanBoard({ projectId, tasks }: KanbanBoardProps) {
  const dispatch = useAppDispatch();
  const columns = useAppSelector(selectProjectKanbanColumns(projectId));
  const users = useAppSelector(selectAllUsers);
  const labels = useAppSelector(selectCurrentWorkspaceLabels);
  const { addToast } = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  const subtasks = useAppSelector(s => s.tasks.subtasks);
  const comments = useAppSelector(s => s.comments.entities);
  const wsId = useAppSelector(s => s.workspaces.currentWorkspaceId);
  const userId = useAppSelector(s => s.auth.currentUserId);

  // Add column modal state
  const [addColumnOpen, setAddColumnOpen] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  const [newColStatus, setNewColStatus] = useState<TaskStatus>('todo');
  const [newColColor, setNewColColor] = useState(PROJECT_COLORS[0]);

  // Edit column modal state
  const [editColModal, setEditColModal] = useState<KanbanColumn | null>(null);
  const [editColTitle, setEditColTitle] = useState('');
  const [editColColor, setEditColColor] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter(t => t.status === status).sort((a, b) => a.order - b.order);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Dropped on a column
    const targetColumn = columns.find(c => c.id === overId);
    if (targetColumn) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== targetColumn.status) {
        dispatch(moveTask({ taskId, newStatus: targetColumn.status, newOrder: 0 }));
        addToast({ type: 'info', message: `Task moved to ${targetColumn.title}` });
        if (wsId && userId) {
          dispatch(addActivity({
            id: generateId(), workspaceId: wsId, projectId, taskId,
            userId, action: 'status_changed', target: task.title,
            metadata: { from: task.status, to: targetColumn.status },
            timestamp: new Date().toISOString(),
          }));
        }
      }
      return;
    }

    // Dropped on another task
    const targetTask = tasks.find(t => t.id === overId);
    if (targetTask) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== targetTask.status) {
        dispatch(moveTask({ taskId, newStatus: targetTask.status, newOrder: targetTask.order + 1 }));
        addToast({ type: 'info', message: `Task moved to ${targetTask.status}` });
      }
    }
  };

  const handleAddColumn = () => {
    if (!newColTitle.trim()) return;
    const newCol: KanbanColumn = {
      id: `col-${generateId()}`,
      projectId,
      title: newColTitle.trim(),
      status: newColStatus,
      order: columns.length,
      color: newColColor,
    };
    dispatch(addKanbanColumn(newCol));
    addToast({ type: 'success', message: `Column "${newColTitle}" added` });
    setNewColTitle('');
    setAddColumnOpen(false);
  };

  const handleSaveEditColumn = () => {
    if (!editColModal || !editColTitle.trim()) return;
    dispatch(updateKanbanColumn({
      projectId,
      columnId: editColModal.id,
      changes: { title: editColTitle.trim(), color: editColColor },
    }));
    addToast({ type: 'success', message: 'Column updated' });
    setEditColModal(null);
  };

  const handleDeleteColumn = (colId: string) => {
    if (columns.length <= 1) {
      addToast({ type: 'error', message: 'Cannot delete the last column' });
      return;
    }
    dispatch(deleteKanbanColumn({ projectId, columnId: colId }));
    addToast({ type: 'info', message: 'Column removed' });
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full overflow-x-auto">
        <div className="flex gap-4 p-6 h-full min-w-max items-start">
          {columns.map(column => {
            const columnTasks = getTasksByStatus(column.status);
            return (
              <SortableContext
                key={column.id}
                items={[column.id, ...columnTasks.map(t => t.id)]}
                strategy={verticalListSortingStrategy}
              >
                <KanbanColumnView
                  column={column}
                  tasks={columnTasks}
                  users={users}
                  labels={labels}
                  subtasks={subtasks}
                  comments={comments}
                  onTaskClick={(id) => dispatch(setTaskDetailId(id))}
                  onEdit={() => {
                    setEditColModal(column);
                    setEditColTitle(column.title);
                    setEditColColor(column.color);
                  }}
                  onDelete={() => handleDeleteColumn(column.id)}
                  canDelete={columns.length > 1}
                />
              </SortableContext>
            );
          })}

          {/* Add Column Button */}
          <div className="w-[260px] flex-shrink-0 pt-1">
            <button
              type="button"
              onClick={() => setAddColumnOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border-primary hover:border-accent-primary text-text-secondary hover:text-accent-primary hover:bg-bg-hover transition-all cursor-pointer text-body-sm font-medium"
            >
              <Plus size={16} /> Add Column
            </button>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="w-[280px] opacity-90 shadow-xl">
            <TaskCardContent task={activeTask} users={users} labels={labels} subtasks={subtasks} comments={comments} />
          </div>
        )}
      </DragOverlay>

      {/* Add Column Modal */}
      <Modal open={addColumnOpen} onClose={() => setAddColumnOpen(false)} title="Add Kanban Column" size="sm">
        <div className="space-y-4 mt-4">
          <Input
            label="Column Title"
            placeholder="e.g. In Review, QA"
            value={newColTitle}
            onChange={e => setNewColTitle(e.target.value)}
            autoFocus
          />

          <div>
            <label className="text-body-sm font-medium text-text-primary block mb-1">Task Status Map</label>
            <select
              value={newColStatus}
              onChange={e => setNewColStatus(e.target.value as TaskStatus)}
              className="w-full h-9 px-3 bg-bg-secondary border border-border-primary rounded-lg text-sm"
            >
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-body-sm font-medium text-text-primary block mb-1.5">Color</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.slice(0, 8).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColColor(c)}
                  style={{ backgroundColor: c }}
                  className={`h-6 w-6 rounded-full cursor-pointer transition-transform ${
                    newColColor === c ? 'ring-2 ring-offset-2 ring-accent-primary scale-110' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border-primary">
            <Button variant="secondary" onClick={() => setAddColumnOpen(false)}>Cancel</Button>
            <Button onClick={handleAddColumn} disabled={!newColTitle.trim()}>Add</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Column Modal */}
      <Modal open={!!editColModal} onClose={() => setEditColModal(null)} title="Edit Column" size="sm">
        <div className="space-y-4 mt-4">
          <Input
            label="Column Title"
            value={editColTitle}
            onChange={e => setEditColTitle(e.target.value)}
            autoFocus
          />

          <div>
            <label className="text-body-sm font-medium text-text-primary block mb-1.5">Color</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.slice(0, 8).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setEditColColor(c)}
                  style={{ backgroundColor: c }}
                  className={`h-6 w-6 rounded-full cursor-pointer transition-transform ${
                    editColColor === c ? 'ring-2 ring-offset-2 ring-accent-primary scale-110' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border-primary">
            <Button variant="secondary" onClick={() => setEditColModal(null)}>Cancel</Button>
            <Button onClick={handleSaveEditColumn}>Save</Button>
          </div>
        </div>
      </Modal>
    </DndContext>
  );
}

function KanbanColumnView({
  column, tasks, users, labels, subtasks, comments, onTaskClick, onEdit, onDelete, canDelete,
}: {
  column: KanbanColumn;
  tasks: Task[];
  users: Record<string, { name: string }>;
  labels: { id: string; name: string; color: string }[];
  subtasks: Record<string, { completed: boolean }[]>;
  comments: Record<string, { taskId: string }>;
  onTaskClick: (id: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const { setNodeRef } = useSortable({ id: column.id, data: { type: 'column' } });

  return (
    <div
      ref={setNodeRef}
      className="w-[305px] flex flex-col flex-shrink-0 glass-column rounded-2xl p-3 border border-white/60 dark:border-white/10 shadow-xs max-h-[calc(100vh-175px)]"
    >
      <div className="flex items-center justify-between px-1.5 py-1 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="h-2.5 w-2.5 rounded-full flex-shrink-0 shadow-xs"
            style={{
              backgroundColor: column.color,
              boxShadow: `0 0 8px ${column.color}80`,
            }}
          />
          <span className="text-body-sm font-bold text-text-primary truncate font-heading">{column.title}</span>
          <span className="text-[11px] font-semibold text-text-secondary bg-bg-tertiary/70 border border-border-primary/50 px-2 py-0.5 rounded-full shadow-2xs">
            {tasks.length}
          </span>
        </div>

        <Dropdown
          trigger={
            <IconButton size="sm" variant="ghost" tooltip="Column options">
              <MoreHorizontal size={14} />
            </IconButton>
          }
          align="right"
        >
          <DropdownItem icon={<Edit2 size={13} />} onClick={onEdit}>Edit column</DropdownItem>
          {canDelete && (
            <DropdownItem icon={<Trash2 size={13} />} danger onClick={onDelete}>Delete column</DropdownItem>
          )}
        </Dropdown>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto pb-2 min-h-[140px] pr-2 pl-0.5">
        {tasks.map(task => (
          <SortableTaskCard
            key={task.id}
            task={task}
            users={users}
            labels={labels}
            subtasks={subtasks}
            comments={comments}
            onClick={() => onTaskClick(task.id)}
          />
        ))}
        {tasks.length === 0 && (
          <div className="h-28 border border-dashed border-border-primary/70 rounded-xl flex flex-col items-center justify-center text-caption text-text-tertiary gap-1 bg-bg-tertiary/20">
            <span>Drop tasks here</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableTaskCard({
  task, users, labels, subtasks, comments, onClick,
}: {
  task: Task;
  users: Record<string, { name: string }>;
  labels: { id: string; name: string; color: string }[];
  subtasks: Record<string, { completed: boolean }[]>;
  comments: Record<string, { taskId: string }>;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task' },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick} className="cursor-pointer">
      <TaskCardContent task={task} users={users} labels={labels} subtasks={subtasks} comments={comments} />
    </div>
  );
}

function TaskCardContent({
  task, users, labels, subtasks, comments,
}: {
  task: Task;
  users: Record<string, { name: string }>;
  labels: { id: string; name: string; color: string }[];
  subtasks: Record<string, { completed: boolean }[]>;
  comments: Record<string, { taskId: string }>;
}) {
  const taskSubtasks = subtasks[task.id] || [];
  const completedSubtasks = taskSubtasks.filter(s => s.completed).length;
  const taskComments = Object.values(comments).filter(c => c.taskId === task.id);
  const taskLabels = labels.filter(l => task.labelIds.includes(l.id));

  return (
    <div className="glass-task-card rounded-xl p-3.5 border border-white/80 dark:border-white/10 shadow-xs hover:border-accent-primary/40 transition-all duration-200 group">
      {/* Labels */}
      {taskLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {taskLabels.map(l => (
            <span
              key={l.id}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md border shadow-2xs"
              style={{
                backgroundColor: `${l.color}15`,
                color: l.color,
                borderColor: `${l.color}35`,
              }}
              title={l.name}
            >
              {l.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-body-sm font-semibold text-text-primary leading-snug mb-2.5 group-hover:text-accent-primary transition-colors break-words">
        {task.title}
      </p>

      {/* Meta Row */}
      <div className="flex items-center gap-2 flex-wrap pt-0.5 border-t border-border-secondary/50">
        {/* Priority */}
        <Badge size="sm" color={PRIORITY_CONFIG[task.priority].color}>
          {PRIORITY_CONFIG[task.priority].label}
        </Badge>

        {/* Due Date */}
        {task.dueDate && (
          <span className={cn(
            'flex items-center gap-1 text-caption px-1.5 py-0.5 rounded',
            isOverdue(task.dueDate)
              ? 'text-error font-semibold bg-error/10'
              : 'text-text-tertiary bg-bg-tertiary/50',
          )}>
            <Clock size={11} />
            {formatShortDate(task.dueDate)}
          </span>
        )}

        <div className="flex-1" />

        {/* Subtask progress */}
        {taskSubtasks.length > 0 && (
          <span className="flex items-center gap-1 text-caption text-text-tertiary bg-bg-tertiary/50 px-1.5 py-0.5 rounded">
            <CheckSquare size={11} className={completedSubtasks === taskSubtasks.length ? 'text-success' : ''} />
            {completedSubtasks}/{taskSubtasks.length}
          </span>
        )}

        {/* Comments count */}
        {taskComments.length > 0 && (
          <span className="flex items-center gap-1 text-caption text-text-tertiary bg-bg-tertiary/50 px-1.5 py-0.5 rounded">
            <MessageSquare size={11} />
            {taskComments.length}
          </span>
        )}

        {/* Assignee */}
        {task.assigneeId && users[task.assigneeId] && (
          <Avatar name={users[task.assigneeId].name} size="xs" />
        )}
      </div>
    </div>
  );
}
