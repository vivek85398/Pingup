import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    user: {
        type: String,
        ref: 'user',
        required: true
    },
    content: { type: String},
    image_urls: [{type: String}],
    post_type: {
        type: String,
        enum: ['text', 'image', 'text_with_image'],
        required: true
    },
    like_count: [{type: String, ref: 'user'}]
}, {timestamps: true, minimize: false});

const post = mongoose.model('post', postSchema);

export default post;