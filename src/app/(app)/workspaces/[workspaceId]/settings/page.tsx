'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectCurrentWorkspace, selectCurrentWorkspaceMembers, selectAllUsers,
  selectCurrentUserWorkspaceRole, selectCurrentUserId, selectAllWorkspaces,
} from '@/store/selectors';
import {
  updateWorkspace, deleteWorkspace, changeMemberRole, removeMember, setCurrentWorkspace,
} from '@/store/slices/workspaceSlice';
import { setInviteMemberOpen } from '@/store/slices/uiSlice';
import { Button, Input, Select, Avatar, ConfirmDialog, Tabs, useToast } from '@/components/ui';
import { canManageWorkspace, canDeleteWorkspace, canManageMembers } from '@/lib/permissions';
import { PROJECT_COLORS, PROJECT_ICONS } from '@/lib/utils';
import { Role, ViewType } from '@/types';
import { Trash2, UserPlus, AlertTriangle, Save } from 'lucide-react';

export default function WorkspaceSettingsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const workspace = useAppSelector(selectCurrentWorkspace);
  const members = useAppSelector(selectCurrentWorkspaceMembers);
  const users = useAppSelector(selectAllUsers);
  const userRole = useAppSelector(selectCurrentUserWorkspaceRole);
  const currentUserId = useAppSelector(selectCurrentUserId);
  const allWorkspaces = useAppSelector(selectAllWorkspaces);
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('general');
  const [name, setName] = useState(workspace?.name || '');
  const [icon, setIcon] = useState(workspace?.icon || '🏢');
  const [color, setColor] = useState(workspace?.color || '#3B82F6');
  const [defaultView, setDefaultView] = useState<ViewType>(workspace?.defaultView || 'kanban');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);

  if (!workspace) {
    return (
      <div className="p-8 text-center text-text-secondary">
        Workspace not found.
      </div>
    );
  }

  const canManage = userRole ? canManageWorkspace(userRole).allowed : false;
  const canDelete = userRole ? canDeleteWorkspace(userRole).allowed : false;
  const canEditMembers = userRole ? canManageMembers(userRole).allowed : false;

  const handleSaveGeneral = () => {
    if (!name.trim()) return;
    dispatch(updateWorkspace({
      id: workspace.id,
      changes: {
        name: name.trim(),
        icon,
        color,
        defaultView,
      },
    }));
    addToast({ type: 'success', message: 'Workspace settings saved' });
  };

  const handleDeleteWorkspace = () => {
    dispatch(deleteWorkspace(workspace.id));
    addToast({ type: 'info', message: `Workspace "${workspace.name}" deleted` });
    setDeleteConfirm(false);
    const remaining = Object.values(allWorkspaces).filter(w => w.id !== workspace.id);
    if (remaining.length > 0) {
      dispatch(setCurrentWorkspace(remaining[0].id));
    }
    router.push('/dashboard');
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'members', label: `Members (${members.length})` },
    { id: 'danger', label: 'Danger Zone' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading-lg text-text-primary">Workspace Settings</h1>
          <p className="text-body-sm text-text-secondary">Manage workspace configuration, members, and roles</p>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6 space-y-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6 bg-bg-secondary border border-border-primary rounded-xl p-6">
            <Input
              label="Workspace Name"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={!canManage}
            />

            <div>
              <label className="text-body-sm font-medium text-text-primary block mb-1.5">Workspace Icon</label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_ICONS.slice(0, 12).map(ic => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => canManage && setIcon(ic)}
                    disabled={!canManage}
                    className={`h-9 w-9 text-lg rounded-lg border flex items-center justify-center transition-transform cursor-pointer ${
                      icon === ic ? 'border-accent-primary bg-bg-hover scale-110 shadow-xs' : 'border-border-primary hover:bg-bg-hover'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-body-sm font-medium text-text-primary block mb-1.5">Brand Color</label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => canManage && setColor(c)}
                    disabled={!canManage}
                    style={{ backgroundColor: c }}
                    className={`h-7 w-7 rounded-full transition-transform cursor-pointer ${
                      color === c ? 'ring-2 ring-offset-2 ring-accent-primary scale-110' : 'hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>

            <Select
              label="Default Project View"
              value={defaultView}
              onChange={e => setDefaultView(e.target.value as ViewType)}
              disabled={!canManage}
              options={[
                { value: 'kanban', label: 'Kanban Board' },
                { value: 'list', label: 'List View' },
                { value: 'calendar', label: 'Calendar View' },
              ]}
            />

            {canManage && (
              <div className="pt-2">
                <Button onClick={handleSaveGeneral} icon={<Save size={15} />}>
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-heading-sm text-text-primary">Workspace Members</h3>
                <p className="text-body-sm text-text-secondary">People who have access to this workspace</p>
              </div>
              {canEditMembers && (
                <Button
                  size="sm"
                  icon={<UserPlus size={14} />}
                  onClick={() => dispatch(setInviteMemberOpen(true))}
                >
                  Invite Member
                </Button>
              )}
            </div>

            <div className="divide-y divide-border-secondary">
              {members.map(member => {
                const user = users[member.userId];
                if (!user) return null;
                const isOwner = member.role === 'owner';
                const isSelf = member.userId === currentUserId;

                return (
                  <div key={member.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={user.name} size="md" />
                      <div className="min-w-0">
                        <p className="text-body-sm font-medium text-text-primary truncate">
                          {user.name} {isSelf && <span className="text-caption text-accent-primary font-normal">(You)</span>}
                        </p>
                        <p className="text-caption text-text-tertiary truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {canEditMembers && !isOwner && !isSelf ? (
                        <select
                          className="h-8 px-2 text-xs bg-bg-tertiary border border-border-primary rounded-md cursor-pointer text-text-primary"
                          value={member.role}
                          onChange={e => {
                            dispatch(changeMemberRole({
                              workspaceId: workspace.id,
                              memberId: member.id,
                              role: e.target.value as Role,
                            }));
                            addToast({ type: 'success', message: `Updated ${user.name}'s role to ${e.target.value}` });
                          }}
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : (
                        <span className="text-caption px-2.5 py-1 rounded-md bg-bg-tertiary text-text-secondary capitalize font-medium">
                          {member.role}
                        </span>
                      )}

                      {canEditMembers && !isOwner && !isSelf && (
                        <button
                          type="button"
                          onClick={() => setMemberToRemove({ id: member.id, name: user.name })}
                          className="text-caption text-error hover:underline cursor-pointer p-1"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === 'danger' && (
          <div className="bg-error/5 border border-error/20 rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={22} className="text-error flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-heading-sm text-text-primary">Delete Workspace</h3>
                <p className="text-body-sm text-text-secondary mt-1">
                  Permanently remove &quot;{workspace.name}&quot; and all of its associated projects, tasks, and activity logs.
                  This action cannot be undone.
                </p>
                <div className="mt-4">
                  {canDelete ? (
                    <Button variant="danger" icon={<Trash2 size={15} />} onClick={() => setDeleteConfirm(true)}>
                      Delete Workspace
                    </Button>
                  ) : (
                    <p className="text-caption text-error font-medium">
                      Only the workspace owner can delete this workspace.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDeleteWorkspace}
        title={`Delete "${workspace.name}"?`}
        message="All projects, tasks, comments, and members in this workspace will be permanently deleted."
        confirmLabel="Delete Workspace"
        variant="danger"
      />

      <ConfirmDialog
        open={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={() => {
          if (memberToRemove) {
            dispatch(removeMember({ workspaceId: workspace.id, memberId: memberToRemove.id }));
            addToast({ type: 'info', message: `${memberToRemove.name} removed from workspace` });
            setMemberToRemove(null);
          }
        }}
        title="Remove Member"
        message={`Are you sure you want to remove ${memberToRemove?.name} from this workspace?`}
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  );
}
