import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Comment } from '@/types';

interface CommentState {
  entities: Record<string, Comment>;
}

const initialState: CommentState = {
  entities: {},
};

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    loadComments(state, action: PayloadAction<Comment[]>) {
      action.payload.forEach(c => { state.entities[c.id] = c; });
    },
    addComment(state, action: PayloadAction<Comment>) {
      state.entities[action.payload.id] = action.payload;
    },
    updateComment(state, action: PayloadAction<{ id: string; content: string; mentions?: string[] }>) {
      const comment = state.entities[action.payload.id];
      if (comment) {
        comment.content = action.payload.content;
        if (action.payload.mentions) comment.mentions = action.payload.mentions;
        comment.updatedAt = new Date().toISOString();
      }
    },
    deleteComment(state, action: PayloadAction<string>) {
      delete state.entities[action.payload];
    },
  },
});

export const { loadComments, addComment, updateComment, deleteComment } = commentSlice.actions;
export default commentSlice.reducer;
