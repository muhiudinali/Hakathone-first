import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationPreferences } from '@/types';

interface NotificationState {
  entities: Record<string, Notification>;
  preferences: NotificationPreferences;
}

const initialState: NotificationState = {
  entities: {},
  preferences: {
    assignments: true,
    mentions: true,
    dueDates: true,
  },
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    loadNotifications(state, action: PayloadAction<Notification[]>) {
      action.payload.forEach(n => { state.entities[n.id] = n; });
    },
    addNotification(state, action: PayloadAction<Notification>) {
      state.entities[action.payload.id] = action.payload;
    },
    markAsRead(state, action: PayloadAction<string>) {
      const notif = state.entities[action.payload];
      if (notif) notif.read = true;
    },
    markAllAsRead(state, action: PayloadAction<string>) {
      Object.values(state.entities).forEach(n => {
        if (n.userId === action.payload) n.read = true;
      });
    },
    deleteNotification(state, action: PayloadAction<string>) {
      delete state.entities[action.payload];
    },
    setNotificationPreferences(state, action: PayloadAction<Partial<NotificationPreferences>>) {
      Object.assign(state.preferences, action.payload);
    },
    loadPreferences(state, action: PayloadAction<NotificationPreferences>) {
      state.preferences = action.payload;
    },
  },
});

export const {
  loadNotifications, addNotification, markAsRead, markAllAsRead,
  deleteNotification, setNotificationPreferences, loadPreferences,
} = notificationSlice.actions;
export default notificationSlice.reducer;
