'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCurrentProjectId } from '@/store/selectors';
import { toggleCommandPalette, setCreateTaskOpen } from '@/store/slices/uiSlice';
import { undo, redo } from '@/store/slices/taskSlice';
import { setProjectView } from '@/store/slices/settingsSlice';

export function useKeyboardShortcuts() {
  const dispatch = useAppDispatch();
  const currentProjectId = useAppSelector(selectCurrentProjectId);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Cmd/Ctrl + K - Command Palette (always active)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        dispatch(toggleCommandPalette());
        return;
      }

      // Cmd/Ctrl + Z - Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        if (!isTyping) {
          e.preventDefault();
          dispatch(undo());
          return;
        }
      }

      // Cmd/Ctrl + Y or Cmd/Ctrl + Shift + Z - Redo
      if (((e.metaKey || e.ctrlKey) && e.key === 'y') || ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey)) {
        if (!isTyping) {
          e.preventDefault();
          dispatch(redo());
          return;
        }
      }

      // Don't fire navigation/creation shortcuts while typing in inputs
      if (isTyping) return;

      // C - Create task
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        dispatch(setCreateTaskOpen(true));
        return;
      }

      // 1, 2, 3 - View Switcher (when in a project)
      if (currentProjectId && !e.metaKey && !e.ctrlKey) {
        if (e.key === '1') {
          dispatch(setProjectView({ projectId: currentProjectId, view: 'kanban' }));
        } else if (e.key === '2') {
          dispatch(setProjectView({ projectId: currentProjectId, view: 'list' }));
        } else if (e.key === '3') {
          dispatch(setProjectView({ projectId: currentProjectId, view: 'calendar' }));
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [dispatch, currentProjectId]);
}
