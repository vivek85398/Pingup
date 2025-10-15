import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import MenuItems from './MenuItems'
import { CirclePlus, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { UserButton, useClerk } from '@clerk/clerk-react'
import { useSelector } from 'react-redux'

const Sidebar = ({SidebarOpen, setSidebarOpen}) => {
  const navigate = useNavigate();
  const user = useSelector((state)=>state.user.value);
  
  const { signOut } = useClerk();

  return (
    <div className={`${SidebarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'} 
      transition-all ease-in-out w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-0 bottom-0 z-30`
    }>
      <div className="w-full">
        <img onClick={()=> navigate('/')} className='w-24 ml-7 my-2 cursor-pointer' src={assets.logo} alt="" />
        <hr className='border-gray-300 mb-8 mt-3' />
        <MenuItems setSidebarOpen={setSidebarOpen}/>  
        <Link to='/create-post'
          className='flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 transition text-white cursor-pointer'
        >
          <CirclePlus className='w-5 h-5'/>
          Create post
        </Link>
      </div>

      <div className="w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between">
        <div className="flex gap-2 items-center cursor-pointer">
          <UserButton/>
          <div className="">
            <h1>{user.full_name}</h1>
            <p>@{user.username}</p>
          </div>
        </div>
        <LogOut onClick={signOut} className='w-4 text-gray-400 hover:text-gray-700 transition cursor-pointer'/>
      </div>
    </div>
  )
}

export default Sidebar
