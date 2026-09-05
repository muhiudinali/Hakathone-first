'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, signup, setUsers } from '@/store/slices/authSlice';
import { selectAllUsers } from '@/store/selectors';
import { DEMO_USERS, DEFAULT_PASSWORD } from '@/lib/mock-data/users';
import { Button, Input, Avatar } from '@/components/ui';
import { generateId } from '@/lib/utils';
import Link from 'next/link';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 600));

    const user = Object.values(users).find(
      u => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!user) {
      setError('No account found with this email address.');
      setLoading(false);
      return;
    }
    if (password !== DEFAULT_PASSWORD && password.length < 4) {
      setError('Invalid password. Try "demo1234".');
      setLoading(false);
      return;
    }

    dispatch(login(user.id));
    router.push('/dashboard');
  };

  const handleDemoLogin = (userId: string) => {
    dispatch(login(userId));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 17L12 22L22 17"/>
                <path d="M2 12L12 17L22 12"/>
                <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Workspace</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Manage projects with clarity and speed.
          </h1>
          <p className="text-lg text-white/70 leading-relaxed">
            A modern workspace for teams who value focus. Organize tasks, track progress, and ship faster.
          </p>
          <div className="mt-12 flex gap-6">
            {[
              { n: '2.5k+', l: 'Teams' },
              { n: '150k+', l: 'Tasks completed' },
              { n: '99.9%', l: 'Uptime' },
            ].map(s => (
              <div key={s.l}>
                <div className="text-2xl font-bold text-white">{s.n}</div>
                <div className="text-sm text-white/50">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="h-9 w-9 rounded-xl bg-accent-primary flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 17L12 22L22 17"/>
                <path d="M2 12L12 17L22 12"/>
                <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-text-primary tracking-tight">Workspace</span>
          </div>

          <h2 className="text-heading-lg text-text-primary mb-1">Welcome back</h2>
          <p className="text-body-md text-text-secondary mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              icon={<Mail size={16} />}
              placeholder="alex@workspace.io"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={error && !email ? 'Email is required' : undefined}
            />
            <Input
              label="Password"
              type="password"
              icon={<Lock size={16} />}
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {error && <p className="text-caption text-error">{error}</p>}
            <Button type="submit" className="w-full" size="lg" loading={loading} icon={<LogIn size={16} />}>
              Sign in
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-primary" /></div>
              <div className="relative flex justify-center">
                <span className="bg-bg-primary px-3 text-caption text-text-tertiary flex items-center gap-1.5">
                  <Sparkles size={12} className="text-accent-primary" />
                  Quick demo login
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleDemoLogin(user.id)}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border-primary hover:bg-bg-hover transition-colors duration-150 cursor-pointer text-left"
                >
                  <Avatar name={user.name} size="sm" />
                  <div className="min-w-0">
                    <div className="text-body-sm font-medium text-text-primary truncate">{user.name}</div>
                    <div className="text-caption text-text-tertiary">
                      {user.id === 'user-alex' ? 'Owner' : user.id === 'user-sarah' ? 'Admin' : user.id === 'user-daniel' ? 'Member' : 'Viewer'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-body-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-text-link font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
