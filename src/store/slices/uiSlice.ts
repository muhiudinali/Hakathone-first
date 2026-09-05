import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SyncStatus } from '@/types';

interface UIState {
  commandPaletteOpen: boolean;
  searchOpen: boolean;
  isOnline: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  sidebarMobileOpen: boolean;
  taskDetailId: string | null;
  createTaskOpen: boolean;
  createProjectOpen: boolean;
  createWorkspaceOpen: boolean;
  inviteMemberOpen: boolean;
  confirmDialog: {
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    variant: 'danger' | 'warning' | 'default';
    actionType: string;
    actionPayload?: unknown;
  } | null;
}

const initialState: UIState = {
  commandPaletteOpen: false,
  searchOpen: false,
  isOnline: true,
  syncStatus: 'synced',
  lastSyncedAt: new Date().toISOString(),
  sidebarMobileOpen: false,
  taskDetailId: null,
  createTaskOpen: false,
  createProjectOpen: false,
  createWorkspaceOpen: false,
  inviteMemberOpen: false,
  confirmDialog: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleCommandPalette(state) {
      state.commandPaletteOpen = !state.commandPaletteOpen;
    },
    setCommandPaletteOpen(state, action: PayloadAction<boolean>) {
      state.commandPaletteOpen = action.payload;
    },
    setSearchOpen(state, action: PayloadAction<boolean>) {
      state.searchOpen = action.payload;
    },
    setIsOnline(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
    setSyncStatus(state, action: PayloadAction<SyncStatus>) {
      state.syncStatus = action.payload;
    },
    setLastSynced(state) {
      state.lastSyncedAt = new Date().toISOString();
      state.syncStatus = 'synced';
    },
    toggleSidebarMobile(state) {
      state.sidebarMobileOpen = !state.sidebarMobileOpen;
    },
    setSidebarMobileOpen(state, action: PayloadAction<boolean>) {
      state.sidebarMobileOpen = action.payload;
    },
    setTaskDetailId(state, action: PayloadAction<string | null>) {
      state.taskDetailId = action.payload;
    },
    setCreateTaskOpen(state, action: PayloadAction<boolean>) {
      state.createTaskOpen = action.payload;
    },
    setCreateProjectOpen(state, action: PayloadAction<boolean>) {
      state.createProjectOpen = action.payload;
    },
    setCreateWorkspaceOpen(state, action: PayloadAction<boolean>) {
      state.createWorkspaceOpen = action.payload;
    },
    setInviteMemberOpen(state, action: PayloadAction<boolean>) {
      state.inviteMemberOpen = action.payload;
    },
    showConfirmDialog(state, action: PayloadAction<UIState['confirmDialog']>) {
      state.confirmDialog = action.payload;
    },
    hideConfirmDialog(state) {
      state.confirmDialog = null;
    },
  },
});

export const {
  toggleCommandPalette, setCommandPaletteOpen, setSearchOpen,
  setIsOnline, setSyncStatus, setLastSynced,
  toggleSidebarMobile, setSidebarMobileOpen,
  setTaskDetailId, setCreateTaskOpen, setCreateProjectOpen,
  setCreateWorkspaceOpen, setInviteMemberOpen,
  showConfirmDialog, hideConfirmDialog,
} = uiSlice.actions;
export default uiSlice.reducer;
