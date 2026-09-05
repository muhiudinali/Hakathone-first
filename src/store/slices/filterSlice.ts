import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FilterState, SavedFilter, SortState, DEFAULT_FILTER_STATE } from '@/types';

interface FilterSliceState {
  active: FilterState;
  sort: SortState;
  saved: SavedFilter[];
  groupBy: string | null;
}

const initialState: FilterSliceState = {
  active: { ...DEFAULT_FILTER_STATE },
  sort: { field: 'createdAt', direction: 'desc' },
  saved: [],
  groupBy: null,
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<Partial<FilterState>>) {
      Object.assign(state.active, action.payload);
    },
    clearFilters(state) {
      state.active = { ...DEFAULT_FILTER_STATE };
    },
    setSort(state, action: PayloadAction<SortState>) {
      state.sort = action.payload;
    },
    setGroupBy(state, action: PayloadAction<string | null>) {
      state.groupBy = action.payload;
    },
    saveFilter(state, action: PayloadAction<SavedFilter>) {
      state.saved.push(action.payload);
    },
    deleteSavedFilter(state, action: PayloadAction<string>) {
      state.saved = state.saved.filter(f => f.id !== action.payload);
    },
    applySavedFilter(state, action: PayloadAction<string>) {
      const saved = state.saved.find(f => f.id === action.payload);
      if (saved) state.active = { ...saved.filters };
    },
    loadSavedFilters(state, action: PayloadAction<SavedFilter[]>) {
      state.saved = action.payload;
    },
  },
});

export const {
  setFilter, clearFilters, setSort, setGroupBy,
  saveFilter, deleteSavedFilter, applySavedFilter, loadSavedFilters,
} = filterSlice.actions;
export default filterSlice.reducer;
