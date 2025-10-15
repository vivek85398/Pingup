import React from 'react'
import { Eye, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Messages = () => {
  const navigate = useNavigate();
  const { connections } = useSelector((state)=>state.connections);

  return (
    <div className='min-h-screen relative bg-slate-50'>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Messages</h1>
          <p>Talk to your friends and family</p>
        </div>
        <div className="flex flex-col gap-3">
          { 
            connections.map((user, index)=>(
              <div key={index} className="max-w-xl flex flex-wrap gap-5 p-6 bg-white shadow rounded-md">
                <img className='rounded-full  size-12 mx-auto' src={user.profile_picture} alt="" />
                <div className="flex-1">
                  <p className='font-medium text-slate-700'>{user.full_name}</p>
                  <p className='text-slate-500'>@{user.username}</p>
                  <p className='text-sm text-gray-600'>{user.bio}</p>
                </div>
                <div className="flex gap-52 sm:flex-col sm:gap-2">
                  <button 
                    onClick={()=>navigate(`/messages/${user._id}`)}
                    className='size-10 flex items-center justify-center text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer'>
                    <MessageSquare className='w-4 h-4'/>
                  </button>
                  <button 
                    onClick={()=>navigate(`/profile/${user._id}`)}
                    className='size-10 flex items-center justify-center text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer'>
                    <Eye className='w-4 h-4'/>
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Messages