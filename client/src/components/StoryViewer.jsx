import { BadgeCheck, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const StoryViewer = ({viewStory, setViewStory}) => {
  const [Progress, setProgress] = useState(0);

  useEffect(()=>{
    let timer, progressInterval;

    if(viewStory && viewStory.media_type !== 'video'){
      setProgress(0);

      const duration = 10000;
      const setTime = 100;
      let elapsed = 0;

      progressInterval =  setInterval(() => {
        elapsed += setTime;
        setProgress((elapsed / duration) * 100);
      }, setTime);

      timer = setTimeout(()=>{
        setViewStory(null);
      }, duration);
    }

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    }

  }, [viewStory, setViewStory]);

  if(!viewStory) return null;

  const handleClose = async () => {
    setViewStory(null);
  }

  const renderContent = () => {
    switch (viewStory.media_type) {
      case 'image': 
        return (
          <img className='max-w-full max-h-screen object-contain' src={viewStory.media_url} alt="" />
        );

      case 'video' :
        return (
          <video controls autoPlay
            onEnded={()=>setViewStory(null)} 
            className='max-w-full max-h-screen object-contain' 
            src={viewStory.media_url} alt="" 
          />
        );
        
      case 'text' :
        return (
          <div className="w-full h-full flex items-center justify-center p-8 text-white text-2xl text-center">
            {viewStory.content}
          </div>
        ) 
      
      default : null
    } 
  } 

  return (
    <div style={{backgroundColor: viewStory.media_type === 'text' ? viewStory.background_color: '#000000'}}
      className='fixed inset-0 h-screen bg-black opacity-95 z-50 flex items-center justify-center'
    >
      <div className="absolute h-1 top-0 left-0 w-full bg-gray-700">
        <div 
          style={{width: `${Progress}%`}}
          className="h-full bg-white transition-all duration-100"
        >

        </div>
      </div>

      <div className="absolute top-4 left-4 flex items-center space-x-3 p-2 px-4 sm:p-4 sm:px-8 backdrop:blur-2xl rounded bg-black/50">
        <img className='size-7 sm:size-8 rounded-full object-cover border border-white' src={viewStory.user?.profile_picture} alt="" />
        <div className="text-white font-medium flex items-center gap-1.5">
          <span>{viewStory.user?.full_name}</span>
          <BadgeCheck size={18}/>
        </div>
      </div>

      <button onClick={handleClose} className='absolute top-4 right-4 text-white text-3xl font-bold focus:outline-none'>
        <X className='w-8 h-8 hover:scale-110 transition cursor-pointer'/>
      </button>

      <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  )
}

export default StoryViewer
