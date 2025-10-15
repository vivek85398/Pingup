import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const initialState = {
  connections: [],
  pendingConnections: [],
  followers: [],
  following: [],
};

export const fetchConnections = createAsyncThunk(
  'connections/fetchConnections',
  async (userId) => {
    try {
      const { data } = await api.get('/api/user/connections', {
        params: { userId },
      });
      if (data.success) {
        return data;
      }
    } catch (error) {
      toast.error(error.message);
    }
  }
);

const connectionSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {},
  
  extraReducers: (builder) => {
    builder.addCase(fetchConnections.fulfilled, (state, action) => {
      if (action.payload) {
        state.connections = action.payload.connections || [];
        state.pendingConnections = action.payload.pendingConnections || [];
        state.followers = action.payload.followers || [];
        state.following = action.payload.following || [];
      }
    });
  },
});

export default connectionSlice.reducer;