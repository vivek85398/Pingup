import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    user: {
        type: String,
        ref: 'user',
        required: true
    },
    content: {
        type: String,
    },
    media_url: {
        type: String
    },
    media_type: {
        type: String, 
        enum: ['text', 'image', 'video']
    },
    views_count: [{type: String, ref: 'user'}],
    background_color: {
        type: String
    }
}, {timestamps: true, minimize: false});

const storyModel = mongoose.model('story', storySchema);

export default storyModel;