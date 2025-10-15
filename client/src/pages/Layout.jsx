import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import {Menu, X} from 'lucide-react'
import Loading from '../components/Loading'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

const Layout = () => {
  const [SidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector((state)=>state.user.value);

  useEffect(()=>{
    if(!user){
      toast("Please reload the page", {icon: '⚠️'});
    }
  }, []);
  
  return user ? (
    <div className='w-full h-screen flex'>
      <Sidebar SidebarOpen={SidebarOpen} setSidebarOpen={setSidebarOpen}/>
      <div className="flex-1 bg-slate-50">
        <Outlet/>
      </div>
      {
        SidebarOpen 
        ? <X onClick={()=>setSidebarOpen(false)} className='absolute top-3 right-3 p-2 z-10 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden'/>
        : <Menu onClick={()=>setSidebarOpen(true)} className='absolute top-3 right-3 p-2 z-10 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden'/>
      }
    </div>
  ) : (
      <Loading/>
  )
}

export default Layout
