// localStorage persistence layer with validation and error handling

const STORAGE_PREFIX = 'wm_';

export function saveToStorage<T>(key: string, data: T): boolean {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, serialized);
    return true;
  } catch (err) {
    console.error(`Failed to save to localStorage: ${key}`, err);
    return false;
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const serialized = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (serialized === null) return defaultValue;
    const parsed = JSON.parse(serialized);
    return parsed as T;
  } catch (err) {
    console.error(`Failed to load from localStorage: ${key}`, err);
    return defaultValue;
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (err) {
    console.error(`Failed to remove from localStorage: ${key}`, err);
  }
}

export function clearAllStorage(): void {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  } catch (err) {
    console.error('Failed to clear localStorage', err);
  }
}

export function getStorageSize(): number {
  let total = 0;
  try {
    for (const key in localStorage) {
      if (key.startsWith(STORAGE_PREFIX)) {
        total += localStorage.getItem(key)?.length || 0;
      }
    }
  } catch {
    // ignore
  }
  return total * 2; // UTF-16 encoding
}

// Debounced save to avoid excessive writes
const saveTimers: Record<string, ReturnType<typeof setTimeout>> = {};

export function debouncedSave<T>(key: string, data: T, delay: number = 500): void {
  if (saveTimers[key]) {
    clearTimeout(saveTimers[key]);
  }
  saveTimers[key] = setTimeout(() => {
    saveToStorage(key, data);
    delete saveTimers[key];
  }, delay);
}
