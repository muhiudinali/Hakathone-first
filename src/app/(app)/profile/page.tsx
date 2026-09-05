'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCurrentUser } from '@/store/selectors';
import { updateProfile, switchUser } from '@/store/slices/authSlice';
import { Button, Input, Avatar, DynamicIcon, useToast } from '@/components/ui';
import { DEMO_USERS } from '@/lib/mock-data/users';
import { Save, User, Mail, Edit3, X, Users } from 'lucide-react';

const AVATAR_OPTIONS = ['user', 'briefcase', 'code', 'rocket', 'shield', 'sparkles', 'target', 'zap', 'palette', 'globe'];

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const { addToast } = useToast();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [editing, setEditing] = useState(false);

  if (!currentUser) return null;

  const handleSave = () => {
    dispatch(updateProfile({
      userId: currentUser.id,
      name: name.trim(),
      email: email.trim(),
      avatar: avatar.trim(),
    }));
    setEditing(false);
    addToast({ type: 'success', message: 'Profile updated' });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-heading-lg text-text-primary mb-6">Profile</h1>

      <div className="glass-card border border-white/70 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-primary">
          {currentUser.avatar ? (
            <div className="h-14 w-14 rounded-full bg-accent-primary/15 border border-accent-primary/30 flex items-center justify-center text-accent-primary shadow-xs">
              <DynamicIcon icon={currentUser.avatar} size={26} />
            </div>
          ) : (
            <Avatar name={currentUser.name} size="lg" />
          )}
          <div>
            <h2 className="text-heading-sm text-text-primary">{currentUser.name}</h2>
            <p className="text-body-sm text-text-secondary">{currentUser.email}</p>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <Input label="Full Name" icon={<User size={15} />} value={name} onChange={e => setName(e.target.value)} />
            <Input label="Email" type="email" icon={<Mail size={15} />} value={email} onChange={e => setEmail(e.target.value)} />

            <div>
              <label className="text-body-sm font-medium text-text-primary block mb-1.5">Avatar Icon</label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map(iconKey => (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setAvatar(iconKey)}
                    className={`h-9 w-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                      avatar === iconKey ? 'border-accent-primary bg-accent-primary/15 text-accent-primary scale-110 shadow-xs ring-2 ring-accent-primary/20' : 'border-border-primary hover:bg-bg-hover text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <DynamicIcon icon={iconKey} size={18} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} icon={<Save size={15} />}>Save Changes</Button>
              <Button variant="secondary" icon={<X size={15} />} onClick={() => { setName(currentUser.name); setEmail(currentUser.email); setAvatar(currentUser.avatar || ''); setEditing(false); }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-body-sm text-text-secondary flex items-center gap-1.5 mb-0.5">
                <User size={13} className="text-accent-primary" /> Full Name
              </label>
              <p className="text-body-md text-text-primary font-medium">{currentUser.name}</p>
            </div>
            <div>
              <label className="text-body-sm text-text-secondary flex items-center gap-1.5 mb-0.5">
                <Mail size={13} className="text-accent-primary" /> Email
              </label>
              <p className="text-body-md text-text-primary font-medium">{currentUser.email}</p>
            </div>
            {currentUser.avatar && (
              <div>
                <label className="text-body-sm text-text-secondary mb-0.5 block">Avatar</label>
                <div className="h-9 w-9 rounded-xl bg-accent-primary/15 border border-accent-primary/30 flex items-center justify-center text-accent-primary shadow-xs">
                  <DynamicIcon icon={currentUser.avatar} size={18} />
                </div>
              </div>
            )}
            <div className="pt-2">
              <Button variant="secondary" icon={<Edit3 size={15} />} onClick={() => setEditing(true)}>Edit Profile</Button>
            </div>
          </div>
        )}
      </div>

      {/* Switch User Section */}
      <div className="mt-6 glass-card border border-white/70 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <h3 className="text-heading-sm text-text-primary mb-1 flex items-center gap-2">
          <Users size={16} className="text-accent-primary" />
          <span>Switch User</span>
        </h3>
        <p className="text-body-sm text-text-secondary mb-4">Switch between demo users to test different permission levels.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DEMO_USERS.filter(u => u.id !== currentUser.id).map(user => (
            <button
              key={user.id}
              onClick={() => dispatch(switchUser(user.id))}
              className="flex items-center gap-3 p-3 rounded-xl border border-border-primary/80 hover:border-accent-primary/50 hover:bg-bg-hover transition-colors cursor-pointer text-left backdrop-blur-sm"
            >
              <Avatar name={user.name} size="sm" />
              <div>
                <p className="text-body-sm font-medium text-text-primary">{user.name}</p>
                <p className="text-caption text-text-tertiary">
                  {user.id === 'user-alex' ? 'Owner' : user.id === 'user-sarah' ? 'Admin' : user.id === 'user-daniel' ? 'Member' : 'Viewer'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
