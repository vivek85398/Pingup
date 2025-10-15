import React, { useEffect, useState } from 'react'
import { Search } from 'lucide-react';
import UserCard from '../components/UserCard';
import Loading from '../components/Loading'
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../features/users/userSlice' 

const Discover = () => {
  const dispatch = useDispatch();
  const [Input, setInput] = useState('');
  const [Users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state)=>state.user.value);
  const userId = user?._id;

  const handleSearch = async (e) => {
    if(e.key === 'Enter') {
      try {
        setUsers([]);
        setLoading(true);
        const { data } = await api.post('/api/user/discover', {Input, userId});
        data.success ? setUsers(data.users) : toast.error(data.message);
        setLoading(false);
        setInput('');
      } catch (error) {
        setLoading(false);
        toast.error(error.message);
      }
      setLoading(false);
    }
  }

  useEffect(()=>{
    dispatch(fetchUser(user?._id));
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Discover People</h1>
          <p>Connect with amazing people and grow your network</p>
        </div>
        <div className="mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80">
          <div className="p-6">
            <div className="relative">
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5'/>
              <input onKeyUp={handleSearch}
                value={Input}
                onChange={(e)=>setInput(e.target.value)}
                type="text" 
                placeholder='Search people by name, username, bio, or location...'
                className='pl-10 sm:pl-12 py-2 w-full border border-gray-300 rounded-md max-sm:text-sm'
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          {Users.map((user)=>(
            <UserCard user={user} key={user._id} />
          ))}
        </div>
        {
          loading && (<Loading height='60vh' />)
        }
      </div>
    </div>
  )
}

export default Discover
