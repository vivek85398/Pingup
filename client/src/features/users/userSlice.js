import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios.js';
import { toast } from 'react-hot-toast'

const initialState = {
    value: null
}

export const fetchUser = createAsyncThunk('user/fetchUser', async (userId) => {
    const { data } = await api.get('/api/user/data', {
        params: {userId}
    });

    return data.success ? data.user : null;
});

export const updateUser = createAsyncThunk('user/update', async (formData) => {
    const { data }= await api.post('/api/user/update', formData);
    if(data.success){
        toast.success(data.message);
        return data.user;
    } else {
        toast.error(data.message);
        return null;
    }
});

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder.addCase(fetchUser.fulfilled, (state, action)=>{
            state.value = action.payload;
        }).addCase(updateUser.fulfilled, (state, action)=>{
            state.value = action.payload;
        });
    }
});

export default userSlice.reducer;