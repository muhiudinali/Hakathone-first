import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';

interface AuthState {
  currentUserId: string | null;
  isAuthenticated: boolean;
  loginAt: string | null;
  users: Record<string, User>;
}

const initialState: AuthState = {
  currentUserId: null,
  isAuthenticated: false,
  loginAt: null,
  users: {},
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<User[]>) {
      action.payload.forEach(u => { state.users[u.id] = u; });
    },
    login(state, action: PayloadAction<string>) {
      state.currentUserId = action.payload;
      state.isAuthenticated = true;
      state.loginAt = new Date().toISOString();
    },
    logout(state) {
      state.currentUserId = null;
      state.isAuthenticated = false;
      state.loginAt = null;
    },
    signup(state, action: PayloadAction<User>) {
      state.users[action.payload.id] = action.payload;
      state.currentUserId = action.payload.id;
      state.isAuthenticated = true;
      state.loginAt = new Date().toISOString();
    },
    updateProfile(state, action: PayloadAction<{ userId: string; name?: string; email?: string; avatar?: string }>) {
      const user = state.users[action.payload.userId];
      if (user) {
        if (action.payload.name) user.name = action.payload.name;
        if (action.payload.email) user.email = action.payload.email;
        if (action.payload.avatar !== undefined) user.avatar = action.payload.avatar;
      }
    },
    switchUser(state, action: PayloadAction<string>) {
      if (state.users[action.payload]) {
        state.currentUserId = action.payload;
        state.loginAt = new Date().toISOString();
      }
    },
  },
});

export const { setUsers, login, logout, signup, updateProfile, switchUser } = authSlice.actions;
export default authSlice.reducer;
