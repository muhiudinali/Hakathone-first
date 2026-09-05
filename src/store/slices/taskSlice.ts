import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, Subtask, Attachment, TaskStatus, Priority, HistoryEntry } from '@/types';
import { generateId } from '@/lib/utils';

interface TaskState {
  entities: Record<string, Task>;
  subtasks: Record<string, Subtask[]>;
  attachments: Record<string, Attachment[]>;
  selectedTaskIds: string[];
  history: HistoryEntry[];
  historyIndex: number;
}

const initialState: TaskState = {
  entities: {},
  subtasks: {},
  attachments: {},
  selectedTaskIds: [],
  history: [],
  historyIndex: -1,
};

function pushHistory(state: TaskState, entry: Omit<HistoryEntry, 'id' | 'timestamp'>) {
  // Remove future history when new action is taken
  state.history = state.history.slice(0, state.historyIndex + 1);
  state.history.push({
    ...entry,
    id: generateId(),
    timestamp: new Date().toISOString(),
  });
  state.historyIndex = state.history.length - 1;
  // Keep max 50 history entries
  if (state.history.length > 50) {
    state.history = state.history.slice(-50);
    state.historyIndex = state.history.length - 1;
  }
}

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    loadTasks(state, action: PayloadAction<{ tasks: Task[]; subtasks: Subtask[]; attachments?: Attachment[] }>) {
      action.payload.tasks.forEach(t => { state.entities[t.id] = t; });
      action.payload.subtasks.forEach(s => {
        if (!state.subtasks[s.taskId]) state.subtasks[s.taskId] = [];
        const idx = state.subtasks[s.taskId].findIndex(x => x.id === s.id);
        if (idx >= 0) state.subtasks[s.taskId][idx] = s;
        else state.subtasks[s.taskId].push(s);
      });
      if (action.payload.attachments) {
        action.payload.attachments.forEach(a => {
          if (!state.attachments[a.taskId]) state.attachments[a.taskId] = [];
          state.attachments[a.taskId].push(a);
        });
      }
    },
    createTask(state, action: PayloadAction<Task>) {
      state.entities[action.payload.id] = action.payload;
      pushHistory(state, {
        action: 'createTask',
        description: `Created task "${action.payload.title}"`,
        previousState: null,
        newState: action.payload,
      });
    },
    updateTask(state, action: PayloadAction<{ id: string; changes: Partial<Task> }>) {
      const task = state.entities[action.payload.id];
      if (task) {
        const prev = { ...task };
        Object.assign(task, action.payload.changes, { updatedAt: new Date().toISOString() });
        pushHistory(state, {
          action: 'updateTask',
          description: `Updated task "${task.title}"`,
          previousState: prev,
          newState: { ...task },
        });
      }
    },
    deleteTask(state, action: PayloadAction<string>) {
      const task = state.entities[action.payload];
      if (task) {
        pushHistory(state, {
          action: 'deleteTask',
          description: `Deleted task "${task.title}"`,
          previousState: { task, subtasks: state.subtasks[action.payload] || [], attachments: state.attachments[action.payload] || [] },
          newState: null,
        });
        delete state.entities[action.payload];
        delete state.subtasks[action.payload];
        delete state.attachments[action.payload];
        state.selectedTaskIds = state.selectedTaskIds.filter(id => id !== action.payload);
      }
    },
    restoreTask(state, action: PayloadAction<{ task: Task; subtasks?: Subtask[]; attachments?: Attachment[] }>) {
      state.entities[action.payload.task.id] = action.payload.task;
      if (action.payload.subtasks) {
        state.subtasks[action.payload.task.id] = action.payload.subtasks;
      }
      if (action.payload.attachments) {
        state.attachments[action.payload.task.id] = action.payload.attachments;
      }
    },
    duplicateTask(state, action: PayloadAction<{ originalId: string; newId: string }>) {
      const original = state.entities[action.payload.originalId];
      if (original) {
        const duplicate: Task = {
          ...original,
          id: action.payload.newId,
          title: `${original.title} (copy)`,
          status: 'todo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.entities[duplicate.id] = duplicate;
      }
    },
    moveTask(state, action: PayloadAction<{ taskId: string; newStatus: TaskStatus; newOrder: number }>) {
      const task = state.entities[action.payload.taskId];
      if (task) {
        const prev = { ...task };
        task.status = action.payload.newStatus;
        task.order = action.payload.newOrder;
        task.updatedAt = new Date().toISOString();
        pushHistory(state, {
          action: 'moveTask',
          description: `Moved task "${task.title}" to ${action.payload.newStatus}`,
          previousState: prev,
          newState: { ...task },
        });
      }
    },
    changeTaskStatus(state, action: PayloadAction<{ taskId: string; status: TaskStatus }>) {
      const task = state.entities[action.payload.taskId];
      if (task) {
        const prev = { ...task };
        task.status = action.payload.status;
        task.updatedAt = new Date().toISOString();
        pushHistory(state, {
          action: 'changeStatus',
          description: `Changed status of "${task.title}" to ${action.payload.status}`,
          previousState: prev,
          newState: { ...task },
        });
      }
    },
    changeTaskPriority(state, action: PayloadAction<{ taskId: string; priority: Priority }>) {
      const task = state.entities[action.payload.taskId];
      if (task) {
        task.priority = action.payload.priority;
        task.updatedAt = new Date().toISOString();
      }
    },
    assignTask(state, action: PayloadAction<{ taskId: string; assigneeId: string | null }>) {
      const task = state.entities[action.payload.taskId];
      if (task) {
        const prev = { ...task };
        task.assigneeId = action.payload.assigneeId;
        task.updatedAt = new Date().toISOString();
        pushHistory(state, {
          action: 'assignTask',
          description: `Assigned "${task.title}"`,
          previousState: prev,
          newState: { ...task },
        });
      }
    },
    addTaskLabel(state, action: PayloadAction<{ taskId: string; labelId: string }>) {
      const task = state.entities[action.payload.taskId];
      if (task && !task.labelIds.includes(action.payload.labelId)) {
        task.labelIds.push(action.payload.labelId);
        task.updatedAt = new Date().toISOString();
      }
    },
    removeTaskLabel(state, action: PayloadAction<{ taskId: string; labelId: string }>) {
      const task = state.entities[action.payload.taskId];
      if (task) {
        task.labelIds = task.labelIds.filter(id => id !== action.payload.labelId);
        task.updatedAt = new Date().toISOString();
      }
    },
    // Subtasks
    addSubtask(state, action: PayloadAction<Subtask>) {
      const taskId = action.payload.taskId;
      if (!state.subtasks[taskId]) state.subtasks[taskId] = [];
      state.subtasks[taskId].push(action.payload);
    },
    updateSubtask(state, action: PayloadAction<{ taskId: string; subtaskId: string; changes: Partial<Subtask> }>) {
      const subs = state.subtasks[action.payload.taskId];
      if (subs) {
        const sub = subs.find(s => s.id === action.payload.subtaskId);
        if (sub) Object.assign(sub, action.payload.changes);
      }
    },
    deleteSubtask(state, action: PayloadAction<{ taskId: string; subtaskId: string }>) {
      if (state.subtasks[action.payload.taskId]) {
        state.subtasks[action.payload.taskId] = state.subtasks[action.payload.taskId].filter(s => s.id !== action.payload.subtaskId);
      }
    },
    toggleSubtask(state, action: PayloadAction<{ taskId: string; subtaskId: string }>) {
      const sub = state.subtasks[action.payload.taskId]?.find(s => s.id === action.payload.subtaskId);
      if (sub) sub.completed = !sub.completed;
    },
    convertSubtaskToTask(state, action: PayloadAction<{ subtask: Subtask; newTask: Task }>) {
      // Remove subtask
      if (state.subtasks[action.payload.subtask.taskId]) {
        state.subtasks[action.payload.subtask.taskId] = state.subtasks[action.payload.subtask.taskId].filter(
          s => s.id !== action.payload.subtask.id
        );
      }
      // Add as task
      state.entities[action.payload.newTask.id] = action.payload.newTask;
    },
    convertTaskToSubtask(state, action: PayloadAction<{ taskId: string; parentTaskId: string; subtask: Subtask }>) {
      delete state.entities[action.payload.taskId];
      delete state.subtasks[action.payload.taskId];
      delete state.attachments[action.payload.taskId];
      state.selectedTaskIds = state.selectedTaskIds.filter(id => id !== action.payload.taskId);
      if (!state.subtasks[action.payload.parentTaskId]) state.subtasks[action.payload.parentTaskId] = [];
      state.subtasks[action.payload.parentTaskId].push(action.payload.subtask);
    },
    // Attachments
    addAttachment(state, action: PayloadAction<Attachment>) {
      const taskId = action.payload.taskId;
      if (!state.attachments[taskId]) state.attachments[taskId] = [];
      state.attachments[taskId].push(action.payload);
    },
    removeAttachment(state, action: PayloadAction<{ taskId: string; attachmentId: string }>) {
      if (state.attachments[action.payload.taskId]) {
        state.attachments[action.payload.taskId] = state.attachments[action.payload.taskId].filter(
          a => a.id !== action.payload.attachmentId
        );
      }
    },
    // Selection
    selectTask(state, action: PayloadAction<string>) {
      if (!state.selectedTaskIds.includes(action.payload)) {
        state.selectedTaskIds.push(action.payload);
      }
    },
    deselectTask(state, action: PayloadAction<string>) {
      state.selectedTaskIds = state.selectedTaskIds.filter(id => id !== action.payload);
    },
    toggleTaskSelection(state, action: PayloadAction<string>) {
      const idx = state.selectedTaskIds.indexOf(action.payload);
      if (idx >= 0) state.selectedTaskIds.splice(idx, 1);
      else state.selectedTaskIds.push(action.payload);
    },
    clearSelection(state) {
      state.selectedTaskIds = [];
    },
    selectAllTasks(state, action: PayloadAction<string[]>) {
      state.selectedTaskIds = action.payload;
    },
    // Bulk operations
    bulkChangeStatus(state, action: PayloadAction<{ taskIds: string[]; status: TaskStatus }>) {
      action.payload.taskIds.forEach(id => {
        const task = state.entities[id];
        if (task) {
          task.status = action.payload.status;
          task.updatedAt = new Date().toISOString();
        }
      });
    },
    bulkAssign(state, action: PayloadAction<{ taskIds: string[]; assigneeId: string | null }>) {
      action.payload.taskIds.forEach(id => {
        const task = state.entities[id];
        if (task) {
          task.assigneeId = action.payload.assigneeId;
          task.updatedAt = new Date().toISOString();
        }
      });
    },
    bulkDelete(state, action: PayloadAction<string[]>) {
      action.payload.forEach(id => {
        delete state.entities[id];
        delete state.subtasks[id];
        delete state.attachments[id];
      });
      state.selectedTaskIds = [];
    },
    // Undo/Redo
    undo(state) {
      if (state.historyIndex < 0) return;
      const entry = state.history[state.historyIndex];
      if (!entry) return;

      switch (entry.action) {
        case 'deleteTask': {
          const prev = entry.previousState as { task: Task; subtasks: Subtask[]; attachments: Attachment[] };
          state.entities[prev.task.id] = prev.task;
          if (prev.subtasks.length > 0) state.subtasks[prev.task.id] = prev.subtasks;
          if (prev.attachments.length > 0) state.attachments[prev.task.id] = prev.attachments;
          break;
        }
        case 'createTask': {
          const newTask = entry.newState as Task;
          delete state.entities[newTask.id];
          break;
        }
        case 'updateTask':
        case 'moveTask':
        case 'changeStatus':
        case 'assignTask': {
          const prev = entry.previousState as Task;
          state.entities[prev.id] = prev;
          break;
        }
      }
      state.historyIndex--;
    },
    redo(state) {
      if (state.historyIndex >= state.history.length - 1) return;
      state.historyIndex++;
      const entry = state.history[state.historyIndex];
      if (!entry) return;

      switch (entry.action) {
        case 'deleteTask': {
          const prev = entry.previousState as { task: Task };
          delete state.entities[prev.task.id];
          delete state.subtasks[prev.task.id];
          delete state.attachments[prev.task.id];
          break;
        }
        case 'createTask': {
          const newTask = entry.newState as Task;
          state.entities[newTask.id] = newTask;
          break;
        }
        case 'updateTask':
        case 'moveTask':
        case 'changeStatus':
        case 'assignTask': {
          const newState = entry.newState as Task;
          state.entities[newState.id] = newState;
          break;
        }
      }
    },
  },
});

export const {
  loadTasks, createTask, updateTask, deleteTask, restoreTask, duplicateTask,
  moveTask, changeTaskStatus, changeTaskPriority, assignTask,
  addTaskLabel, removeTaskLabel,
  addSubtask, updateSubtask, deleteSubtask, toggleSubtask, convertSubtaskToTask, convertTaskToSubtask,
  addAttachment, removeAttachment,
  selectTask, deselectTask, toggleTaskSelection, clearSelection, selectAllTasks,
  bulkChangeStatus, bulkAssign, bulkDelete,
  undo, redo,
} = taskSlice.actions;
export default taskSlice.reducer;
