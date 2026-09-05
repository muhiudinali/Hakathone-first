// IndexedDB persistence for large data (attachments)
// Uses a simple wrapper pattern

const DB_NAME = 'workspace_manager';
const DB_VERSION = 1;
const ATTACHMENTS_STORE = 'attachments';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ATTACHMENTS_STORE)) {
        db.createObjectStore(ATTACHMENTS_STORE, { keyPath: 'id' });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAttachmentData(id: string, data: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(ATTACHMENTS_STORE, 'readwrite');
    const store = tx.objectStore(ATTACHMENTS_STORE);
    store.put({ id, data, savedAt: new Date().toISOString() });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save attachment to IndexedDB', err);
  }
}

export async function loadAttachmentData(id: string): Promise<string | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(ATTACHMENTS_STORE, 'readonly');
    const store = tx.objectStore(ATTACHMENTS_STORE);
    const request = store.get(id);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to load attachment from IndexedDB', err);
    return null;
  }
}

export async function deleteAttachmentData(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(ATTACHMENTS_STORE, 'readwrite');
    const store = tx.objectStore(ATTACHMENTS_STORE);
    store.delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to delete attachment from IndexedDB', err);
  }
}

export async function clearAllAttachments(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(ATTACHMENTS_STORE, 'readwrite');
    const store = tx.objectStore(ATTACHMENTS_STORE);
    store.clear();
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to clear IndexedDB', err);
  }
}
