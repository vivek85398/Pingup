import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import Loading from '../components/Loading';
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard';
import RecentMessage from '../components/RecentMessage';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Feed = () => {
  const [Feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state)=>state.user.value);
  const userId = user?._id;

  const fetchFeeds = async () => {
    if(!userId) return;

    try {
      setLoading(true);
      const { data } = await api.get('/api/post/feed', {
        params: {userId}
      });
      if(data.success){
        setFeeds(data.posts);
      }
      else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  }

  useEffect(()=>{
    fetchFeeds();
  }, []);

  return !loading ? (
    <div className='h-full overflow-y-auto no-scrollbar py-10 xl:pr-5 flex justify-center xl:gap-8'>
      <div className="">
        <StoriesBar/>
        <div className="p-4 space-y-6">
          {
            Feeds.map((post)=>(
              <PostCard key={post._id} post={post}/>
            ))
          }
        </div>
      </div>

      <div className="max-xl:hidden sticky top-0">
        <div className="max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow">
          <h3 className='text-slate-800 font-semibold'>Sponsored</h3>
          <img className='w-75 h-52 rounded-md' src={assets.sponsored_img} alt="" />
          <p className='text-slate-600'>Email marketing</p>
          <p className='text-slate-400'>Supercharge your marketing with a powerfull, easy-to-use plateform build for results.</p>
        </div>
        <div className="">
          <RecentMessage/>
        </div>
      </div>
    </div>
  ) : <Loading/>
}

export default Feed
