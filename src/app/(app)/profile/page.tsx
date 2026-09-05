'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCurrentUser } from '@/store/selectors';
import { updateProfile, switchUser } from '@/store/slices/authSlice';
import { Button, Input, Avatar, useToast } from '@/components/ui';
import { DEMO_USERS } from '@/lib/mock-data/users';
import { Save } from 'lucide-react';

const AVATAR_OPTIONS = ['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '🚀', '🎨', '⚡', '🦉', '🦊', '🐱'];

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

      <div className="bg-bg-secondary border border-border-primary rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-primary">
          {currentUser.avatar ? (
            <div className="h-14 w-14 rounded-full bg-accent-primary/20 border border-border-primary flex items-center justify-center text-2xl">
              {currentUser.avatar}
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
            <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />

            <div>
              <label className="text-body-sm font-medium text-text-primary block mb-1.5">Avatar Emoji</label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`h-9 w-9 text-lg rounded-lg border flex items-center justify-center cursor-pointer transition-transform ${
                      avatar === emoji ? 'border-accent-primary bg-bg-hover scale-110 shadow-xs' : 'border-border-primary hover:bg-bg-hover'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} icon={<Save size={15} />}>Save Changes</Button>
              <Button variant="secondary" onClick={() => { setName(currentUser.name); setEmail(currentUser.email); setAvatar(currentUser.avatar || ''); setEditing(false); }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-body-sm text-text-secondary">Full Name</label>
              <p className="text-body-md text-text-primary">{currentUser.name}</p>
            </div>
            <div>
              <label className="text-body-sm text-text-secondary">Email</label>
              <p className="text-body-md text-text-primary">{currentUser.email}</p>
            </div>
            {currentUser.avatar && (
              <div>
                <label className="text-body-sm text-text-secondary">Avatar</label>
                <p className="text-xl">{currentUser.avatar}</p>
              </div>
            )}
            <Button variant="secondary" onClick={() => setEditing(true)}>Edit Profile</Button>
          </div>
        )}
      </div>

      {/* Switch User Section */}
      <div className="mt-6 bg-bg-secondary border border-border-primary rounded-xl p-6">
        <h3 className="text-heading-sm text-text-primary mb-1">Switch User</h3>
        <p className="text-body-sm text-text-secondary mb-4">Switch between demo users to test different permission levels.</p>
        <div className="grid grid-cols-2 gap-3">
          {DEMO_USERS.filter(u => u.id !== currentUser.id).map(user => (
            <button
              key={user.id}
              onClick={() => dispatch(switchUser(user.id))}
              className="flex items-center gap-3 p-3 rounded-lg border border-border-primary hover:bg-bg-hover transition-colors cursor-pointer text-left"
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
