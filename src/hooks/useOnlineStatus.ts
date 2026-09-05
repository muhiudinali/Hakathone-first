'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setIsOnline } from '@/store/slices/uiSlice';

export function useOnlineStatus() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleOnline = () => dispatch(setIsOnline(true));
    const handleOffline = () => dispatch(setIsOnline(false));

    dispatch(setIsOnline(navigator.onLine));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);
}
