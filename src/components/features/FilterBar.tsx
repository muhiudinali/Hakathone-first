'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectActiveFilters, selectActiveSort, selectAllUsers,
  selectCurrentWorkspaceLabels, selectSavedFilters,
} from '@/store/selectors';
import {
  setFilter, clearFilters, setSort, saveFilter, deleteSavedFilter, applySavedFilter,
} from '@/store/slices/filterSlice';
import { Badge, Button, IconButton, Avatar, Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui';
import { TaskStatus, Priority, STATUS_CONFIG, PRIORITY_CONFIG, SortState } from '@/types';
import { cn, generateId } from '@/lib/utils';
import {
  X, Save, ArrowUpDown, ArrowUp, ArrowDown, User, Tag, Calendar, Bookmark, Trash2, Check,
  Activity, Flag,
} from 'lucide-react';

export default function FilterBar() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectActiveFilters);
  const sort = useAppSelector(selectActiveSort);
  const users = useAppSelector(selectAllUsers);
  const labels = useAppSelector(selectCurrentWorkspaceLabels);
  const savedFilters = useAppSelector(selectSavedFilters);
  const wsId = useAppSelector(s => s.workspaces.currentWorkspaceId);

  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const hasActive = filters.assigneeIds.length > 0 || filters.labelIds.length > 0 ||
    filters.priorities.length > 0 || filters.statuses.length > 0 ||
    filters.dueDateFrom !== null || filters.dueDateTo !== null;

  const handleSaveFilter = () => {
    if (!saveName.trim() || !wsId) return;
    dispatch(saveFilter({
      id: generateId(),
      workspaceId: wsId,
      name: saveName.trim(),
      filters: { ...filters },
      createdAt: new Date().toISOString(),
    }));
    setSaveName('');
    setShowSaveInput(false);
  };

  const handleToggleAssignee = (userId: string) => {
    const current = filters.assigneeIds;
    dispatch(setFilter({
      assigneeIds: current.includes(userId) ? current.filter(id => id !== userId) : [...current, userId],
    }));
  };

  const handleToggleLabel = (labelId: string) => {
    const current = filters.labelIds;
    dispatch(setFilter({
      labelIds: current.includes(labelId) ? current.filter(id => id !== labelId) : [...current, labelId],
    }));
  };

  const handleSetDueFilter = (type: 'all' | 'overdue' | 'today' | 'week') => {
    const now = new Date();
    if (type === 'all') {
      dispatch(setFilter({ dueDateFrom: null, dueDateTo: null }));
    } else if (type === 'overdue') {
      dispatch(setFilter({ dueDateFrom: null, dueDateTo: now.toISOString() }));
    } else if (type === 'today') {
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      dispatch(setFilter({ dueDateFrom: now.toISOString(), dueDateTo: endOfDay.toISOString() }));
    } else if (type === 'week') {
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + 7);
      dispatch(setFilter({ dueDateFrom: now.toISOString(), dueDateTo: endOfWeek.toISOString() }));
    }
  };

  const sortOptions: { label: string; field: SortState['field'] }[] = [
    { label: 'Due Date', field: 'dueDate' },
    { label: 'Priority', field: 'priority' },
    { label: 'Alphabetical', field: 'title' },
    { label: 'Created Date', field: 'createdAt' },
  ];

  return (
    <div className="flex-shrink-0 border-b border-border-primary/80 glass-header px-6 py-2.5 space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Status Filter */}
        <div className="flex items-center gap-1">
          <span className="text-caption text-text-tertiary mr-1 font-medium flex items-center gap-1"><Activity size={12} className="text-accent-primary" /> Status:</span>
          {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map(status => {
            const active = filters.statuses.includes(status);
            return (
              <button
                key={status}
                type="button"
                onClick={() => {
                  const current = filters.statuses;
                  dispatch(setFilter({
                    statuses: active ? current.filter(s => s !== status) : [...current, status],
                  }));
                }}
                className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded-full cursor-pointer transition-colors border',
                  active ? 'text-white border-transparent' : 'text-text-secondary border-border-primary hover:bg-bg-hover',
                )}
                style={active ? { backgroundColor: STATUS_CONFIG[status].color } : {}}
              >
                {STATUS_CONFIG[status].label}
              </button>
            );
          })}
        </div>

        <div className="w-px h-5 bg-border-primary hidden sm:block" />

        {/* Priority Filter */}
        <div className="flex items-center gap-1">
          <span className="text-caption text-text-tertiary mr-1 font-medium flex items-center gap-1"><Flag size={12} className="text-amber-400" /> Priority:</span>
          {(Object.keys(PRIORITY_CONFIG) as Priority[]).map(priority => {
            const active = filters.priorities.includes(priority);
            return (
              <button
                key={priority}
                type="button"
                onClick={() => {
                  const current = filters.priorities;
                  dispatch(setFilter({
                    priorities: active ? current.filter(p => p !== priority) : [...current, priority],
                  }));
                }}
                className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded-full cursor-pointer transition-colors border',
                  active ? 'text-white border-transparent' : 'text-text-secondary border-border-primary hover:bg-bg-hover',
                )}
                style={active ? { backgroundColor: PRIORITY_CONFIG[priority].color } : {}}
              >
                {PRIORITY_CONFIG[priority].label}
              </button>
            );
          })}
        </div>

        <div className="w-px h-5 bg-border-primary hidden md:block" />

        {/* Assignee Filter Dropdown */}
        <Dropdown
          trigger={
            <button
              type="button"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border cursor-pointer transition-colors',
                filters.assigneeIds.length > 0
                  ? 'border-accent-primary text-accent-primary bg-bg-active font-medium'
                  : 'border-border-primary text-text-secondary hover:bg-bg-hover',
              )}
            >
              <User size={12} />
              <span>Assignee {filters.assigneeIds.length > 0 && `(${filters.assigneeIds.length})`}</span>
            </button>
          }
        >
          <div className="p-2 w-48 space-y-1">
            <span className="text-overline text-text-tertiary px-1">Filter by Assignee</span>
            {Object.values(users).map(u => {
              const checked = filters.assigneeIds.includes(u.id);
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleToggleAssignee(u.id)}
                  className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-bg-hover cursor-pointer text-left text-xs"
                >
                  <div className={cn('h-3.5 w-3.5 rounded border flex items-center justify-center', checked ? 'bg-accent-primary border-accent-primary text-white' : 'border-border-primary')}>
                    {checked && <Check size={10} />}
                  </div>
                  <Avatar name={u.name} size="xs" />
                  <span className="truncate flex-1 text-text-primary">{u.name}</span>
                </button>
              );
            })}
          </div>
        </Dropdown>

        {/* Label Filter Dropdown */}
        {labels.length > 0 && (
          <Dropdown
            trigger={
              <button
                type="button"
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border cursor-pointer transition-colors',
                  filters.labelIds.length > 0
                    ? 'border-accent-primary text-accent-primary bg-bg-active font-medium'
                    : 'border-border-primary text-text-secondary hover:bg-bg-hover',
                )}
              >
                <Tag size={12} />
                <span>Labels {filters.labelIds.length > 0 && `(${filters.labelIds.length})`}</span>
              </button>
            }
          >
            <div className="p-2 w-44 space-y-1">
              <span className="text-overline text-text-tertiary px-1">Filter by Label</span>
              {labels.map(l => {
                const checked = filters.labelIds.includes(l.id);
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => handleToggleLabel(l.id)}
                    className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-bg-hover cursor-pointer text-left text-xs"
                  >
                    <div className={cn('h-3.5 w-3.5 rounded border flex items-center justify-center', checked ? 'bg-accent-primary border-accent-primary text-white' : 'border-border-primary')}>
                      {checked && <Check size={10} />}
                    </div>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="truncate flex-1 text-text-primary">{l.name}</span>
                  </button>
                );
              })}
            </div>
          </Dropdown>
        )}

        {/* Due Date Filter */}
        <Dropdown
          trigger={
            <button
              type="button"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border cursor-pointer transition-colors',
                filters.dueDateFrom || filters.dueDateTo
                  ? 'border-accent-primary text-accent-primary bg-bg-active font-medium'
                  : 'border-border-primary text-text-secondary hover:bg-bg-hover',
              )}
            >
              <Calendar size={12} />
              <span>Due Date</span>
            </button>
          }
        >
          <div className="p-1 w-36">
            <DropdownItem onClick={() => handleSetDueFilter('all')}>All Dates</DropdownItem>
            <DropdownItem onClick={() => handleSetDueFilter('overdue')}>Overdue</DropdownItem>
            <DropdownItem onClick={() => handleSetDueFilter('today')}>Due Today</DropdownItem>
            <DropdownItem onClick={() => handleSetDueFilter('week')}>Due This Week</DropdownItem>
          </div>
        </Dropdown>

        {/* Sort Controls */}
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-caption text-text-tertiary font-medium flex items-center gap-1"><ArrowUpDown size={12} /> Sort:</span>
          <select
            value={sort.field}
            onChange={e => dispatch(setSort({ ...sort, field: e.target.value as SortState['field'] }))}
            className="h-7 px-2 bg-bg-tertiary border border-border-primary rounded text-xs cursor-pointer text-text-primary"
          >
            {sortOptions.map(opt => (
              <option key={opt.field} value={opt.field}>{opt.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => dispatch(setSort({ ...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' }))}
            className="h-7 w-7 flex items-center justify-center border border-border-primary rounded bg-bg-tertiary hover:bg-bg-hover cursor-pointer"
            title={sort.direction === 'asc' ? 'Ascending (click for descending)' : 'Descending (click for ascending)'}
          >
            {sort.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
          </button>
        </div>

        {/* Clear Filters */}
        {hasActive && (
          <Button size="sm" variant="ghost" onClick={() => dispatch(clearFilters())}>
            <X size={13} /> Clear
          </Button>
        )}
      </div>

      {/* Presets Row */}
      <div className="flex items-center gap-2 pt-1 border-t border-border-primary/50 text-xs">
        <span className="text-text-tertiary font-medium flex items-center gap-1">
          <Bookmark size={12} /> Presets:
        </span>

        {savedFilters.map(sf => (
          <div key={sf.id} className="inline-flex items-center rounded-md bg-bg-tertiary border border-border-primary pl-2 pr-1 py-0.5">
            <button
              type="button"
              onClick={() => dispatch(applySavedFilter(sf.id))}
              className="text-xs text-text-primary hover:text-accent-primary cursor-pointer font-medium"
            >
              {sf.name}
            </button>
            <button
              type="button"
              onClick={() => dispatch(deleteSavedFilter(sf.id))}
              className="ml-1 text-text-tertiary hover:text-error p-0.5 cursor-pointer"
            >
              <X size={11} />
            </button>
          </div>
        ))}

        {hasActive && !showSaveInput && (
          <button
            type="button"
            onClick={() => setShowSaveInput(true)}
            className="text-accent-primary hover:underline flex items-center gap-1 cursor-pointer ml-1"
          >
            <Save size={11} /> Save filter
          </button>
        )}

        {showSaveInput && (
          <div className="flex items-center gap-1 ml-1">
            <input
              type="text"
              placeholder="Filter name..."
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              className="h-6 px-2 text-xs bg-bg-tertiary border border-border-primary rounded w-28 text-text-primary"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSaveFilter()}
            />
            <button
              type="button"
              onClick={handleSaveFilter}
              className="h-6 px-2 text-[11px] bg-accent-primary text-white rounded cursor-pointer font-medium"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowSaveInput(false)}
              className="text-text-tertiary hover:text-text-primary p-1 cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
