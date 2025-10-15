import express from 'express';
import { upload } from '../configs/multer.js';
import { addPost, getFeedPosts, likePost } from '../controllers/postController.js'

const postRouter = express.Router();

postRouter.post('/add', upload.array('images', 4), addPost);

postRouter.get('/feed', getFeedPosts);

postRouter.post('/like', likePost);

export default postRouter;