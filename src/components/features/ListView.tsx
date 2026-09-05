'use client';

import { useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectAllUsers, selectCurrentWorkspaceLabels } from '@/store/selectors';
import { toggleTaskSelection, selectTask, deselectTask } from '@/store/slices/taskSlice';
import { setTaskDetailId } from '@/store/slices/uiSlice';
import { Task, STATUS_CONFIG, PRIORITY_CONFIG, TaskStatus, Priority } from '@/types';
import { Avatar, Badge, Checkbox, Select } from '@/components/ui';
import { cn, formatShortDate, isOverdue } from '@/lib/utils';
import {
  ArrowUpDown, ArrowUp, ArrowDown, Layers, ChevronDown, ChevronRight,
  CheckSquare, Activity, Flag, User, Tag, Calendar, ListTree, Clock,
} from 'lucide-react';

interface ListViewProps {
  tasks: Task[];
}

type GroupByOption = 'none' | 'status' | 'priority' | 'assignee' | 'label';
type SortField = 'title' | 'status' | 'priority' | 'dueDate' | 'assignee';

export default function ListView({ tasks }: ListViewProps) {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const labels = useAppSelector(selectCurrentWorkspaceLabels);
  const selectedIds = useAppSelector(s => s.tasks.selectedTaskIds);
  const subtasks = useAppSelector(s => s.tasks.subtasks);

  const [groupBy, setGroupBy] = useState<GroupByOption>('none');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortField(null);
        setSortOrder('asc');
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  // Sort tasks
  const sortedTasks = useMemo(() => {
    if (!sortField) return tasks;
    return [...tasks].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortField === 'priority') {
        const pOrder: Record<Priority, number> = { low: 1, medium: 2, high: 3, urgent: 4 };
        comparison = (pOrder[a.priority] || 0) - (pOrder[b.priority] || 0);
      } else if (sortField === 'dueDate') {
        const d1 = a.dueDate || '9999';
        const d2 = b.dueDate || '9999';
        comparison = d1.localeCompare(d2);
      } else if (sortField === 'assignee') {
        const u1 = a.assigneeId ? users[a.assigneeId]?.name || '' : '';
        const u2 = b.assigneeId ? users[b.assigneeId]?.name || '' : '';
        comparison = u1.localeCompare(u2);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [tasks, sortField, sortOrder, users]);

  // Group tasks
  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') {
      return [{ key: 'all', title: 'All Tasks', items: sortedTasks }];
    }

    const groups: Record<string, { key: string; title: string; items: Task[]; color?: string }> = {};

    if (groupBy === 'status') {
      (Object.keys(STATUS_CONFIG) as TaskStatus[]).forEach(s => {
        groups[s] = { key: s, title: STATUS_CONFIG[s].label, items: [], color: STATUS_CONFIG[s].color };
      });
      sortedTasks.forEach(t => {
        if (!groups[t.status]) groups[t.status] = { key: t.status, title: t.status, items: [] };
        groups[t.status].items.push(t);
      });
    } else if (groupBy === 'priority') {
      (Object.keys(PRIORITY_CONFIG) as Priority[]).forEach(p => {
        groups[p] = { key: p, title: PRIORITY_CONFIG[p].label, items: [], color: PRIORITY_CONFIG[p].color };
      });
      sortedTasks.forEach(t => {
        if (!groups[t.priority]) groups[t.priority] = { key: t.priority, title: t.priority, items: [] };
        groups[t.priority].items.push(t);
      });
    } else if (groupBy === 'assignee') {
      groups['unassigned'] = { key: 'unassigned', title: 'Unassigned', items: [] };
      Object.values(users).forEach(u => {
        groups[u.id] = { key: u.id, title: u.name, items: [] };
      });
      sortedTasks.forEach(t => {
        const k = t.assigneeId || 'unassigned';
        if (!groups[k]) groups[k] = { key: k, title: 'Unknown', items: [] };
        groups[k].items.push(t);
      });
    } else if (groupBy === 'label') {
      groups['no-label'] = { key: 'no-label', title: 'No Label', items: [] };
      labels.forEach(l => {
        groups[l.id] = { key: l.id, title: l.name, items: [], color: l.color };
      });
      sortedTasks.forEach(t => {
        if (t.labelIds.length === 0) {
          groups['no-label'].items.push(t);
        } else {
          t.labelIds.forEach(lId => {
            if (groups[lId]) groups[lId].items.push(t);
          });
        }
      });
    }

    return Object.values(groups).filter(g => g.items.length > 0);
  }, [sortedTasks, groupBy, users, labels]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="opacity-40" />;
    return sortOrder === 'asc' ? <ArrowUp size={12} className="text-accent-primary" /> : <ArrowDown size={12} className="text-accent-primary" />;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Group By Toolbar */}
      <div className="flex items-center justify-between px-6 py-2.5 glass-header border-b border-border-primary/80 text-xs flex-shrink-0">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-accent-primary" />
          <span className="text-text-secondary font-medium">Group by:</span>
          <select
            value={groupBy}
            onChange={e => setGroupBy(e.target.value as GroupByOption)}
            className="h-7 px-2.5 bg-bg-secondary/70 backdrop-blur-sm border border-border-primary/80 rounded-lg text-xs cursor-pointer text-text-primary shadow-2xs"
          >
            <option value="none">None</option>
            <option value="status">Status</option>
            <option value="priority">Priority</option>
            <option value="assignee">Assignee</option>
            <option value="label">Label</option>
          </select>
        </div>

        <span className="text-caption text-text-tertiary font-medium bg-bg-tertiary/70 px-2.5 py-0.5 rounded-full border border-border-primary/50">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 glass-header backdrop-blur-xl border-b border-border-primary/80 z-10 shadow-xs">
            <tr className="border-b border-border-primary">
              <th className="w-10 px-3 py-2.5">
                <Checkbox
                  checked={selectedIds.length === tasks.length && tasks.length > 0}
                  onChange={(checked) => {
                    if (checked) {
                      tasks.forEach(t => dispatch(selectTask(t.id)));
                    } else {
                      tasks.forEach(t => dispatch(deselectTask(t.id)));
                    }
                  }}
                />
              </th>
              <th className="text-left px-3 py-2.5">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-1.5 text-overline text-text-tertiary font-bold hover:text-text-primary cursor-pointer"
                >
                  <CheckSquare size={12} className="text-accent-primary" /> Task {renderSortIcon('title')}
                </button>
              </th>
              <th className="text-left px-3 py-2.5 w-28">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1.5 text-overline text-text-tertiary font-bold hover:text-text-primary cursor-pointer"
                >
                  <Activity size={12} className="text-accent-primary" /> Status {renderSortIcon('status')}
                </button>
              </th>
              <th className="text-left px-3 py-2.5 w-28">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center gap-1.5 text-overline text-text-tertiary font-bold hover:text-text-primary cursor-pointer"
                >
                  <Flag size={12} className="text-accent-primary" /> Priority {renderSortIcon('priority')}
                </button>
              </th>
              <th className="text-left px-3 py-2.5 w-36 hidden md:table-cell">
                <button
                  onClick={() => handleSort('assignee')}
                  className="flex items-center gap-1.5 text-overline text-text-tertiary font-bold hover:text-text-primary cursor-pointer"
                >
                  <User size={12} className="text-accent-primary" /> Assignee {renderSortIcon('assignee')}
                </button>
              </th>
              <th className="text-left px-3 py-2.5 text-overline text-text-tertiary font-bold w-36 hidden lg:table-cell">
                <span className="flex items-center gap-1.5">
                  <Tag size={12} className="text-accent-primary" /> Labels
                </span>
              </th>
              <th className="text-left px-3 py-2.5 w-28 hidden sm:table-cell">
                <button
                  onClick={() => handleSort('dueDate')}
                  className="flex items-center gap-1.5 text-overline text-text-tertiary font-bold hover:text-text-primary cursor-pointer"
                >
                  <Calendar size={12} className="text-accent-primary" /> Due Date {renderSortIcon('dueDate')}
                </button>
              </th>
              <th className="text-left px-3 py-2.5 text-overline text-text-tertiary font-bold w-24 hidden lg:table-cell">
                <span className="flex items-center gap-1.5">
                  <ListTree size={12} className="text-accent-primary" /> Subtasks
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-secondary">
            {groupedTasks.map(group => {
              const isCollapsed = collapsedGroups[group.key];
              return (
                <tbody key={group.key} className="divide-y divide-border-secondary">
                  {groupBy !== 'none' && (
                    <tr className="bg-bg-tertiary/60 border-y border-border-primary">
                      <td colSpan={8} className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => toggleGroupCollapse(group.key)}
                          className="flex items-center gap-2 text-body-sm font-semibold text-text-primary hover:text-accent-primary cursor-pointer"
                        >
                          {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                          {group.color && (
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: group.color }} />
                          )}
                          <span>{group.title}</span>
                          <span className="text-caption text-text-tertiary font-normal">({group.items.length})</span>
                        </button>
                      </td>
                    </tr>
                  )}
                  {!isCollapsed && group.items.map(task => {
                    const assignee = task.assigneeId ? users[task.assigneeId] : null;
                    const taskLabels = labels.filter(l => task.labelIds.includes(l.id));
                    const taskSubs = subtasks[task.id] || [];
                    const completedSubs = taskSubs.filter(s => s.completed).length;
                    const isSelected = selectedIds.includes(task.id);

                    return (
                      <tr
                        key={task.id}
                        className={cn(
                          'hover:bg-white/50 dark:hover:bg-white/5 transition-colors cursor-pointer',
                          isSelected && 'bg-accent-primary/5',
                          task.status === 'done' && 'opacity-60',
                        )}
                      >
                        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => dispatch(toggleTaskSelection(task.id))}
                          />
                        </td>
                        <td
                          className="px-3 py-2.5"
                          onClick={() => dispatch(setTaskDetailId(task.id))}
                        >
                          <span className={cn(
                            'text-body-sm font-medium text-text-primary hover:text-accent-primary transition-colors',
                            task.status === 'done' && 'line-through text-text-secondary',
                          )}>
                            {task.title}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge size="sm" color={STATUS_CONFIG[task.status].color} dot>
                            {STATUS_CONFIG[task.status].label}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge size="sm" color={PRIORITY_CONFIG[task.priority].color}>
                            <Flag size={10} className="mr-0.5" />
                            {PRIORITY_CONFIG[task.priority].label}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 hidden md:table-cell">
                          {assignee ? (
                            <div className="flex items-center gap-2">
                              <Avatar name={assignee.name} size="xs" />
                              <span className="text-body-sm text-text-secondary truncate">{assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-caption text-text-tertiary flex items-center gap-1">
                              <User size={11} /> Unassigned
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {taskLabels.map(l => (
                              <Badge key={l.id} size="sm" color={l.color}>
                                <Tag size={9} className="mr-0.5" />
                                {l.name}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 hidden sm:table-cell">
                          {task.dueDate ? (
                            <span className={cn(
                              'text-caption inline-flex items-center gap-1',
                              isOverdue(task.dueDate) ? 'text-error font-medium' : 'text-text-secondary',
                            )}>
                              <Clock size={11} />
                              {formatShortDate(task.dueDate)}
                            </span>
                          ) : (
                            <span className="text-caption text-text-tertiary">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 hidden lg:table-cell">
                          {taskSubs.length > 0 ? (
                            <span className="text-caption text-text-secondary inline-flex items-center gap-1">
                              <CheckSquare size={11} className={completedSubs === taskSubs.length ? 'text-success' : 'text-text-tertiary'} />
                              {completedSubs}/{taskSubs.length}
                            </span>
                          ) : (
                            <span className="text-caption text-text-tertiary">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
