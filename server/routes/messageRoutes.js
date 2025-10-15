import express from 'express';
const messageRouter = express.Router();
import { upload } from '../configs/multer.js';
import { getChatMessages, sendMessage, sseController } from '../controllers/messageController.js';

messageRouter.get('/:userId', sseController);
messageRouter.post('/send', upload.single('image'), sendMessage);
messageRouter.post('/get', getChatMessages);

export default messageRouter;