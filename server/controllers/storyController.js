import cloudinary from "../configs/cloudinary.js";
import { inngest } from '../inngest/index.js'
import storyModel from "../models/storyModel.js";
import userModel from "../models/userModel.js";
import fs from 'fs';

export const addUserStory = async (req, res) => {
  try {
    const { content, media_type, background_color, userId } = req.body;
    const media = req.file || null;
    let media_url = '';
    let cloudinary_id = '';

    if (media_type === 'image' || media_type === 'video') {
        const uploadRes = await cloudinary.uploader.upload(media.path, {
            folder: "pingup-story",
            resource_type: media_type,
            transformation: [
            { quality: "auto", format: "webp", width: 1280 }
            ]
        });

        fs.unlinkSync(media.path);

        media_url = uploadRes.secure_url;
        cloudinary_id = uploadRes.public_id;
    }

    const story = await storyModel.create({
        user: userId,
        content,
        media_url,
        media_type,
        background_color
    });

    await inngest.send({
        name: "app/story.delete",
        data: { storyId: story._id, cloudinary_id: cloudinary_id },
    });

    res.json({ success: true, story });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export const getUserStories = async (req, res) => {
    try {
        const { userId } = req.query;
        const user = await userModel.findById(userId);

        const userIds = [userId, ...user.connections, ...user.following];

        const stories = await storyModel.find({
            user: {$in: userIds}
        }).populate('user').sort({createdAt: -1});

        res.json({success: true, stories});
        
    } catch (error) {
        res.json({success: true, message: error.message});
    }
}