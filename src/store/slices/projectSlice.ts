import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project, ProjectMember, KanbanColumn, Role } from '@/types';

interface ProjectState {
  entities: Record<string, Project>;
  members: Record<string, ProjectMember[]>;
  kanbanColumns: Record<string, KanbanColumn[]>;
  currentProjectId: string | null;
}

const initialState: ProjectState = {
  entities: {},
  members: {},
  kanbanColumns: {},
  currentProjectId: null,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    loadProjects(state, action: PayloadAction<{ projects: Project[]; members: ProjectMember[]; kanbanColumns: KanbanColumn[] }>) {
      action.payload.projects.forEach(p => { state.entities[p.id] = p; });
      action.payload.members.forEach(m => {
        if (!state.members[m.projectId]) state.members[m.projectId] = [];
        const idx = state.members[m.projectId].findIndex(x => x.id === m.id);
        if (idx >= 0) state.members[m.projectId][idx] = m;
        else state.members[m.projectId].push(m);
      });
      action.payload.kanbanColumns.forEach(c => {
        if (!state.kanbanColumns[c.projectId]) state.kanbanColumns[c.projectId] = [];
        const idx = state.kanbanColumns[c.projectId].findIndex(x => x.id === c.id);
        if (idx >= 0) state.kanbanColumns[c.projectId][idx] = c;
        else state.kanbanColumns[c.projectId].push(c);
      });
    },
    setCurrentProject(state, action: PayloadAction<string | null>) {
      state.currentProjectId = action.payload;
    },
    createProject(state, action: PayloadAction<{ project: Project; members: ProjectMember[]; kanbanColumns: KanbanColumn[] }>) {
      state.entities[action.payload.project.id] = action.payload.project;
      state.members[action.payload.project.id] = action.payload.members;
      state.kanbanColumns[action.payload.project.id] = action.payload.kanbanColumns;
    },
    updateProject(state, action: PayloadAction<{ id: string; changes: Partial<Project> }>) {
      const proj = state.entities[action.payload.id];
      if (proj) {
        Object.assign(proj, action.payload.changes, { updatedAt: new Date().toISOString() });
      }
    },
    archiveProject(state, action: PayloadAction<string>) {
      const proj = state.entities[action.payload];
      if (proj) { proj.archived = true; proj.updatedAt = new Date().toISOString(); }
    },
    unarchiveProject(state, action: PayloadAction<string>) {
      const proj = state.entities[action.payload];
      if (proj) { proj.archived = false; proj.updatedAt = new Date().toISOString(); }
    },
    deleteProject(state, action: PayloadAction<string>) {
      delete state.entities[action.payload];
      delete state.members[action.payload];
      delete state.kanbanColumns[action.payload];
      if (state.currentProjectId === action.payload) state.currentProjectId = null;
    },
    addProjectMember(state, action: PayloadAction<ProjectMember>) {
      const pId = action.payload.projectId;
      if (!state.members[pId]) state.members[pId] = [];
      state.members[pId].push(action.payload);
    },
    removeProjectMember(state, action: PayloadAction<{ projectId: string; memberId: string }>) {
      const { projectId, memberId } = action.payload;
      if (state.members[projectId]) {
        state.members[projectId] = state.members[projectId].filter(m => m.id !== memberId);
      }
    },
    changeProjectMemberRole(state, action: PayloadAction<{ projectId: string; memberId: string; role: Role }>) {
      const member = state.members[action.payload.projectId]?.find(m => m.id === action.payload.memberId);
      if (member) member.role = action.payload.role;
    },
    addKanbanColumn(state, action: PayloadAction<KanbanColumn>) {
      const pId = action.payload.projectId;
      if (!state.kanbanColumns[pId]) state.kanbanColumns[pId] = [];
      state.kanbanColumns[pId].push(action.payload);
    },
    updateKanbanColumn(state, action: PayloadAction<{ projectId: string; columnId: string; changes: Partial<KanbanColumn> }>) {
      const col = state.kanbanColumns[action.payload.projectId]?.find(c => c.id === action.payload.columnId);
      if (col) Object.assign(col, action.payload.changes);
    },
    deleteKanbanColumn(state, action: PayloadAction<{ projectId: string; columnId: string }>) {
      const { projectId, columnId } = action.payload;
      if (state.kanbanColumns[projectId]) {
        state.kanbanColumns[projectId] = state.kanbanColumns[projectId].filter(c => c.id !== columnId);
      }
    },
    reorderKanbanColumns(state, action: PayloadAction<{ projectId: string; columns: KanbanColumn[] }>) {
      state.kanbanColumns[action.payload.projectId] = action.payload.columns;
    },
  },
});

export const {
  loadProjects, setCurrentProject, createProject, updateProject,
  archiveProject, unarchiveProject, deleteProject,
  addProjectMember, removeProjectMember, changeProjectMemberRole,
  addKanbanColumn, updateKanbanColumn, deleteKanbanColumn, reorderKanbanColumns,
} = projectSlice.actions;
export default projectSlice.reducer;
