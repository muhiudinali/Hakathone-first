'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectTheme } from '@/store/selectors';
import { setTheme } from '@/store/slices/settingsSlice';
import { ThemeMode } from '@/types';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (mode: 'light' | 'dark') => {
      root.classList.remove('light', 'dark');
      root.classList.add(mode);
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches ? 'dark' : 'light');
      
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  return <>{children}</>;
}
