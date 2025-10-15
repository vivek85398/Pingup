import { Inngest } from "inngest";
import userModel from '../models/userModel.js';
import connections from "../models/connection.js";
import sendEmail from "../configs/nodemailer.js";
import storyModel from '../models/storyModel.js'
import cloudinary from "../configs/cloudinary.js";
import messageModel from "../models/messageModel.js";
import postModel from "../models/postModel.js";

export const inngest = new Inngest({
    id: "pingup-app",
    eventKey: process.env.INGGEST_EVENT_KEY,
});

const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'},
    async ({event}) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;
        let username = email_addresses[0].email_address.split('@')[0];

        const user = await userModel.findOne({username});
        if(user) {
            username = username + Math.floor(Math.random() * 10000)
        }

        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            full_name: first_name + " " + last_name,
            profile_picture: image_url,
            username
        }
        await userModel.create(userData);
    }
);

const syncUserUpdation = inngest.createFunction(
    {id: 'update-user-from-clerk'},
    {event: 'clerk/user.updated'},
    async ({event}) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;

        const updatedUserData = {
            email: email_addresses[0].email_address,
            full_name: first_name + " " + last_name,
            profile_picture: image_url
        }
        await userModel.findByIdAndUpdate(id, updatedUserData)
    }
);

const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-from-clerk'},
    {event: 'clerk/user.deleted'},
    async ({event}) => {
        const { id } = event.data;
        const user = await userModel.findById(id);
        if(!user) {
            return {message: "User already deleted."}
        }

        const getPublicId = (url) => {
            if (!url) return null;
            const parts = url.split("/");
            const fileName = parts.pop().split(".")[0];
            const folderName = parts.slice(parts.indexOf("pingup-profile") >= 0 ? parts.indexOf("pingup-profile") : parts.indexOf("pingup-cover")).join("/");
            return `${folderName}/${fileName}`;
        };

        if(user.profile_picture){
            const profilePublicId = getPublicId(user.profile_picture);
            if(profilePublicId){
                await cloudinary.uploader.destroy(profilePublicId);
            }
        }
        
        if(user.cover_photo){
            const coverPublicId = getPublicId(user.cover_photo);
            if(coverPublicId){
                await cloudinary.uploader.destroy(coverPublicId);
            }
        }

        const posts = await postModel.find({ user: id });

        for (const post of posts) {
            if (post.image_urls && post.image_urls.length > 0) {
                for (const url of post.image_urls) {
                    const postPublicId = getPublicId(url);
                    if (postPublicId) {
                        await cloudinary.uploader.destroy(postPublicId);
                    }
                }
            }
        }

        await postModel.deleteMany({ user: id });
        await userModel.findByIdAndDelete(id);
    }
);

const sendNewConnectionRequestReminder = inngest.createFunction(
  { id: 'send-new-connection-request-reminder' },
  { event: 'app/connection-request' },
  async ({ event, step }) => {
    const { connectionId } = event.data;

    await step.run('send-connection-request-mail', async () => {
      const connection = await connections
        .findById(connectionId)
        .populate('from_user_id to_user_id');

      if (!connection) {
        throw new Error('Connection not found');
      }

      const subject = `👋 New Connection Request`;
      const body = `
        <div style="font-family: Arial, Helvetica, sans-serif; padding: 20px;">
          <h2>Hi ${connection.to_user_id.full_name}</h2>
          <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
          <p>
            Click
            <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;">here</a>
            to accept or reject the request.
          </p>
          <br/>
          <p>Thanks, <br/> Pingup - Stay Connected</p>
        </div>
      `;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body,
      });
    });

    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil('wait-for-24-hours', in24Hours);

    await step.run('send-connection-request-reminder', async () => {
      const connection = await connections
        .findById(connectionId)
        .populate('from_user_id to_user_id');

      if (!connection) {
        throw new Error('Connection not found');
      }

      if (connection.status === 'accepted') {
        return { message: 'Already accepted' };
      }

      const subject = `⏰ Reminder: You have a new connection request`;
      const body = `
        <div style="font-family: Arial, Helvetica, sans-serif; padding: 20px;">
          <h2>Hi ${connection.to_user_id.full_name}</h2>
          <p>You still have a pending connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
          <p>
            Click
            <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;">here</a>
            to accept or reject the request.
          </p>
          <br/>
          <p>Thanks, <br/> Pingup - Stay Connected</p>
        </div>
      `;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body,
      });

      return { message: 'Reminder sent.' };
    });
  }
);

export const deleteStory = inngest.createFunction(
    { id: "story-delete" },
    { event: "app/story.delete" },
    async ({ event, step }) => {
        const { storyId, cloudinary_id } = event.data;
        const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await step.sleepUntil("wait-for-24-hours", in24Hours);

        await step.run("delete-story", async () => {
            await storyModel.findByIdAndDelete(storyId);
            if (cloudinary_id) {
                await cloudinary.uploader.destroy(cloudinary_id);
            }
            return { message: "Story deleted successfully." };
        });
    }
);

const sendNotificationUnseenMessages = inngest.createFunction(
    { id: 'send-unseen-messages-notification' },
    { cron: 'TZ=America/New_York 0 9 * * *' },
    async ({ step }) => {
        const messages = await messageModel.find({ seen: false }).populate('to_user_id');
        const unseenCount = {};

        messages.forEach(message => {
            const userId = message.to_user_id._id.toString();
            unseenCount[userId] = (unseenCount[userId] || 0) + 1;
        });

        for (const userId in unseenCount) {
            const user = await userModel.findById(userId);

            const subject = `You have ${unseenCount[userId]} unseen messages`;

            const body = `
                <div style="font-family: Arial, Helvetica, sans-serif; padding: 20px;">
                    <h2>Hi ${user.full_name}</h2>
                    <p>You have ${unseenCount[userId]} unseen messages</p>
                    <p>
                    Click
                    <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;">here</a>
                    to view them
                    </p>
                    <br/>
                    <p>Thanks, <br/> Pingup - Stay Connected</p>
                </div>
            `;

            await sendEmail({
                to: user.email,
                subject,
                body
            });
        }

        return { message: 'Notification sent.' };
    }
);

export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    sendNewConnectionRequestReminder,
    deleteStory,
    sendNotificationUnseenMessages
];