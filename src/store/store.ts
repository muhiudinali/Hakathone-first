import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import workspaceReducer from './slices/workspaceSlice';
import projectReducer from './slices/projectSlice';
import taskReducer from './slices/taskSlice';
import commentReducer from './slices/commentSlice';
import activityReducer from './slices/activitySlice';
import notificationReducer from './slices/notificationSlice';
import filterReducer from './slices/filterSlice';
import settingsReducer from './slices/settingsSlice';
import uiReducer from './slices/uiSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      workspaces: workspaceReducer,
      projects: projectReducer,
      tasks: taskReducer,
      comments: commentReducer,
      activity: activityReducer,
      notifications: notificationReducer,
      filters: filterReducer,
      settings: settingsReducer,
      ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['ui/showConfirmDialog'],
          ignoredPaths: ['ui.confirmDialog.actionPayload'],
        },
      }),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
