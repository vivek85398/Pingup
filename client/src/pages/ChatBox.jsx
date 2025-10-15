import React, { useEffect, useRef, useState } from 'react'
import { ImageIcon, SendHorizonal } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import api from '../api/axios'
import { toast } from 'react-hot-toast'
import { addMessages, fetchMessages, resetMessages } from '../features/messages/messageSlice'

const ChatBox = () => {
  const { messages } = useSelector((state)=>state.messages);
  const [Text, setText] = useState('');
  const [Image, setImage] = useState(null);
  const [User, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const { userId } = useParams();
  const { user } = useUser();
  const dispatch = useDispatch();
  const connections = useSelector((state)=> state.connections.connections);

  const fetchUserMessages = async () => {
    try {
      dispatch(fetchMessages({userId: user?.id, to_user_id: userId}));
    } catch (error) {
      toast.error(error.message);
    }
  }

  const sendMessage = async () => {
    try {
      if(!Text && !Image) return;
      const formData = new FormData();
      formData.append('to_user_id', userId);
      formData.append('userId', user?.id);
      formData.append('text', Text);
      Image && formData.append('image', Image);
      
      const { data } = await api.post('/api/message/send', formData);
      if(data.success){
        setText('');
        setImage(null);
        dispatch(addMessages(data.message));
      }
      else{
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(()=>{
    fetchUserMessages();
    return () => {
      dispatch(resetMessages());
    }
  }, [userId]);

  useEffect(()=>{
    if(connections.length > 0){
      const user = connections.find(connection => connection._id === userId);
      setUser(user);
    }
  }, [connections, userId]);

  useEffect(()=>{
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  }, [messages]);

  return User && (
    <div className='flex flex-col h-screen'>
      <div className="flex items-center gap-2 p-2 md:px-10 xl:pl-24 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-300">
        <img src={User.profile_picture} className='size-8 rounded-full' alt="" />
        <div className="">
          <p className='font-medium'>{User.full_name}</p>
          <p className='text-sm text-gray-500 -mt-1.5'>@{User.username}</p>
        </div>
      </div>
      <div className="p-5 md:px-10 h-full overflow-y-scroll">
        <div className="space-y-4 max-w-4xl mx-auto">
          {
            messages.toSorted((a, b)=>new Date(a.createdAt) - new Date(b.createdAt))
            .map((message, index)=>(
              <div key={index} 
                className={`flex flex-col ${message?.to_user_id !== User?._id ? 'items-start' : 'items-end'}`}
              >
                <div className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow ${message.to_user_id !== User._id ? 'rounded-bl-none' : 'rounded-br-none'}`}>
                  {
                    message.message_type === 'image' && 
                    <img src={message.media_url} className='w-full max-w-sm rounded-lg mb-1' alt="" />
                  }
                  <p>{message.text}</p>
                </div>
              </div>
            ))
          }
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="px-4">
        <div className="flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5">
          <input type="text" placeholder='Type a message...' 
            className='flex-1 outline-none text-slate-700'
            onKeyDown={e=>e.key === 'Enter' && sendMessage()}
            onChange={(e)=>setText(e.target.value)} value={Text}
          />

          <label htmlFor="image">
            {
              Image ? 
              <img src={URL.createObjectURL(Image)} className='h-8 rounded' alt="" />
              : <ImageIcon className='size-7 text-gray-400 cursor-pointer' />
            }
            <input type='file' id='image' accept='image/*' hidden
              onChange={(e)=> setImage(e.target.files[0])}
            />
          </label>
          <button onClick={()=>{
            sendMessage();
            setText('');
            setImage(null);
          }}
            className='bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full'
          >
            <SendHorizonal size={18}/>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatBox