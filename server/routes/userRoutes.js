import express from 'express';
import { acceptConnectionRequest, discoverUsers, followUser, getUserConnections, getUserData, getUserProfiles, sendConnectionRequest, unfollowUser, updateUserData } from '../controllers/userController.js';
const userRouter = express.Router();
import { upload } from '../configs/multer.js'
import { getUserRecenetMessages } from '../controllers/messageController.js';

userRouter.get('/data', getUserData);

userRouter.post('/update', 
    upload.fields([{ name: 'profile', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), 
    updateUserData
);

userRouter.post('/discover', discoverUsers);

userRouter.post('/follow', followUser);

userRouter.post('/unfollow', unfollowUser);

userRouter.post('/connect', sendConnectionRequest);

userRouter.post('/accept', acceptConnectionRequest);

userRouter.get('/connections', getUserConnections);

userRouter.post('/profiles', getUserProfiles);

userRouter.get('/recent-messages', getUserRecenetMessages);

export default userRouter;
