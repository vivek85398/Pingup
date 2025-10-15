import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import moment from 'moment'
import StoryModel from './StoryModel'
import StoryViewer from './StoryViewer'
import { useSelector } from 'react-redux'
import api from '../api/axios'
import toast from 'react-hot-toast'

const StoriesBar = () => {
  const [Stories, setStories] = useState([]);
  const [ShowModel, setShowModel] = useState(false);
  const [viewStory, setViewStory] = useState(null);
  const user = useSelector((state)=>state.user.value);
  const userId = user?._id;

  const fetchStories = async () => {
    try {
      const { data } = await api.get('/api/story/get', {
        params: {userId}
      });
      if(data.success){
        setStories(data.stories);
      }
      else{
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(()=>{
    fetchStories();
  }, []);

  return (
    <div className='w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl overflow-x-auto no-scrollbar px-4'>
      <div className="flex gap-4 pb-5">
        <div onClick={()=>setShowModel(true)} className="rounded-lg shadow-sm min-w-32 max-w-32 max-h-40 aspect-[3/4] cursor-pointer border-2 border-dashed border-indigo-300 bg-gradient-to-b from-indigo-50 to-white hover:shadow-xl transition-all duration-200">
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="size-10 bg-indigo-500 rounded-full flex items-center justify-center mb-3">
              <Plus className='w-5 h-5 text-white'/>
            </div>
            <p className='text-sm font-medium text-slate-700 text-center'>Create Story</p>
          </div>
        </div>
        {
          Stories.map((story, index)=>(
            <div 
              key={index} 
              onClick={()=>setViewStory(story)}
              className={`relative rounded-lg shadow min-w-32 max-h-40 cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-b from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95`}
            >
              <img className='absolute size-8 top-3 left-3 z-10 rounded-full ring ring-gray-100 shadow' src={story.user.profile_picture} alt="" />
              <p className='absolute top-16 left-3 text-white/60 text-sm truncate max-w-24'>{story.content}</p>
              <p className='text-white absolute bottom-1 right-2 z-10 text-xs'>{moment(story.createdAt).fromNow()}</p>
              {
                story.media_type !== 'text' && (
                  <div className="absolute inset-0 z-10 rounded-lg bg-black overflow-hidden">
                    {
                      story.media_type === 'image' 
                      ? <img className='h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80' src={story.media_url} alt="" />
                      : <video className='h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80' src={story.media_url}/>
                    }
                  </div>
                )
              }
            </div>
          ))
        }
      </div>
      {
        ShowModel && <StoryModel fetchStories={fetchStories} setShowModel={setShowModel}/>
      }

      {
        viewStory && <StoryViewer viewStory={viewStory} setViewStory={setViewStory}/>
      }
    </div>
  )
}

export default StoriesBar
