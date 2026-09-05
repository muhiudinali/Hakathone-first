'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCurrentUserId, selectAllTasks, selectCurrentWorkspaceId } from '@/store/selectors';
import { addActivity } from '@/store/slices/activitySlice';
import { addNotification } from '@/store/slices/notificationSlice';
import { generateId } from '@/lib/utils';

const ACTIONS = ['status_changed', 'commented', 'assigned'] as const;
const MESSAGES = [
  'updated the status of',
  'commented on',
  'was assigned to',
];

export function useSimulatedRealtime() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector(selectCurrentUserId);
  const tasks = useAppSelector(selectAllTasks);
  const wsId = useAppSelector(selectCurrentWorkspaceId);

  useEffect(() => {
    if (!currentUserId || !wsId) return;

    const interval = setInterval(() => {
      const taskArr = Object.values(tasks);
      if (taskArr.length === 0) return;

      // 20% chance every 45 seconds to generate a simulated event
      if (Math.random() > 0.2) return;

      const task = taskArr[Math.floor(Math.random() * taskArr.length)];
      const actionIdx = Math.floor(Math.random() * ACTIONS.length);

      // Only create events from other users
      const otherUserIds = ['user-alex', 'user-sarah', 'user-daniel', 'user-emily'].filter(id => id !== currentUserId);
      const actingUser = otherUserIds[Math.floor(Math.random() * otherUserIds.length)];

      dispatch(addActivity({
        id: generateId(),
        workspaceId: wsId,
        projectId: task.projectId,
        taskId: task.id,
        userId: actingUser,
        action: ACTIONS[actionIdx],
        target: task.title,
        timestamp: new Date().toISOString(),
      }));

      // Occasionally create a notification for current user
      if (Math.random() < 0.3) {
        dispatch(addNotification({
          id: generateId(),
          userId: currentUserId,
          type: 'comment',
          title: 'Activity Update',
          message: `Someone ${MESSAGES[actionIdx]} "${task.title}"`,
          read: false,
          createdAt: new Date().toISOString(),
        }));
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [currentUserId, wsId, dispatch, tasks]);
}
