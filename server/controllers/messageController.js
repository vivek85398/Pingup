import cloudinary from "../configs/cloudinary.js";
import messageModel from '../models/messageModel.js'

const connections = {};

export const sseController = (req, res) => {
    const { userId } = req.params;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    connections[userId] = res;

    res.write(`data: ${JSON.stringify({ message: "Connected to SSE stream" })}\n\n`);

    req.on('close', () => {
        delete connections[userId];
    });
};

export const sendMessage = async (req, res) => {
    try {
        const { to_user_id, text, userId } = req.body;
        const image = req.file;

        let media_url = '';
        let message_type = image ? 'image' : 'text';

        if (message_type === 'image') {
            const uploadRes = await cloudinary.uploader.upload(image.path, {
                folder: 'pingup-message',
                resource_type: 'image',
                transformation: [
                    { quality: "auto", format: "webp", width: 1280 }
                ]
            });
            media_url = uploadRes.secure_url;
        }

        const message = await messageModel.create({
            from_user_id: userId,
            to_user_id,
            text,
            message_type,
            media_url
        });

        res.json({ success: true, message });

        const messageWithUserData = await messageModel.findById(message._id).populate('from_user_id');
        if (connections[to_user_id]) {
            try {
                connections[to_user_id].write(`data: ${JSON.stringify(messageWithUserData)}\n\n`);
            } catch (error) {
                delete connections[to_user_id];
            }
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getChatMessages = async (req, res) => {
    try {
        const { userId, to_user_id } = req.body;

        const messages = await messageModel.find({
            $or: [
                {from_user_id: userId, to_user_id},
                {from_user_id: to_user_id, to_user_id: userId}
            ]
        }).sort({createdAt: -1});

        await messageModel.updateMany({from_user_id: to_user_id, to_user_id: userId}, {seen: true});

        res.json({success: true, messages})
    } catch (error) {
        res.json({success: false, message: error.message});
    }
} 

export const getUserRecenetMessages = async (req, res) => {
    try {
        const { userId } = req.query;

        const messages = await messageModel
            .find({ to_user_id: userId })
            .populate('from_user_id to_user_id')
            .sort({ createdAt: -1 });

        res.json({ success: true, messages });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
