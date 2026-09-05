import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ActivityEvent } from '@/types';

interface ActivityState {
  events: ActivityEvent[];
}

const initialState: ActivityState = {
  events: [],
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    loadActivity(state, action: PayloadAction<ActivityEvent[]>) {
      state.events = action.payload;
    },
    addActivity(state, action: PayloadAction<ActivityEvent>) {
      state.events.unshift(action.payload);
      if (state.events.length > 500) state.events = state.events.slice(0, 500);
    },
    clearProjectActivity(state, action: PayloadAction<string>) {
      state.events = state.events.filter(e => e.projectId !== action.payload);
    },
  },
});

export const { loadActivity, addActivity, clearProjectActivity } = activitySlice.actions;
export default activitySlice.reducer;
