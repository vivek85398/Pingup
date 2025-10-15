import cloudinary from "../configs/cloudinary.js";
import userModel from "../models/userModel.js";
import fs from 'fs'
import connections from "../models/connection.js";
import postModel from '../models/postModel.js';
import { inngest } from "../inngest/index.js";

export const getUserData = async (req, res) => {
    try {
        const { userId } = req.query;
        if(!userId) {
            return res.json({success: false, message: "not authenticated"});
        }
        const user = await userModel.findById(userId);
        if(!user) { 
            return res.json({success: false, message: "user not found"});
        }
        
        res.json({success: true, user});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const updateUserData = async (req, res) => {
  try {
    let { username, bio, location, full_name, userId } = JSON.parse(req.body.userData);

    const tempUser = await userModel.findById(userId);
    if (!tempUser) {
      return res.json({ success: false, message: "user not found" });
    }

    if (username && username !== tempUser.username) {
      const userExists = await userModel.findOne({ username });
      if (userExists) {
        username = tempUser.username;
      }
    }

    const profile = req.files?.profile?.[0];
    const cover = req.files?.cover?.[0];

    const updatedData = {
      username,
      bio,
      location,
      full_name,
    };

    const getPublicId = (url) => {
      if (!url) return null;
      const parts = url.split("/");
      const fileName = parts.pop().split(".")[0];
      const folderName = parts.slice(parts.indexOf("pingup-profile") >= 0 ? parts.indexOf("pingup-profile") : parts.indexOf("pingup-cover")).join("/");
      return `${folderName}/${fileName}`;
    };


    if (profile) {  
        const oldProfilePublicId = getPublicId(tempUser.profile_picture);
        if (oldProfilePublicId) {
            await cloudinary.uploader.destroy(oldProfilePublicId);
        }
        const oldCoverPublicId = getPublicId(tempUser.cover_photo);
        if (oldCoverPublicId) {
            await cloudinary.uploader.destroy(oldCoverPublicId);
        }

        const uploadRes = await cloudinary.uploader.upload(profile.path, {
            folder: "pingup-profile",
            resource_type: "image",
            transformation: [{ quality: "auto", format: "webp", width: 512 }]
        });

        updatedData.profile_picture = uploadRes.secure_url;
        fs.unlinkSync(profile.path);
    }

    if (cover) {
      const uploadRes = await cloudinary.uploader.upload(cover.path, {
        folder: "pingup-cover",
        resource_type: "image",
        transformation: [{ quality: "auto", format: "webp", width: 1280 }]
      });

      updatedData.cover_photo = uploadRes.secure_url;
      fs.unlinkSync(cover.path);
    }

    const user = await userModel.findByIdAndUpdate(userId, updatedData, { new: true });

    res.json({ success: true, user, message: "Profile updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const discoverUsers = async (req, res) => {
    try {
        const { input, userId } = req.body;
        if(!userId) {
            return res.json({success: false, message: "not authenticated"});
        }

        const allUsers = await userModel.find({
            $or: [
                {username: new RegExp(input, 'i')},
                {email: new RegExp(input, 'i')},
                {full_name: new RegExp(input, 'i')},
                {location: new RegExp(input, 'i')}
            ]
        });

        const filteredUser = allUsers.filter(user => user._id !== userId);
        
        res.json({success: true, users: filteredUser});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const followUser = async (req, res) => {
    try {
        const { id, userId } = req.body;
        if(!userId) {
            return res.json({success: false, message: "not authenticated"});
        }

        const user = await userModel.findById(userId);
        if(user.following.includes(id)){
            return res.json({success: false, message: 'You are already following this user'});
        }
        user.following.push(id);
        await user.save();

        const toUser = await userModel.findById(id);
        toUser.followers.push(userId);
        await toUser.save();
        
        res.json({success: true, message: 'Now you are following this user'});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const unfollowUser = async (req, res) => {
    try {
        const { id, userId } = req.body;
        if(!userId) {
            return res.json({success: false, message: "not authenticated"});
        }

        const user = await userModel.findById(userId);

        user.following = user.following.filter(user => user !== id);
        await user.save();

        const toUser = await userModel.findById(id);
        toUser.followers = toUser.followers.filter(user => user !== userId);
        await toUser.save();    
        
        res.json({success: true, message: 'You are no longer following'});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const sendConnectionRequest = async (req, res) => {
    try {
        const { id, userId } = req.body;

        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const connectionRequests = await connections.find({from_user_id: userId, createdAt: {$gt: last24Hours}});

        if(connectionRequests.length >= 20) {
            return res.json({success: false, message: 'You have sent more than 20 connection requests in the last 24 hours'});
        }

        const connection = await connections.findOne({
            $or: [
                {from_user_id: userId, to_user_id: id},
                {from_user_id: id, to_user_id: userId},
            ]
        });

        if(!connection){
            const newConnection = await connections.create({
                from_user_id: userId,
                to_user_id: id
            });

            await inngest.send({
                name: 'app/connection-request',
                data: {connectionId: newConnection._id}
            });

            return res.json({success: true, message: 'Connection request sent successfully'});
        }
        else if(connection && connection.status === 'accepted'){
            return res.json({success: true, message: 'You are alredy connected with this user'});
        }

        return res.json({success: false, message: 'Connection request pending'});

    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const getUserConnections = async (req, res) => {
    try {
        const { userId } = req.query;
        const user = await userModel.findById(userId).populate('connections followers following');
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        const Allconnections = user.connections;
        const followers = user.followers;
        const following = user.following;

        const pendingConnections = (await connections.find({to_user_id: userId, status: 'pending'}).populate('from_user_id')).map(connection => connection.from_user_id);
        res.json({success: true, connections: Allconnections, followers, following, pendingConnections});

    } catch (error) {
        console.log(error)
        return res.json({success: false, message: error.message});
    }
}

export const acceptConnectionRequest = async (req, res) => {
    try {
        const { id, userId } = req.body;

        const connection = await connections.findOne({from_user_id: id, to_user_id: userId});
        if(!connection){
            return res.json({success: false, message: 'Connection not found'});
        }

        const user = await userModel.findById(userId);
        if(user){
            user.connections.push(id);
            await user.save();
        }
        
        const toUser = await userModel.findById(id);
        if(toUser){
            toUser.connections.push(userId);
            await toUser.save();
        }

        connection.status = 'accepted';
        await connection.save();

        res.json({success: true, message: 'Connection accepted successfully'});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const getUserProfiles = async (req, res) => {
    try {
        const { profileId } = req.body;
        const profile = await userModel.findById(profileId);
        if(!profile){
            return res.json({success: false, message: 'Profile not found'});
        }
        const posts = await postModel.find({user: profileId}).populate('user');
        
        res.json({success: true, profile, posts});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}