import { ArrowLeft, Sparkle, TextIcon, Upload } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'

const StoryModel = ({setShowModel, fetchStories}) => {
  const bgColors = ["#4f46e5", "#7c3aed", "#db2777", "#e11d48", "#ca8a04", "#0d9488"];
  const [Mode, setMode] = useState('text');
  const [Background, setBackground] = useState(bgColors[0]);
  const [Text, setText] = useState("");
  const [Media, setMedia] = useState(null);
  const [PreviewUrl, setPreviewUrl] = useState(null);
    
  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if(file) {
        setMedia(file);
        setPreviewUrl(URL.createObjectURL(file));
    }
  }

  const handleCreateStory = async () => {

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
              onChange={(e)=>{handleMediaUpload(e); setMode('media')}}
              type="file" accept='image/*, video/*' className='hidden' 
            />
            <Upload size={18}/> Photo/Video
          </label>
        </div>
        <button 
          onClick={()=> toast.promise(handleCreateStory(), {
            loading: 'Saving...',
            success: <p>Story Added</p>,
            error: e => <p>{e.message}</p>
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
