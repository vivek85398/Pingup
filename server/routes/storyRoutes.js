import express from 'express';
const storyRouter = express.Router();
import { upload } from '../configs/multer.js';
import { addUserStory, getUserStories } from '../controllers/storyController.js';

storyRouter.post('/create', upload.single('media'), addUserStory);

storyRouter.get('/get', getUserStories);

export default storyRouter;