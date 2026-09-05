import { format, formatDistanceToNow, isAfter, isBefore, isToday, isTomorrow, isYesterday, parseISO, startOfDay, endOfDay, addDays, subDays, isSameDay } from 'date-fns';

// ============================================================
// ID GENERATION
// ============================================================

let counter = 0;
export function generateId(): string {
  counter++;
  return `${Date.now().toString(36)}-${counter.toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

// ============================================================
// DATE UTILITIES
// ============================================================

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return '';
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy h:mm a');
  } catch {
    return '';
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return '';
  }
}

export function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  } catch {
    return '';
  }
}

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  try {
    return isBefore(parseISO(dateStr), startOfDay(new Date()));
  } catch {
    return false;
  }
}

export function isDueSoon(dateStr: string | null, days: number = 3): boolean {
  if (!dateStr) return false;
  try {
    const date = parseISO(dateStr);
    const now = new Date();
    return isAfter(date, now) && isBefore(date, addDays(now, days));
  } catch {
    return false;
  }
}

export { isToday, isSameDay, parseISO, startOfDay, endOfDay, addDays, subDays, format, isBefore, isAfter };

// ============================================================
// TEXT UTILITIES
// ============================================================

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 3) + '...';
}

export function highlightMatch(text: string, query: string): { text: string; highlight: boolean }[] {
  if (!query) return [{ text, highlight: false }];
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  const parts = text.split(regex);
  return parts.map(part => ({
    text: part,
    highlight: part.toLowerCase() === query.toLowerCase(),
  }));
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ============================================================
// SEARCH
// ============================================================

export function fuzzyMatch(text: string, query: string): boolean {
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  return normalizedText.includes(normalizedQuery);
}

// ============================================================
// FILE UTILITIES
// ============================================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function getFileIcon(filename: string): string {
  const ext = getFileExtension(filename);
  const iconMap: Record<string, string> = {
    pdf: 'FileText',
    doc: 'FileText',
    docx: 'FileText',
    txt: 'FileText',
    md: 'FileText',
    png: 'Image',
    jpg: 'Image',
    jpeg: 'Image',
    gif: 'Image',
    svg: 'Image',
    webp: 'Image',
    mp4: 'Video',
    mov: 'Video',
    mp3: 'Music',
    wav: 'Music',
    zip: 'Archive',
    rar: 'Archive',
    json: 'FileCode',
    js: 'FileCode',
    ts: 'FileCode',
    html: 'FileCode',
    css: 'FileCode',
    xls: 'Sheet',
    xlsx: 'Sheet',
    csv: 'Sheet',
  };
  return iconMap[ext] || 'File';
}

export function isImageFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'].includes(ext);
}

// ============================================================
// COLOR UTILITIES
// ============================================================

export const PROJECT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
  '#D946EF', '#0EA5E9',
];

export const PROJECT_ICONS = [
  'folder', 'building', 'briefcase', 'code', 'rocket', 'layers',
  'palette', 'target', 'barchart', 'globe', 'shield', 'zap',
  'cpu', 'smartphone', 'notes', 'home',
];

export const LABEL_COLORS = [
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Green', value: '#10B981' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Cyan', value: '#06B6D4' },
];

// ============================================================
// ARRAY UTILITIES
// ============================================================

export function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return arr.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

// ============================================================
// DEBOUNCE
// ============================================================

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// ============================================================
// CLASSNAME MERGE UTILITY
// ============================================================

export function cn(...classes: unknown[]): string {
  return classes.filter(Boolean).join(' ');
}
