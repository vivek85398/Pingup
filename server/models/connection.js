import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema({
    from_user_id: {
        type: String,
        ref: 'user',
        required: true
    },
    to_user_id: {
        type: String,
        ref: 'user',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted'],
        default: 'pending'
    }

},{timestamps: true});

const connections = mongoose.model('connection', connectionSchema);

export default connections;