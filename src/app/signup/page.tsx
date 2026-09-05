'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { signup } from '@/store/slices/authSlice';
import { addMember } from '@/store/slices/workspaceSlice';
import { Button, Input } from '@/components/ui';
import { generateId } from '@/lib/utils';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email format';
    if (password.length < 4) errs.password = 'Password must be at least 4 characters';
    return errs;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const userId = generateId();
    dispatch(signup({
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatar: '',
      createdAt: new Date().toISOString(),
    }));

    // Add to first workspace as member
    dispatch(addMember({
      id: generateId(),
      workspaceId: 'ws-1',
      userId,
      role: 'member',
      joinedAt: new Date().toISOString(),
    }));

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="h-9 w-9 rounded-xl bg-accent-primary flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 17L12 22L22 17"/><path d="M2 12L12 17L22 12"/><path d="M12 2L2 7L12 12L22 7L12 2Z"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-text-primary tracking-tight">Workspace</span>
        </div>

        <h2 className="text-heading-lg text-text-primary mb-1">Create an account</h2>
        <p className="text-body-md text-text-secondary mb-8">Get started with your workspace</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <Input label="Full name" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} error={errors.name} />
          <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} />
          <Input label="Password" type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} />
          <Button type="submit" className="w-full" size="lg" loading={loading}>Create account</Button>
        </form>

        <p className="mt-6 text-center text-body-sm text-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="text-text-link font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
