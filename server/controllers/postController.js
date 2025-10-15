import fs from 'fs';
import cloudinary from '../configs/cloudinary.js';
import postModel from '../models/postModel.js';
import userModel from '../models/userModel.js';

export const addPost = async (req, res) => {
    try {
        const { userId, content, post_type } = req.body;
        const images = req.files;

        let image_urls = [];

        if (images.length) {
            image_urls = await Promise.all(
                images.map(async (image) => {
                const uploadRes = await cloudinary.uploader.upload(image.path, {
                    folder: "pingup-post",
                    resource_type: "image",
                    transformation: [
                        { quality: "auto", format: "webp", width: 1280 }
                    ]
                });

                fs.unlinkSync(image.path);

                return uploadRes.secure_url;
                })
            );
        }
        await postModel.create({
            user: userId,
            content,
            image_urls,
            post_type
        });

        res.json({success: true, message: 'Post created successfully'});
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message});
    }
}

export const getFeedPosts = async (req, res) => {
    try {
        const { userId } = req.query;
        const user = await userModel.findById(userId);

        const userIds = [userId, ...user.connections, ...user.following];
        const posts = await postModel.find({user: {$in: userIds}}).populate('user').sort({createdAt: -1});

        res.json({success: true, posts});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const likePost = async (req, res) => {
  try {
    const { postId, userId } = req.body;

    const post = await postModel.findById(postId);
    if (!post) {
        return res.json({ success: false, message: "Post not found" });
    }

    if(post.like_count.includes(userId)) {
        post.like_count = post.like_count.filter(user => user !== userId);
        await post.save();
        return res.json({ success: true, message: 'Post unliked', post });
    } else {
        post.like_count.push(userId);
        await post.save();
        return res.json({ success: true, message: 'Post Liked', post });
    }

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}