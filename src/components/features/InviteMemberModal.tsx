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

import { User, UserPlus, Mail, Shield, Users, Plus, X } from 'lucide-react';

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
        <div className="flex rounded-xl border border-border-primary p-1 bg-bg-secondary/70 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={`flex-1 py-1.5 text-body-sm font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'existing' ? 'bg-bg-primary text-text-primary shadow-xs font-semibold' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <User size={14} />
            Select Demo User
          </button>
          <button
            type="button"
            onClick={() => setMode('new')}
            className={`flex-1 py-1.5 text-body-sm font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'new' ? 'bg-bg-primary text-text-primary shadow-xs font-semibold' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <UserPlus size={14} />
            Add New Member
          </button>
        </div>

        {mode === 'existing' ? (
          <div>
            <label className="text-body-sm font-medium text-text-primary flex items-center gap-1.5 mb-2">
              <Users size={14} className="text-accent-primary" /> Select User
            </label>
            {availableMockUsers.length === 0 ? (
              <p className="text-body-sm text-text-tertiary p-3 border border-border-primary rounded-xl">
                All pre-configured demo users are already in this workspace. Switch to &quot;Add New Member&quot; to invite someone else.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto border border-border-primary rounded-xl p-2 bg-bg-secondary/70 backdrop-blur-sm">
                {availableMockUsers.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUserId(u.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors text-left ${
                      selectedUserId === u.id ? 'bg-accent-primary/10 border border-accent-primary/30' : 'hover:bg-bg-hover'
                    }`}
                  >
                    <Avatar name={u.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-semibold text-text-primary truncate">{u.name}</p>
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
              icon={<User size={14} />}
              placeholder="e.g. Jane Doe"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
            />
            <Input
              label="Email Address"
              icon={<Mail size={14} />}
              type="email"
              placeholder="jane@company.com"
              value={customEmail}
              onChange={e => setCustomEmail(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="text-body-sm font-medium text-text-primary flex items-center gap-1.5 mb-1.5">
            <Shield size={14} className="text-accent-primary" /> Member Role
          </label>
          <select
            value={role}
            onChange={e => setRole(e.target.value as Role)}
            className="w-full h-9 px-3 bg-bg-secondary/70 backdrop-blur-md border border-border-primary rounded-xl text-sm text-text-primary shadow-xs cursor-pointer"
          >
            <option value="admin">Admin (Can manage settings & members)</option>
            <option value="member">Member (Can create & edit tasks/projects)</option>
            <option value="viewer">Viewer (Read-only access)</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border-primary/80">
          <Button variant="secondary" icon={<X size={15} />} onClick={close}>Cancel</Button>
          <Button variant="primary" icon={<UserPlus size={15} />} onClick={handleInvite}>Invite Member</Button>
        </div>
      </div>
    </Modal>
  );
}
