'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectAllUsers, selectTaskDetailId, selectCurrentWorkspaceLabels,
  selectCurrentUserWorkspaceRole, selectAllTasks,
} from '@/store/selectors';
import {
  updateTask, deleteTask, changeTaskStatus, changeTaskPriority, assignTask,
  addSubtask, toggleSubtask, deleteSubtask, addTaskLabel, removeTaskLabel,
  duplicateTask, addAttachment, removeAttachment,
  convertSubtaskToTask, convertTaskToSubtask,
} from '@/store/slices/taskSlice';
import { addComment, updateComment, deleteComment } from '@/store/slices/commentSlice';
import { addActivity } from '@/store/slices/activitySlice';
import { setTaskDetailId } from '@/store/slices/uiSlice';
import { Drawer, Button, IconButton, Input, Textarea, Badge, Avatar, Checkbox, ConfirmDialog, Modal, useToast } from '@/components/ui';
import { canEditTask, canDeleteTask, canCreateComment, canEditComment, canDeleteComment } from '@/lib/permissions';
import { Task, Subtask, TaskStatus, Priority, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types';
import { cn, generateId, formatDate, formatRelativeTime, formatFileSize, isOverdue } from '@/lib/utils';
import {
  X, Edit3, Trash2, Copy, Paperclip,
  Plus, Send, CornerDownRight, Activity as ActivityIcon, Edit2,
} from 'lucide-react';

export default function TaskDetailDrawer() {
  const dispatch = useAppDispatch();
  const taskId = useAppSelector(selectTaskDetailId);
  const task = useAppSelector(s => taskId ? s.tasks.entities[taskId] : null);
  const subtasks = useAppSelector(s => taskId ? s.tasks.subtasks[taskId] || [] : []);
  const attachments = useAppSelector(s => taskId ? s.tasks.attachments[taskId] || [] : []);
  const allTasksMap = useAppSelector(selectAllTasks);
  const comments = useAppSelector(s => {
    if (!taskId) return [];
    return Object.values(s.comments.entities)
      .filter(c => c.taskId === taskId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  });
  const taskActivities = useAppSelector(s => {
    if (!taskId) return [];
    return s.activity.events.filter(e => e.taskId === taskId);
  });
  const users = useAppSelector(selectAllUsers);
  const labels = useAppSelector(selectCurrentWorkspaceLabels);
  const role = useAppSelector(selectCurrentUserWorkspaceRole);
  const currentUserId = useAppSelector(s => s.auth.currentUserId);
  const wsId = useAppSelector(s => s.workspaces.currentWorkspaceId);
  const { addToast } = useToast();

  const [activeBottomTab, setActiveBottomTab] = useState<'comments' | 'activity'>('comments');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [descValue, setDescValue] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Edit comment state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  // Convert task to subtask modal
  const [convertToSubtaskOpen, setConvertToSubtaskOpen] = useState(false);
  const [parentTaskId, setParentTaskId] = useState('');

  // Mention autocomplete state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const commentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [prevTaskId, setPrevTaskId] = useState<string | null>(null);
  if (taskId !== prevTaskId) {
    setPrevTaskId(taskId);
    if (task) {
      setTitleValue(task.title);
      setDescValue(task.description);
    }
  }

  if (!task || !taskId) return null;

  const canEdit = role ? canEditTask(role).allowed : false;
  const canDelete = role ? canDeleteTask(role).allowed : false;
  const completedSubtasks = subtasks.filter(s => s.completed).length;

  const close = () => dispatch(setTaskDetailId(null));

  const handleSaveTitle = () => {
    if (titleValue.trim() && titleValue !== task.title) {
      dispatch(updateTask({ id: taskId, changes: { title: titleValue.trim() } }));
      addToast({ type: 'success', message: 'Task updated' });
    }
    setEditingTitle(false);
  };

  const handleSaveDesc = () => {
    dispatch(updateTask({ id: taskId, changes: { description: descValue } }));
    setEditingDesc(false);
  };

  const handleDelete = () => {
    const deletedTask = { ...task };
    const deletedSubtasks = [...subtasks];
    dispatch(deleteTask(taskId));
    close();
    addToast({
      type: 'info',
      message: 'Task deleted',
      action: {
        label: 'Undo',
        onClick: () => {
          dispatch({ type: 'tasks/restoreTask', payload: { task: deletedTask, subtasks: deletedSubtasks } });
          addToast({ type: 'success', message: 'Task restored' });
        },
      },
    });
  };

  const handleDuplicate = () => {
    dispatch(duplicateTask({ originalId: taskId, newId: `task-${generateId()}` }));
    addToast({ type: 'success', message: 'Task duplicated' });
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    dispatch(addSubtask({
      id: generateId(),
      taskId,
      title: newSubtask.trim(),
      completed: false,
      order: subtasks.length,
      createdAt: new Date().toISOString(),
    }));
    setNewSubtask('');
  };

  const handleConvertSubtaskToTask = (sub: Subtask) => {
    const newTask: Task = {
      id: `task-${generateId()}`,
      projectId: task.projectId,
      title: sub.title,
      description: '',
      status: sub.completed ? 'done' : 'todo',
      priority: 'medium',
      dueDate: null,
      assigneeId: null,
      labelIds: [],
      order: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUserId || 'system',
    };
    dispatch(convertSubtaskToTask({ subtask: sub, newTask }));
    addToast({ type: 'success', message: `Converted "${sub.title}" to standalone task` });
  };

  const handleConvertTaskToSubtask = () => {
    if (!parentTaskId) return;
    const parentTask = allTasksMap[parentTaskId];
    if (!parentTask) return;

    const sub: Subtask = {
      id: generateId(),
      taskId: parentTaskId,
      title: task.title,
      completed: task.status === 'done',
      order: 0,
      createdAt: new Date().toISOString(),
    };

    dispatch(convertTaskToSubtask({ taskId: task.id, parentTaskId, subtask: sub }));
    addToast({ type: 'success', message: `Task converted to subtask of "${parentTask.title}"` });
    setConvertToSubtaskOpen(false);
    close();
  };

  // Mention detection in comment
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewComment(val);
    const cursor = e.target.selectionStart || val.length;
    const textBeforeCursor = val.slice(0, cursor);
    const match = textBeforeCursor.match(/@(\w*)$/);
    if (match) {
      setMentionQuery(match[1].toLowerCase());
    } else {
      setMentionQuery(null);
    }
  };

  const handleSelectMention = (userName: string) => {
    if (mentionQuery === null) return;
    const lastAtIdx = newComment.lastIndexOf('@');
    if (lastAtIdx >= 0) {
      const updated = newComment.slice(0, lastAtIdx) + `@${userName} ` + newComment.slice(lastAtIdx + mentionQuery.length + 1);
      setNewComment(updated);
    }
    setMentionQuery(null);
    commentTextareaRef.current?.focus();
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !currentUserId) return;
    const mentions = newComment.match(/@([a-zA-Z]+(?:\s[a-zA-Z]+)?)/g)?.map(m => {
      const name = m.substring(1);
      const user = Object.values(users).find(u => u.name.toLowerCase() === name.toLowerCase());
      return user?.id;
    }).filter(Boolean) as string[] || [];

    dispatch(addComment({
      id: generateId(), taskId, authorId: currentUserId,
      content: newComment.trim(), mentions,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }));

    if (wsId) {
      dispatch(addActivity({
        id: generateId(), workspaceId: wsId, projectId: task.projectId, taskId,
        userId: currentUserId, action: 'commented', target: task.title,
        timestamp: new Date().toISOString(),
      }));
    }

    setNewComment('');
    addToast({ type: 'success', message: 'Comment added' });
  };

  const handleSaveEditComment = (commentId: string) => {
    if (!editCommentContent.trim()) return;
    dispatch(updateComment({ id: commentId, content: editCommentContent.trim() }));
    setEditingCommentId(null);
    setEditCommentContent('');
    addToast({ type: 'success', message: 'Comment updated' });
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId) return;
    const reader = new FileReader();
    reader.onload = () => {
      dispatch(addAttachment({
        id: generateId(), taskId, filename: file.name, fileType: file.type,
        size: file.size, dataUrl: reader.result as string, storedInIDB: false,
        createdAt: new Date().toISOString(), uploadedBy: currentUserId,
      }));
      addToast({ type: 'success', message: 'File attached' });
    };
    reader.readAsDataURL(file);
  };

  const filteredMentionUsers = mentionQuery !== null
    ? Object.values(users).filter(u => u.name.toLowerCase().includes(mentionQuery))
    : [];

  const otherProjectTasks = Object.values(allTasksMap).filter(t => t.projectId === task.projectId && t.id !== task.id);

  return (
    <>
      <Drawer open={!!taskId} onClose={close} title="Task Details" width="w-full sm:w-[540px]">
        <div className="p-5 space-y-5">
          {/* Title */}
          <div>
            {editingTitle ? (
              <input
                className="w-full text-lg font-semibold text-text-primary bg-transparent border-b-2 border-border-focus outline-none pb-1"
                value={titleValue}
                onChange={e => setTitleValue(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
                autoFocus
              />
            ) : (
              <h2
                className={cn('text-lg font-semibold text-text-primary', canEdit && 'cursor-pointer hover:text-text-link')}
                onClick={() => canEdit && setEditingTitle(true)}
              >
                {task.title}
              </h2>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex gap-2 flex-wrap">
            {canEdit && (
              <>
                <Button size="sm" variant="secondary" icon={<Copy size={13} />} onClick={handleDuplicate}>
                  Duplicate
                </Button>
                {otherProjectTasks.length > 0 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<CornerDownRight size={13} />}
                    onClick={() => setConvertToSubtaskOpen(true)}
                  >
                    Convert to Subtask
                  </Button>
                )}
              </>
            )}
            {canDelete && (
              <Button size="sm" variant="danger" icon={<Trash2 size={13} />} onClick={() => setDeleteConfirm(true)}>
                Delete
              </Button>
            )}
          </div>

          {/* Properties Grid */}
          <div className="space-y-3 bg-bg-tertiary rounded-xl p-4 border border-border-primary">
            {/* Status */}
            <div className="flex items-center gap-3">
              <span className="text-body-sm text-text-secondary w-20">Status</span>
              <select
                className="flex-1 h-8 px-2 text-sm bg-bg-secondary border border-border-primary rounded-md cursor-pointer text-text-primary"
                value={task.status}
                onChange={e => dispatch(changeTaskStatus({ taskId, status: e.target.value as TaskStatus }))}
                disabled={!canEdit}
              >
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="flex items-center gap-3">
              <span className="text-body-sm text-text-secondary w-20">Priority</span>
              <select
                className="flex-1 h-8 px-2 text-sm bg-bg-secondary border border-border-primary rounded-md cursor-pointer text-text-primary"
                value={task.priority}
                onChange={e => dispatch(changeTaskPriority({ taskId, priority: e.target.value as Priority }))}
                disabled={!canEdit}
              >
                {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div className="flex items-center gap-3">
              <span className="text-body-sm text-text-secondary w-20">Assignee</span>
              <select
                className="flex-1 h-8 px-2 text-sm bg-bg-secondary border border-border-primary rounded-md cursor-pointer text-text-primary"
                value={task.assigneeId || ''}
                onChange={e => dispatch(assignTask({ taskId, assigneeId: e.target.value || null }))}
                disabled={!canEdit}
              >
                <option value="">Unassigned</option>
                {Object.values(users).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-3">
              <span className="text-body-sm text-text-secondary w-20">Due Date</span>
              <input
                type="date"
                className="flex-1 h-8 px-2 text-sm bg-bg-secondary border border-border-primary rounded-md cursor-pointer text-text-primary"
                value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                onChange={e => dispatch(updateTask({ id: taskId, changes: { dueDate: e.target.value ? new Date(e.target.value).toISOString() : null } }))}
                disabled={!canEdit}
              />
            </div>

            {/* Labels */}
            <div className="flex items-start gap-3">
              <span className="text-body-sm text-text-secondary w-20 pt-1">Labels</span>
              <div className="flex-1 flex flex-wrap gap-1">
                {task.labelIds.map(lId => {
                  const label = labels.find(l => l.id === lId);
                  if (!label) return null;
                  return (
                    <Badge key={lId} size="sm" color={label.color}>
                      {label.name}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => dispatch(removeTaskLabel({ taskId, labelId: lId }))}
                          className="ml-1 hover:opacity-70 cursor-pointer"
                        >×</button>
                      )}
                    </Badge>
                  );
                })}
                {canEdit && (
                  <select
                    className="h-6 text-xs bg-bg-secondary border border-border-primary rounded px-1.5 text-text-secondary cursor-pointer"
                    onChange={e => {
                      if (e.target.value) {
                        dispatch(addTaskLabel({ taskId, labelId: e.target.value }));
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">+ Add Label</option>
                    {labels.filter(l => !task.labelIds.includes(l.id)).map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-body-sm font-semibold text-text-primary mb-2">Description</h3>
            {editingDesc ? (
              <div>
                <Textarea value={descValue} onChange={e => setDescValue(e.target.value)} rows={4} />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={handleSaveDesc}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setDescValue(task.description); setEditingDesc(false); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <p
                className={cn('text-body-sm text-text-secondary whitespace-pre-wrap', canEdit && 'cursor-pointer hover:bg-bg-hover rounded p-2 -m-2')}
                onClick={() => canEdit && setEditingDesc(true)}
              >
                {task.description || 'Add a description...'}
              </p>
            )}
          </div>

          {/* Subtasks (Checklist) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-body-sm font-semibold text-text-primary">
                Subtasks {subtasks.length > 0 && <span className="text-text-tertiary font-normal">({completedSubtasks}/{subtasks.length})</span>}
              </h3>
            </div>
            {subtasks.length > 0 && (
              <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-success rounded-full transition-all"
                  style={{ width: `${(completedSubtasks / subtasks.length) * 100}%` }}
                />
              </div>
            )}
            <div className="space-y-1.5">
              {subtasks.map(sub => (
                <div key={sub.id} className="flex items-center gap-2 group p-1.5 rounded-lg hover:bg-bg-hover transition-colors">
                  <Checkbox
                    checked={sub.completed}
                    onChange={() => dispatch(toggleSubtask({ taskId, subtaskId: sub.id }))}
                    disabled={!canEdit}
                  />
                  <span className={cn('text-body-sm flex-1', sub.completed && 'line-through text-text-tertiary')}>
                    {sub.title}
                  </span>
                  {canEdit && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleConvertSubtaskToTask(sub)}
                        title="Convert to full task"
                        className="text-xs text-text-tertiary hover:text-accent-primary p-1 cursor-pointer"
                      >
                        To Task ↗
                      </button>
                      <IconButton
                        size="sm"
                        variant="danger"
                        onClick={() => dispatch(deleteSubtask({ taskId, subtaskId: sub.id }))}
                        tooltip="Delete"
                      >
                        <X size={12} />
                      </IconButton>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {canEdit && (
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add subtask..."
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                  className="flex-1"
                />
                <Button size="sm" variant="secondary" onClick={handleAddSubtask}>Add</Button>
              </div>
            )}
          </div>

          {/* Attachments */}
          <div>
            <h3 className="text-body-sm font-semibold text-text-primary mb-2">Attachments</h3>
            <div className="space-y-2">
              {attachments.map(att => (
                <div key={att.id} className="flex items-center gap-3 p-2 bg-bg-tertiary rounded-lg group">
                  <div className="h-8 w-8 rounded bg-bg-hover flex items-center justify-center text-text-secondary">
                    <Paperclip size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm text-text-primary truncate">{att.filename}</p>
                    <p className="text-caption text-text-tertiary">{formatFileSize(att.size)}</p>
                  </div>
                  {canEdit && (
                    <IconButton
                      size="sm"
                      variant="danger"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => dispatch(removeAttachment({ taskId, attachmentId: att.id }))}
                    >
                      <X size={12} />
                    </IconButton>
                  )}
                </div>
              ))}
            </div>
            {canEdit && (
              <label className="mt-2 inline-flex items-center gap-2 text-body-sm text-text-link cursor-pointer hover:underline">
                <Plus size={14} /> Attach file
                <input type="file" className="hidden" onChange={handleFileAttach} />
              </label>
            )}
          </div>

          {/* Bottom Tabs: Comments vs Activity Feed */}
          <div className="pt-2 border-t border-border-primary">
            <div className="flex items-center gap-4 border-b border-border-primary mb-3">
              <button
                type="button"
                onClick={() => setActiveBottomTab('comments')}
                className={cn(
                  'pb-2 text-body-sm font-medium border-b-2 transition-colors cursor-pointer',
                  activeBottomTab === 'comments' ? 'border-accent-primary text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary',
                )}
              >
                Comments ({comments.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveBottomTab('activity')}
                className={cn(
                  'pb-2 text-body-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5',
                  activeBottomTab === 'activity' ? 'border-accent-primary text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary',
                )}
              >
                <ActivityIcon size={14} /> Activity Feed ({taskActivities.length})
              </button>
            </div>

            {/* Comments Tab */}
            {activeBottomTab === 'comments' && (
              <div className="space-y-3">
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {comments.map(comment => {
                    const author = users[comment.authorId];
                    const isOwn = comment.authorId === currentUserId;
                    const isEditingThis = editingCommentId === comment.id;

                    return (
                      <div key={comment.id} className="flex gap-3 group">
                        <Avatar name={author?.name || 'Unknown'} size="sm" className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-body-sm font-medium text-text-primary">{author?.name}</span>
                            <span className="text-caption text-text-tertiary">{formatRelativeTime(comment.createdAt)}</span>
                            {isOwn && !isEditingThis && (
                              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-auto">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditCommentContent(comment.content);
                                  }}
                                  className="text-text-tertiary hover:text-accent-primary p-0.5 cursor-pointer"
                                  title="Edit comment"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => dispatch(deleteComment(comment.id))}
                                  className="text-text-tertiary hover:text-error p-0.5 cursor-pointer"
                                  title="Delete comment"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                          </div>

                          {isEditingThis ? (
                            <div className="mt-1.5 space-y-2">
                              <Textarea
                                value={editCommentContent}
                                onChange={e => setEditCommentContent(e.target.value)}
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleSaveEditComment(comment.id)}>Save</Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-body-sm text-text-secondary mt-0.5 whitespace-pre-wrap">{comment.content}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {comments.length === 0 && (
                    <p className="text-caption text-text-tertiary py-3 text-center">No comments yet</p>
                  )}
                </div>

                {/* Comment Input with @Mention Autocomplete */}
                {role && canCreateComment(role).allowed && (
                  <div className="relative mt-3">
                    {/* Mention Autocomplete Box */}
                    {mentionQuery !== null && filteredMentionUsers.length > 0 && (
                      <div className="absolute bottom-full mb-1 left-0 w-56 bg-bg-secondary border border-border-primary rounded-lg shadow-lg z-20 overflow-hidden">
                        <div className="p-1.5 text-overline text-text-tertiary border-b border-border-primary">Mention a user</div>
                        <div className="max-h-36 overflow-y-auto">
                          {filteredMentionUsers.map(u => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => handleSelectMention(u.name)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-bg-hover text-left text-xs cursor-pointer"
                            >
                              <Avatar name={u.name} size="xs" />
                              <span className="text-text-primary truncate">{u.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Avatar name={users[currentUserId || '']?.name || 'You'} size="sm" className="mt-0.5" />
                      <div className="flex-1">
                        <Textarea
                          ref={commentTextareaRef}
                          placeholder="Write a comment... (Type @ to mention team members)"
                          value={newComment}
                          onChange={handleCommentChange}
                          rows={2}
                        />
                        <div className="flex justify-end mt-2">
                          <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()} icon={<Send size={13} />}>
                            Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Task Activity Feed Tab */}
            {activeBottomTab === 'activity' && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {taskActivities.length === 0 ? (
                  <p className="text-caption text-text-tertiary py-3 text-center">No activity logged for this task yet</p>
                ) : (
                  taskActivities.map(ev => {
                    const actingUser = users[ev.userId];
                    return (
                      <div key={ev.id} className="flex items-start gap-2.5 py-1.5 text-xs text-text-secondary border-b border-border-secondary last:border-0">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent-primary mt-1.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="font-medium text-text-primary">{actingUser?.name || 'Someone'}</span>
                          {' '}{ev.action.replace('_', ' ')} this task
                          <div className="text-[10px] text-text-tertiary mt-0.5">{formatRelativeTime(ev.timestamp)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </Drawer>

      {/* Convert Task to Subtask Dialog */}
      <Modal open={convertToSubtaskOpen} onClose={() => setConvertToSubtaskOpen(false)} title="Convert to Subtask" size="sm">
        <div className="space-y-4 mt-4">
          <p className="text-body-sm text-text-secondary">
            Select a parent task in this project to convert &quot;{task.title}&quot; into its subtask:
          </p>
          <select
            value={parentTaskId}
            onChange={e => setParentTaskId(e.target.value)}
            className="w-full h-9 px-3 bg-bg-secondary border border-border-primary rounded-lg text-sm text-text-primary"
          >
            <option value="">Select a parent task...</option>
            {otherProjectTasks.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          <div className="flex justify-end gap-2 pt-2 border-t border-border-primary">
            <Button variant="secondary" onClick={() => setConvertToSubtaskOpen(false)}>Cancel</Button>
            <Button onClick={handleConvertTaskToSubtask} disabled={!parentTaskId}>Convert</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={() => { handleDelete(); setDeleteConfirm(false); }}
        title="Delete task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
