import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios'

const initialState = {
    messages: []
}

export const fetchMessages = createAsyncThunk('messages/fetchMessages',
    async({userId, to_user_id})=>{
        const { data } = await api.post('/api/message/get', {userId, to_user_id});
        return data.success ? data : null;
    }
)

const messageSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        setMessages: (state, action)=>{
            state.messages = action.payload;
        },
        addMessages: (state, action)=>{
            state.messages = [...state.messages, action.payload];
        },
        resetMessages: (state)=>{
            state.messages = [];
        }
    }, 
    extraReducers: (builder)=>{
        builder.addCase(fetchMessages.fulfilled, (state, action)=>{
            if(action.payload){
                state.messages = action.payload.messages;
            }
        });
    }
});

export const { setMessages, addMessages, resetMessages } = messageSlice.actions;

export default messageSlice.reducer;