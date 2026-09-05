import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Workspace, WorkspaceMember, Label, Role } from '@/types';
import { generateId } from '@/lib/utils';

interface WorkspaceState {
  entities: Record<string, Workspace>;
  members: Record<string, WorkspaceMember[]>;
  labels: Record<string, Label[]>;
  currentWorkspaceId: string | null;
}

const initialState: WorkspaceState = {
  entities: {},
  members: {},
  labels: {},
  currentWorkspaceId: null,
};

const workspaceSlice = createSlice({
  name: 'workspaces',
  initialState,
  reducers: {
    loadWorkspaces(state, action: PayloadAction<{ workspaces: Workspace[]; members: WorkspaceMember[]; labels: Label[] }>) {
      action.payload.workspaces.forEach(w => { state.entities[w.id] = w; });
      action.payload.members.forEach(m => {
        if (!state.members[m.workspaceId]) state.members[m.workspaceId] = [];
        const existing = state.members[m.workspaceId].findIndex(x => x.id === m.id);
        if (existing >= 0) state.members[m.workspaceId][existing] = m;
        else state.members[m.workspaceId].push(m);
      });
      action.payload.labels.forEach(l => {
        if (!state.labels[l.workspaceId]) state.labels[l.workspaceId] = [];
        state.labels[l.workspaceId].push(l);
      });
    },
    setCurrentWorkspace(state, action: PayloadAction<string>) {
      state.currentWorkspaceId = action.payload;
    },
    createWorkspace(state, action: PayloadAction<{ workspace: Workspace; member: WorkspaceMember }>) {
      state.entities[action.payload.workspace.id] = action.payload.workspace;
      state.members[action.payload.workspace.id] = [action.payload.member];
      state.labels[action.payload.workspace.id] = [];
      state.currentWorkspaceId = action.payload.workspace.id;
    },
    updateWorkspace(state, action: PayloadAction<{ id: string; changes: Partial<Workspace> }>) {
      const ws = state.entities[action.payload.id];
      if (ws) {
        Object.assign(ws, action.payload.changes, { updatedAt: new Date().toISOString() });
      }
    },
    deleteWorkspace(state, action: PayloadAction<string>) {
      delete state.entities[action.payload];
      delete state.members[action.payload];
      delete state.labels[action.payload];
      if (state.currentWorkspaceId === action.payload) {
        const remaining = Object.keys(state.entities);
        state.currentWorkspaceId = remaining.length > 0 ? remaining[0] : null;
      }
    },
    addMember(state, action: PayloadAction<WorkspaceMember>) {
      const wsId = action.payload.workspaceId;
      if (!state.members[wsId]) state.members[wsId] = [];
      state.members[wsId].push(action.payload);
    },
    removeMember(state, action: PayloadAction<{ workspaceId: string; memberId: string }>) {
      const { workspaceId, memberId } = action.payload;
      if (state.members[workspaceId]) {
        state.members[workspaceId] = state.members[workspaceId].filter(m => m.id !== memberId);
      }
    },
    changeMemberRole(state, action: PayloadAction<{ workspaceId: string; memberId: string; role: Role }>) {
      const { workspaceId, memberId, role } = action.payload;
      const member = state.members[workspaceId]?.find(m => m.id === memberId);
      if (member) member.role = role;
    },
    addLabel(state, action: PayloadAction<Label>) {
      const wsId = action.payload.workspaceId;
      if (!state.labels[wsId]) state.labels[wsId] = [];
      state.labels[wsId].push(action.payload);
    },
    removeLabel(state, action: PayloadAction<{ workspaceId: string; labelId: string }>) {
      const { workspaceId, labelId } = action.payload;
      if (state.labels[workspaceId]) {
        state.labels[workspaceId] = state.labels[workspaceId].filter(l => l.id !== labelId);
      }
    },
  },
});

export const {
  loadWorkspaces, setCurrentWorkspace, createWorkspace, updateWorkspace,
  deleteWorkspace, addMember, removeMember, changeMemberRole, addLabel, removeLabel,
} = workspaceSlice.actions;
export default workspaceSlice.reducer;
