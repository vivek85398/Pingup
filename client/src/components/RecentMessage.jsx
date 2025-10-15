import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment';
import { useUser } from '@clerk/clerk-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const RecentMessage = () => {
  const [Messages, setMessages] = useState([]);
  const { user } = useUser();
  const userId = user?.id;

  const fetchRecentMessages = async () => {
    try {
      const { data } = await api.get('/api/user/recent-messages', {
        params: { userId }
      });

      if (data.success) {
        const messagesArray = data.messages || [];

        const groupedMessages = messagesArray.reduce((acc, message) => {
          const senderId = message.from_user_id._id;
          if (!acc[senderId] || new Date(message.createdAt) > new Date(acc[senderId].createdAt)) {
            acc[senderId] = message;
          }
          return acc;
        }, {});

        const sortedMessages = Object.values(groupedMessages).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setMessages(sortedMessages);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(()=>{
    if(user){
      fetchRecentMessages();
      setInterval(fetchRecentMessages, 30000);
      return () => {clearInterval()}
    }
  }, [user]);

  return (
    <div className='bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800'>
      <h3 className='font-semibold text-slate-800 mb-4'>Recent Messages</h3>
      <div className="flex flex-col max-h-56 overflow-y-scroll no-scrollbar">
        {
            Messages.map((message, index)=>(
                <Link key={index} 
                    to={`/messages/${message.from_user_id._id}`}
                    className='flex items-start gap-2 py-2 hover:bg-slate-100'
                >
                    <img className='w-8 h-8 rounded-full'
                        src={message.from_user_id.profile_picture} alt="" 
                    />
                    <div className="w-full">
                        <div className="flex justify-between">
                            <p className='font-medium'>{message.from_user_id.full_name}</p>
                            <p className='text-[10px] text-slate-400'>{moment(message.createdAt).fromNow()}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className='text-gray-500'>{message.text ? message.text : 'Media'}</p>
                            {
                                !message.seen && 
                                <p className='bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px]'>1</p>
                            }
                        </div>
                    </div>
                </Link>
            ))
        }
      </div>
    </div>
  )
}

export default RecentMessage
