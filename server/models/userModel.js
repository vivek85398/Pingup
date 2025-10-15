import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    full_name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
    },
    bio: {
        type: String,
        default: 'Hey there! I am using Pingup'
    },
    profile_picture: {
        type: String,
        default: ''
    },
    cover_photo: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    followers: {
        type: Array,
        ref: 'user'
    },
    following: {
        type: Array,
        ref: 'user'
    },
    connections: {
        type: Array,
        ref: 'user'
    },

}, {timestamps: true, minimize: false});

const userModel = mongoose.model('user', userSchema);

export default userModel;