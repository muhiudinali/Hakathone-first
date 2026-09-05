'use client';

import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectRecentActivity, selectAllUsers } from '@/store/selectors';
import { Avatar, EmptyState } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';
import { Activity as ActivityIcon, Filter, User } from 'lucide-react';

const ACTION_VERBS: Record<string, string> = {
  created: 'created',
  edited: 'edited',
  status_changed: 'changed the status of',
  assigned: 'assigned',
  commented: 'commented on',
  completed: 'completed',
  deleted: 'deleted',
  moved: 'moved',
  priority_changed: 'changed priority of',
  comment_edited: 'edited a comment on',
  comment_deleted: 'deleted a comment on',
};

export default function ActivityPage() {
  const activity = useAppSelector(selectRecentActivity);
  const users = useAppSelector(selectAllUsers);

  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');

  const filteredActivity = activity.filter(event => {
    if (selectedUser !== 'all' && event.userId !== selectedUser) return false;
    if (selectedAction !== 'all' && event.action !== selectedAction) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-heading-lg text-text-primary">Activity Log</h1>
          <p className="text-body-sm text-text-secondary">Track all events and updates across your workspace</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* User Filter */}
          <div className="flex items-center gap-1.5 bg-bg-secondary border border-border-primary rounded-lg px-2 py-1 text-xs">
            <User size={13} className="text-text-tertiary" />
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="bg-transparent text-text-primary text-xs cursor-pointer focus:outline-none"
            >
              <option value="all">All Users</option>
              {Object.values(users).map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Action Type Filter */}
          <div className="flex items-center gap-1.5 bg-bg-secondary border border-border-primary rounded-lg px-2 py-1 text-xs">
            <Filter size={13} className="text-text-tertiary" />
            <select
              value={selectedAction}
              onChange={e => setSelectedAction(e.target.value)}
              className="bg-transparent text-text-primary text-xs cursor-pointer focus:outline-none"
            >
              <option value="all">All Actions</option>
              <option value="created">Created</option>
              <option value="edited">Edited</option>
              <option value="status_changed">Status Changed</option>
              <option value="assigned">Assigned</option>
              <option value="commented">Commented</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
        </div>
      </div>

      {filteredActivity.length === 0 ? (
        <EmptyState
          icon={<ActivityIcon size={48} className="text-text-tertiary" />}
          title="No activity found"
          description={activity.length > 0 ? "No activity matches the selected filters." : "Actions in your workspace will be logged here."}
        />
      ) : (
        <div className="relative bg-bg-secondary border border-border-primary rounded-xl p-6">
          <div className="absolute left-10 top-8 bottom-8 w-px bg-border-primary" />
          <div className="space-y-4">
            {filteredActivity.map(event => {
              const user = users[event.userId];
              return (
                <div key={event.id} className="relative flex items-start gap-4 pl-8 py-1">
                  <div className="absolute left-[18px] top-3.5 h-3 w-3 rounded-full bg-bg-secondary border-2 border-accent-primary" />
                  <Avatar name={user?.name || 'Unknown'} size="sm" className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm text-text-primary">
                      <span className="font-semibold text-text-primary">{user?.name || 'Unknown'}</span>
                      {' '}<span className="text-text-secondary">{ACTION_VERBS[event.action] || event.action}</span>
                      {' '}<span className="font-semibold text-text-primary">&quot;{event.target}&quot;</span>
                    </p>
                    <p className="text-caption text-text-tertiary mt-0.5">{formatRelativeTime(event.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
