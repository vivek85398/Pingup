import React, { useState, useEffect } from 'react'
import { Users, UserPlus, UserCheck, UserRoundPen, MessageSquare, } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useUser } from '@clerk/clerk-react'
import { fetchConnections } from '../features/connections/connectionSlice'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Connections = () => {
  const [CurrentTab, setCurrentTab] = useState('Followers');
  const { connections, pendingConnections, followers, following } = useSelector((state)=>state.connections); 
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useUser();
  
  const dataArray = [
    {lable: 'Followers', value: followers, icon: Users},
    {lable: 'Following', value: following, icon: UserCheck},
    {lable: 'Pending', value: pendingConnections, icon: UserRoundPen},
    {lable: 'Connections', value: connections, icon: UserPlus} 
  ];

  const handleUnfollow = async (id) => {
    try {
      const { data } = await api.post('/api/user/unfollow', {id: id, userId: user?.id});
      if(data.success){
        toast.success(data.message);
        dispatch(fetchConnections(user?._id));
      }
      else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  const acceptConnection = async (id) => {
    try {
      const { data } = await api.post('/api/user/accept', {id: id, userId: user?.id});
      if(data.success){
        toast.success(data.message);
        dispatch(fetchConnections(user?._id));
      }
      else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }
  
  useEffect(()=>{
    if(!user) return;
    const userId = user?.id;
    dispatch(fetchConnections(userId));
  }, [user, handleUnfollow, acceptConnection]);

  return (
    <div className='h-screen overflow-y-auto no-scrollbar bg-slate-50'>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Connections</h1>
          <p>Manage your network and discover new connections</p>
        </div>
        <div className="mb-8 flex flex-wrap sm:gap-6 gap-1">
          {
            dataArray.map((item, index)=>(
              <div key={index}
                className="flex flex-col items-center justify-center gap-1 border h-20 w-40 border-gray-200 bg-white shadow rounded-md"
              >
                <b>{item.value.length}</b>
                <p>{item.lable}</p>
              </div>
            ))
          }
        </div>

        <div className="inline-flex flex-wrap items-center border border-gray-200 rounded-md p-1 bg-white shadow-sm">
          {
            dataArray.map((tab)=>(
              <button key={tab.lable} 
                onClick={()=>setCurrentTab(tab.lable)}
                className={`flex items-center px-3 py-1 text-sm rounded-md transition-colors ${CurrentTab === tab.lable ? 'bg-white font-medium text-black' : 'text-gray-500 hover:text-black'}`}
              >
                <tab.icon className='w-4 h-4'/>
                <span className='ml-1'>{tab.lable}</span>
                {
                  tab.count !== undefined && (
                    <span className='ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full'>{tab.count}</span>
                  )
                }
              </button>
            ))
          }
        </div>

        <div className="flex flex-wrap gap-6 mt-6">
          {
            dataArray.find((item)=>item.lable === CurrentTab).value.map((user)=>(
              <div key={user._id} className="w-full max-w-88 flex gap-5 p-6 bg-white shadow rounded-md">
                <img className='rounded-full w-12 h-12 shadow-md mx-auto' src={user.profile_picture} alt="" />
                <div className="flex-1">
                  <p className='font-medium text-slate-700'>{user.full_name}</p>
                  <p className='text-slate-500'>@{user.username}</p>
                  <p className='text-sm text-slate-600'>{user.bio.slice(0, 30)}...</p>
                  <div className="flex max-sm:flex-col gap-2 mt-4">
                    {
                      <button onClick={()=>navigate(`/profile/${user._id}`)}
                        className='w-full p-2 text-sm rounded bg-gradient-to-r from-indigo-500 to-purple-600 active:scale-95 transition text-white cursor-pointer'
                      >
                        View Profile
                      </button>
                    }
                    {
                      CurrentTab === 'Following' && (
                        <button onClick={()=>handleUnfollow(user?._id)}
                          className='w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer'
                        >
                          Unfollow
                        </button>
                      )
                    }
                    {
                      CurrentTab === 'Pending' && (
                        <button onClick={()=>acceptConnection(user?._id)}
                          className='w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer'
                        >
                          Accept
                        </button>
                      )
                    }
                    {
                      CurrentTab === 'Connections' && (
                        <button onClick={()=>navigate(`/messages/${user._id}`)}
                          className='w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer'
                        >
                          <span className='flex items-center gap-2 justify-center'>
                            <MessageSquare className='w-4 h-4'/>
                            Message
                          </span>
                        </button>
                      )
                    }
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Connections
