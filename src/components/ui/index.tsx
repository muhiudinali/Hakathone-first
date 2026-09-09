'use client';

import React, { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { X, Check, Trash2, AlertTriangle, AlertCircle, CheckCircle2, Info } from 'lucide-react';

// ============================================================
// BUTTON
// ============================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus active:scale-[0.98] select-none whitespace-nowrap flex-shrink-0';
  const variants = {
    primary: 'bg-[#1A73E8] hover:bg-[#1557B0] active:bg-[#174EA6] text-white shadow-sm hover:shadow-md border border-transparent font-medium',
    secondary: 'bg-[#F1F3F4] hover:bg-[#E8EAED] dark:bg-[#303134] dark:hover:bg-[#3C4043] text-[#202124] dark:text-[#E8EAED] border border-[#DADCE0] dark:border-[#3C4043] font-medium shadow-xs',
    ghost: 'text-text-secondary hover:bg-bg-hover hover:text-text-primary active:bg-bg-active font-medium',
    danger: 'bg-[#FCE8E6] dark:bg-[#5C1D1D]/30 text-[#EA4335] dark:text-[#F28B82] hover:bg-[#FAD2CF] border border-[#FAD2CF] dark:border-[#5C1D1D]/50 font-medium',
    outline: 'border border-[#DADCE0] dark:border-[#3C4043] bg-transparent text-[#1A73E8] dark:text-[#8AB4F8] hover:bg-[#E8F0FE] dark:hover:bg-[#303134] font-medium shadow-xs',
    glass: 'bg-white/90 dark:bg-[#2D2E30]/90 backdrop-blur-md border border-[#DADCE0] dark:border-[#3C4043] hover:bg-white dark:hover:bg-[#35363A] text-text-primary font-medium shadow-xs',
  };
  const sizes = {
    sm: 'h-8 px-3 text-[13px] rounded-lg',
    md: 'h-9 px-4 text-sm rounded-xl',
    lg: 'h-10 px-5 text-[15px] rounded-2xl',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {!loading && icon}
      {children}
    </button>
  );
}

// ============================================================
// ICON BUTTON
// ============================================================

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'outline' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

export function IconButton({ variant = 'ghost', size = 'md', tooltip, className, children, ...props }: IconButtonProps) {
  const sizes = { sm: 'h-8 w-8 rounded-full', md: 'h-9 w-9 rounded-full', lg: 'h-10 w-10 rounded-full' };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
        variant === 'ghost' && 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
        variant === 'outline' && 'border border-border-primary bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-hover shadow-xs',
        variant === 'danger' && 'text-text-secondary hover:bg-[#FCE8E6] hover:text-[#EA4335]',
        variant === 'glass' && 'bg-white/80 dark:bg-[#2D2E30]/80 backdrop-blur-md border border-border-primary text-text-primary hover:bg-white dark:hover:bg-[#35363A] shadow-xs',
        sizes[size],
        className,
      )}
      title={tooltip}
      aria-label={tooltip}
      {...props}
    >
      {children}
    </button>
  );
}

// ============================================================
// INPUT
// ============================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-body-sm font-medium text-text-primary">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">{icon}</div>}
          <input
            ref={ref}
            className={cn(
              'w-full h-9 px-3 text-sm bg-bg-secondary/70 backdrop-blur-md border rounded-xl transition-all duration-150',
              'text-text-primary placeholder:text-text-tertiary shadow-xs',
              'focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-border-focus/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-error' : 'border-border-primary/80 hover:border-border-focus/40',
              icon && 'pl-9',
              className,
            )}
            {...props}
          />
        </div>
        {error && <span className="text-caption text-error">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ============================================================
// TEXTAREA
// ============================================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-body-sm font-medium text-text-primary">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-3 py-2 text-sm bg-bg-secondary/70 backdrop-blur-md border rounded-xl transition-all duration-150 resize-none shadow-xs',
            'text-text-primary placeholder:text-text-tertiary',
            'focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-border-focus/20',
            error ? 'border-error' : 'border-border-primary/80 hover:border-border-focus/40',
            className,
          )}
          rows={3}
          {...props}
        />
        {error && <span className="text-caption text-error">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// ============================================================
// SELECT
// ============================================================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-body-sm font-medium text-text-primary">{label}</label>}
      <select
        className={cn(
          'w-full h-9 px-3 text-sm bg-bg-secondary/70 backdrop-blur-md border rounded-xl transition-all duration-150 appearance-none shadow-xs',
          'text-text-primary',
          'focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-border-focus/20',
          error ? 'border-error' : 'border-border-primary/80 hover:border-border-focus/40',
          className,
        )}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} className="bg-bg-secondary text-text-primary">{o.label}</option>
        ))}
      </select>
      {error && <span className="text-caption text-error">{error}</span>}
    </div>
  );
}

// ============================================================
// CHECKBOX
// ============================================================

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  return (
    <label className={cn('inline-flex items-center gap-2 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed')}>
      <div
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={(e) => e.key === ' ' && !disabled && onChange(!checked)}
        className={cn(
          'h-4 w-4 rounded-md border-2 transition-all duration-150 flex items-center justify-center',
          checked ? 'bg-accent-primary border-accent-primary shadow-xs shadow-indigo-500/30' : 'border-border-primary hover:border-text-tertiary bg-bg-secondary/60 backdrop-blur-sm',
        )}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      {label && <span className="text-body-sm text-text-primary">{label}</span>}
    </label>
  );
}

// ============================================================
// SWITCH
// ============================================================

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <label className={cn('inline-flex items-center gap-3 cursor-pointer select-none', disabled && 'opacity-50 cursor-not-allowed')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative h-5 w-9 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none',
          checked ? 'bg-accent-primary' : 'bg-border-primary',
        )}
      >
        <span className={cn(
          'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200 shadow-sm',
          checked && 'translate-x-4',
        )} />
      </button>
      {label && <span className="text-body-sm font-medium text-text-primary">{label}</span>}
    </label>
  );
}

// ============================================================
// BADGE
// ============================================================

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  color?: string;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Badge({ children, variant = 'default', color, size = 'sm', dot }: BadgeProps) {
  const variants = {
    default: 'bg-[#F1F3F4] text-[#3C4043] dark:bg-[#303134] dark:text-[#E8EAED] border border-[#DADCE0] dark:border-[#3C4043]',
    success: 'bg-[#E6F4EA] text-[#137333] dark:bg-[#137333]/25 dark:text-[#81C995] border border-[#CEEAD6] dark:border-transparent',
    warning: 'bg-[#FEF7E0] text-[#B06000] dark:bg-[#B06000]/25 dark:text-[#FDD663] border border-[#FEEFC3] dark:border-transparent',
    error: 'bg-[#FCE8E6] text-[#C5221F] dark:bg-[#C5221F]/25 dark:text-[#F28B82] border border-[#FAD2CF] dark:border-transparent',
    info: 'bg-[#E8F0FE] text-[#1A73E8] dark:bg-[#1A73E8]/25 dark:text-[#8AB4F8] border border-[#D2E3FC] dark:border-transparent',
    outline: 'border border-[#DADCE0] dark:border-[#3C4043] text-text-secondary bg-transparent',
  };
  const sizes = {
    sm: 'h-5 px-2.5 text-[11px]',
    md: 'h-6 px-3 text-[12px]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap shadow-2xs',
        variants[variant],
        sizes[size],
      )}
      style={color ? { backgroundColor: `${color}18`, color, borderColor: `${color}35` } : undefined}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color || 'currentColor' }} />}
      {children}
    </span>
  );
}

// ============================================================
// AVATAR
// ============================================================

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const AVATAR_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const sizes = { xs: 'h-6 w-6 text-[10px]', sm: 'h-7 w-7 text-[11px]', md: 'h-8 w-8 text-xs', lg: 'h-10 w-10 text-sm' };
  const color = getAvatarColor(name);

  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover shadow-xs ring-1 ring-white/20', sizes[size], className)} />;
  }

  return (
    <div
      className={cn('rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 shadow-xs ring-1 ring-white/20', sizes[size], className)}
      style={{ backgroundColor: color }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

// ============================================================
// AVATAR GROUP
// ============================================================

interface AvatarGroupProps {
  users: { name: string; src?: string }[];
  max?: number;
  size?: 'xs' | 'sm' | 'md';
}

export function AvatarGroup({ users, max = 3, size = 'sm' }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className="flex -space-x-1.5">
      {visible.map((u, i) => (
        <div key={i} className="ring-2 ring-bg-secondary rounded-full">
          <Avatar name={u.name} src={u.src} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div className={cn(
          'rounded-full flex items-center justify-center bg-bg-tertiary text-text-secondary font-medium ring-2 ring-bg-secondary',
          size === 'xs' ? 'h-6 w-6 text-[9px]' : size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-8 w-8 text-[11px]',
        )}>
          +{overflow}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MODAL
// ============================================================

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ open, onClose, title, description, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-overlay/60 backdrop-blur-md animate-fade-in"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className={cn('w-full bg-white dark:bg-[#292A2D] rounded-3xl shadow-2xl animate-scale-in border border-[#DADCE0] dark:border-[#3C4043] overflow-hidden', sizes[size])}>
        <div className="google-bar" />
        {(title || description) && (
          <div className="px-6 pt-6 pb-2 flex items-start justify-between gap-3">
            <div>
              {title && <h2 className="text-heading-md text-text-primary">{title}</h2>}
              {description && <p className="text-body-sm text-text-secondary mt-1">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-text-tertiary hover:text-text-primary p-1.5 rounded-lg hover:bg-bg-hover transition-colors cursor-pointer -mt-1 -mr-2"
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// DRAWER
// ============================================================

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: 'left' | 'right';
  width?: string;
}

export function Drawer({ open, onClose, title, children, side = 'right', width = 'w-80' }: DrawerProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-bg-overlay/50 backdrop-blur-sm" />
      <div
        className={cn(
          'relative bg-white dark:bg-[#292A2D] h-full shadow-2xl flex flex-col max-w-full border-l border-border-primary',
          width,
          side === 'right' ? 'ml-auto animate-slide-in-right' : 'mr-auto',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-5 h-14 flex items-center border-b border-border-primary bg-bg-secondary">
            <h3 className="text-heading-sm text-text-primary flex-1">{title}</h3>
            <IconButton onClick={onClose} tooltip="Close" size="sm">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </IconButton>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// DROPDOWN
// ============================================================

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
}

export function Dropdown({ trigger, children, align = 'left' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            'absolute z-50 mt-1.5 min-w-[210px] py-2 bg-white dark:bg-[#292A2D] rounded-2xl shadow-xl border border-border-primary ring-1 ring-black/5 animate-slide-in-up',
            align === 'right' ? 'right-0' : 'left-0',
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function DropdownItem({ children, icon, danger, disabled, onClick }: DropdownItemProps) {
  return (
    <button
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors duration-100 cursor-pointer text-left',
        danger ? 'text-error hover:bg-error/10' : 'text-text-primary hover:bg-bg-hover',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 border-t border-border-primary" />;
}

// ============================================================
// TABS
// ============================================================

interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex border-b border-border-primary overflow-x-auto scrollbar-none">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-150 -mb-px cursor-pointer whitespace-nowrap flex-shrink-0',
            activeTab === tab.id
              ? 'border-accent-primary text-accent-primary font-medium'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-primary',
          )}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================================
// TOAST SYSTEM
// ============================================================

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  action?: { label: string; onClick: () => void };
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl animate-toast-in text-sm font-medium border',
              toast.type === 'success' && 'bg-emerald-600/90 border-emerald-400/40 text-white shadow-emerald-500/20',
              toast.type === 'error' && 'bg-rose-600/90 border-rose-400/40 text-white shadow-rose-500/20',
              toast.type === 'warning' && 'bg-amber-600/90 border-amber-400/40 text-white shadow-amber-500/20',
              toast.type === 'info' && 'glass-panel text-text-primary border-border-primary/80 shadow-indigo-500/10',
            )}
          >
            {toast.type === 'success' && <CheckCircle2 size={16} className="text-white flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle size={16} className="text-white flex-shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle size={16} className="text-white flex-shrink-0" />}
            {toast.type === 'info' && <Info size={16} className="text-accent-primary flex-shrink-0" />}
            <span className="flex-1">{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => { toast.action!.onClick(); removeToast(toast.id); }}
                className="font-semibold underline underline-offset-2 hover:opacity-80 cursor-pointer"
              >
                {toast.action.label}
              </button>
            )}
            <button onClick={() => removeToast(toast.id)} className="opacity-70 hover:opacity-100 cursor-pointer p-0.5 rounded hover:bg-black/10">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ============================================================
// SKELETON
// ============================================================

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return <div className={cn('skeleton', className)} style={{ width, height }} />;
}

// ============================================================
// EMPTY STATE
// ============================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="text-text-tertiary mb-4">{icon}</div>}
      <h3 className="text-heading-sm text-text-primary mb-1">{title}</h3>
      {description && <p className="text-body-sm text-text-secondary max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

// ============================================================
// CONFIRMATION DIALOG
// ============================================================

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  loading?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'default', loading }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="pt-4">
        <h3 className="text-heading-md text-text-primary mb-2">{title}</h3>
        <p className="text-body-sm text-text-secondary mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" icon={<X size={14} />} onClick={onClose}>Cancel</Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            icon={variant === 'danger' ? <Trash2 size={14} /> : <Check size={14} />}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// POPOVER
// ============================================================

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Popover({ trigger, children, align = 'left', open: controlledOpen, onOpenChange }: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setIsOpen]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 bg-bg-secondary/98 dark:bg-bg-elevated/98 backdrop-blur-2xl border border-border-primary ring-1 ring-black/5 rounded-xl shadow-2xl animate-slide-in-up p-3',
            align === 'right' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0',
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TOOLTIP (simple title-based for now)
// ============================================================

export function Tooltip({ children, content }: { children: React.ReactElement; content: string }) {
  return React.cloneElement(children, { title: content } as React.HTMLAttributes<HTMLElement>);
}

export * from './DynamicIcon';
