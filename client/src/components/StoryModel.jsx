import { ArrowLeft, Sparkle, TextIcon, Upload } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import api from '../api/axios'
import { useSelector } from 'react-redux'

const StoryModel = ({setShowModel, fetchStories}) => {
  const bgColors = ["#4f46e5", "#7c3aed", "#db2777", "#e11d48", "#ca8a04", "#0d9488"];
  const [Mode, setMode] = useState('text');
  const [Background, setBackground] = useState(bgColors[0]);
  const [Text, setText] = useState("");
  const [Media, setMedia] = useState(null);
  const [PreviewUrl, setPreviewUrl] = useState(null);
  const user = useSelector((state)=>state.user.value);
  const userId = user?._id;

  const MAX_VIDEO_DURATION = 60;
  const MAX_VIDEO_SIZE_MB = 50;
    
  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image')) {
      setMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
      setText('');
      setMode('media');
      return;
    }
    
    if (file.type.startsWith('video')) {
      if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        toast.error(`Video file size can't exceed ${MAX_VIDEO_SIZE_MB} MB.`);
        setMedia(null);
        setPreviewUrl(null);
        return;
      }

      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > MAX_VIDEO_DURATION + 1) {
          toast.error("Video duration can't exceed 1 minute.");
          setMedia(null);
          setPreviewUrl(null);
        } else {
          setMedia(file);
          setPreviewUrl(URL.createObjectURL(file));
          setText('');
          setMode('media');
        }
      };

      video.src = URL.createObjectURL(file);
    } else {
      toast.error("Unsupported file type.");
    }
  };

  const handleCreateStory = async () => {
    const media_type = Mode === 'media' ? Media?.type.startsWith('image') ? 'image' : 'video' : 'text';
    if(media_type === 'text' && !Text){
      throw new Error('Please enter some text');
    }
    let formData = new FormData();
    formData.append('content', Text);
    formData.append('media_type', media_type);
    formData.append('media', Media);
    formData.append('background_color', Background);
    formData.append('userId', userId);

    try {
      const { data } = await api.post('/api/story/create', formData);
      if(data.success){
        setShowModel(false);
        toast.success('Story created successfully');
        fetchStories();
      }
      else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className='fixed inset-0 p-5 z-50 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center'>
      <div className="w-full max-w-md">
        <div className="text-center mb-4 flex items-center justify-between">
          <button onClick={()=>setShowModel(false)} className="text-white p-2 cursor-pointer">
            <ArrowLeft/>
          </button>
          <h2 className='text-lg font-semibold'>Create Story</h2>
          <span className='w-10'></span>
        </div>

        <div className="rounded-lg h-96 flex items-center justify-center relative" style={{backgroundColor: Background}}>
          {
            Mode === 'text' && (
              <textarea 
                value={Text}
                onChange={(e)=> setText(e.target.value)}
                className='bg-transparent text-white w-full h-full p-6 text-lg resize-none focus:outline-none' 
                placeholder="What's on your mind?" name="" id=""
              />
            )
          }

          {
            Mode === 'media' && PreviewUrl && (
              Media?.type.startsWith('image') 
                ? (<img src={PreviewUrl} alt="" />)
                : (<video src={PreviewUrl} className='object-contain max-h-full'/>)
            )
          }
        </div>

        <div className="flex mt-4 gap-2">
          {
            bgColors.map((color)=>(
              <button key={color}
                onClick={()=>setBackground(color)}
                style={{backgroundColor: color}}
                className='w-6 h-6 rounded-full ring cursor-pointer' 
              />
            ))        
          }
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={()=>{setMode('text'); setMedia(null); setPreviewUrl(null)}}
            className={`${Mode === 'text' ? 'bg-white text-black' : 'bg-zinc-800'} flex-1 flex items-center justify-center gap-2 p-2 rounded`}
          >
            <TextIcon size={18}/> Text
          </button>
          <label className={`${Mode === 'media' ? 'bg-white text-black' : 'bg-zinc-800'} flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer`}>
            <input 
              onChange={handleMediaUpload} 
              type="file" accept='image/*, video/*' className='hidden' 
            />
            <Upload size={18}/> Photo/Video
          </label>
        </div>
        <button 
          onClick={()=> toast.promise(handleCreateStory(), {
            loading: 'Saving...',
          })}
          className='flex items-center justify-center gap-2 text-white py-3 mt-4 w-full rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition cursor-pointer'
        >
          <Sparkle size={18}/> Create Story
        </button>
      </div>
    </div>
  )
}

export default StoryModel