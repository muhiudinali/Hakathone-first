export function validateTaskTitle(title: string): string | null {
  if (!title.trim()) return 'Task title is required';
  if (title.length > 200) return 'Task title must be under 200 characters';
  return null;
}

export function validateWorkspaceName(name: string): string | null {
  if (!name.trim()) return 'Workspace name is required';
  if (name.length > 50) return 'Workspace name must be under 50 characters';
  return null;
}

export function validateProjectName(name: string): string | null {
  if (!name.trim()) return 'Project name is required';
  if (name.length > 100) return 'Project name must be under 100 characters';
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required';
  if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email format';
  return null;
}

export function validateImportData(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    errors.push('Invalid data format');
    return { valid: false, errors };
  }
  const d = data as Record<string, unknown>;
  if (!d.version) errors.push('Missing version field');
  if (!d.data) errors.push('Missing data field');
  return { valid: errors.length === 0, errors };
}
