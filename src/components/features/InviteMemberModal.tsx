'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectInviteMemberOpen, selectCurrentWorkspaceId, selectCurrentWorkspaceMembers,
  selectAllUsers, selectCurrentUserId,
} from '@/store/selectors';
import { addMember } from '@/store/slices/workspaceSlice';
import { setInviteMemberOpen } from '@/store/slices/uiSlice';
import { addActivity } from '@/store/slices/activitySlice';
import { Modal, Button, Input, Select, Avatar, useToast } from '@/components/ui';
import { generateId } from '@/lib/utils';
import { DEMO_USERS } from '@/lib/mock-data/users';
import { Role } from '@/types';

export default function InviteMemberModal() {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectInviteMemberOpen);
  const currentWorkspaceId = useAppSelector(selectCurrentWorkspaceId);
  const currentUserId = useAppSelector(selectCurrentUserId);
  const existingMembers = useAppSelector(selectCurrentWorkspaceMembers);
  const users = useAppSelector(selectAllUsers);
  const { addToast } = useToast();

  const [selectedUserId, setSelectedUserId] = useState('');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [mode, setMode] = useState<'existing' | 'new'>('existing');

  const existingMemberUserIds = existingMembers.map(m => m.userId);
  const availableMockUsers = DEMO_USERS.filter(u => !existingMemberUserIds.includes(u.id));

  const close = () => {
    dispatch(setInviteMemberOpen(false));
    setSelectedUserId('');
    setCustomName('');
    setCustomEmail('');
    setRole('member');
    setMode('existing');
  };

  const handleInvite = () => {
    if (!currentWorkspaceId || !currentUserId) return;

    let targetUserId = selectedUserId;
    let targetUserName = '';

    if (mode === 'existing') {
      if (!selectedUserId) {
        addToast({ type: 'error', message: 'Please select a user to invite' });
        return;
      }
      const u = DEMO_USERS.find(x => x.id === selectedUserId) || users[selectedUserId];
      targetUserName = u?.name || 'New Member';
    } else {
      if (!customName.trim() || !customEmail.trim()) {
        addToast({ type: 'error', message: 'Name and email are required' });
        return;
      }
      targetUserId = `user-${generateId()}`;
      targetUserName = customName.trim();
      // Register new mock user in auth slice if needed
      dispatch({
        type: 'auth/signup',
        payload: {
          id: targetUserId,
          name: targetUserName,
          email: customEmail.trim().toLowerCase(),
          avatar: '',
          createdAt: new Date().toISOString(),
        },
      });
    }

    dispatch(addMember({
      id: generateId(),
      workspaceId: currentWorkspaceId,
      userId: targetUserId,
      role,
      joinedAt: new Date().toISOString(),
    }));

    dispatch(addActivity({
      id: generateId(),
      workspaceId: currentWorkspaceId,
      projectId: '',
      userId: currentUserId,
      action: 'created',
      target: `invited ${targetUserName} as ${role}`,
      timestamp: new Date().toISOString(),
    }));

    addToast({ type: 'success', message: `${targetUserName} added to workspace` });
    close();
  };

  return (
    <Modal open={open} onClose={close} title="Invite Workspace Member" size="md">
      <div className="space-y-4 mt-4">
        {/* Toggle Mode */}
        <div className="flex rounded-lg border border-border-primary p-1 bg-bg-secondary">
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={`flex-1 py-1.5 text-body-sm font-medium rounded-md transition-colors cursor-pointer ${
              mode === 'existing' ? 'bg-bg-primary text-text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Select Demo User
          </button>
          <button
            type="button"
            onClick={() => setMode('new')}
            className={`flex-1 py-1.5 text-body-sm font-medium rounded-md transition-colors cursor-pointer ${
              mode === 'new' ? 'bg-bg-primary text-text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Add New Member
          </button>
        </div>

        {mode === 'existing' ? (
          <div>
            <label className="text-body-sm font-medium text-text-primary block mb-2">Select User</label>
            {availableMockUsers.length === 0 ? (
              <p className="text-body-sm text-text-tertiary p-3 border border-border-primary rounded-lg">
                All pre-configured demo users are already in this workspace. Switch to &quot;Add New Member&quot; to invite someone else.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto border border-border-primary rounded-lg p-2 bg-bg-secondary">
                {availableMockUsers.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUserId(u.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors text-left ${
                      selectedUserId === u.id ? 'bg-bg-active border border-accent-primary' : 'hover:bg-bg-hover'
                    }`}
                  >
                    <Avatar name={u.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-medium text-text-primary truncate">{u.name}</p>
                      <p className="text-caption text-text-tertiary truncate">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              label="Full Name"
              placeholder="e.g. Jane Doe"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="jane@company.com"
              value={customEmail}
              onChange={e => setCustomEmail(e.target.value)}
            />
          </div>
        )}

        <Select
          label="Role"
          value={role}
          onChange={e => setRole(e.target.value as Role)}
          options={[
            { value: 'admin', label: 'Admin (Can manage settings & members)' },
            { value: 'member', label: 'Member (Can create & edit tasks/projects)' },
            { value: 'viewer', label: 'Viewer (Read-only access)' },
          ]}
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-border-primary">
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button onClick={handleInvite}>Invite Member</Button>
        </div>
      </div>
    </Modal>
  );
}
