import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeMode, ViewType, AppSettings } from '@/types';

const initialState: AppSettings = {
  theme: 'light',
  defaultView: 'kanban',
  sidebarCollapsed: false,
  projectViews: {},
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    loadSettings(state, action: PayloadAction<Partial<AppSettings>>) {
      Object.assign(state, action.payload);
    },
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
    },
    setDefaultView(state, action: PayloadAction<ViewType>) {
      state.defaultView = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    setProjectView(state, action: PayloadAction<{ projectId: string; view: ViewType }>) {
      state.projectViews[action.payload.projectId] = action.payload.view;
    },
  },
});

export const {
  loadSettings, setTheme, setDefaultView, toggleSidebar, setSidebarCollapsed, setProjectView,
} = settingsSlice.actions;
export default settingsSlice.reducer;
