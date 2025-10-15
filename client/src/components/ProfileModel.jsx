import React, { useState } from 'react'
import { Pencil } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../features/users/userSlice';
import toast from 'react-hot-toast';

const ProfileModel = ({setShowEdit}) => {
  const user = useSelector((state)=>state.user.value);
  const dispatch = useDispatch();
  
  const [EditForm, setEditForm] = useState({
    username: user.username,
    bio: user.bio,
    location: user.location,
    profile_picture: null,
    cover_photo: null,
    full_name: user.full_name,
    userId: user._id
  });
  
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      const { username, bio, location, profile_picture, cover_photo, full_name, userId } = EditForm;
      const userData = { username, bio, location, full_name, userId };
      
      if(userData){
        formData.append('userData', JSON.stringify(userData));
      }

      if (profile_picture) {
        formData.append('profile', profile_picture);
      }
      if (cover_photo) {
        formData.append('cover', cover_photo);
      }
      
      await dispatch(updateUser(formData));
      setShowEdit(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className='fixed top-0 bottom-0 left-0 right-0 z-50 h-screen overflow-y-scroll bg-black/50'>
      <div className="max-w-2xl sm:py-6 mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className='text-2xl font-bold text-gray-900 mb-6'>Edit Profile</h1>
          <form className='space-y-4' 
            onSubmit={e=> toast.promise(
              handleSaveProfile(e), {loading: 'Saving...'}
            )}
          >
            <div className="flex flex-col items-start gap-3">
              <label htmlFor="profile_picture" className='block text-sm font-medium text-gray-700 mb-1'>
                Profile Picture
                <input 
                  type="file" hidden accept='image/*' id='profile_picture'
                  className='w-full p-3 border border-gray-200 rounded-lg'
                  onChange={(e)=>setEditForm({...EditForm, profile_picture: e.target.files[0]})} 
                />
                <div className="group/profile relative cursor-pointer">
                  <img className='w-24 h-24 rounded-full object-cover mt-2 bg-black/15'
                    src={EditForm.profile_picture ? URL.createObjectURL(EditForm.profile_picture) : user.profile_picture} alt="" 
                  />
                  <div className="absolute hidden group-hover/profile:flex top-0 left-0 right-0 bottom-0 bg-black/20 rounded-full items-center justify-center">
                    <Pencil className='w-5 h-5 text-white'/>
                  </div>
                </div>
              </label>
            </div>

            <div className="flex flex-col items-start gap-3">
              <label htmlFor="cover_photo" className='block text-sm font-medium text-gray-700 mb-1'>
                Cover Photo
                <input 
                  type="file" hidden accept='image/*' id='cover_photo'
                  className='w-full p-3 border border-gray-200 rounded-lg'
                  onChange={(e)=>setEditForm({...EditForm, cover_photo: e.target.files[0]})} 
                />
                <div className="group/cover relative cursor-pointer">
                  <img 
                    className='w-80 h-40 rounded-lg bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 object-cover mt-2'
                    src={EditForm.cover_photo ? URL.createObjectURL(EditForm.cover_photo) : user.cover_photo || null} alt="" 
                  />
                  <div className="absolute hidden group-hover/cover:flex top-0 left-0 right-0 bottom-0 bg-black/20 rounded-lg items-center justify-center">
                    <Pencil className='w-5 h-5 text-white'/>
                  </div>
                </div>
              </label>
            </div>

            <div className="">
              <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>
                Name
              </label>
              <input type="text" value={EditForm.full_name}
                className='w-full p-3 border border-gray-200 rounded-lg'
                placeholder='Please enter your full name'
                onChange={(e)=>setEditForm({...EditForm, full_name: e.target.value})}
              />
            </div>

            <div className="">
              <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>
                Username
              </label>
              <input type="text" value={EditForm.username}
                className='w-full p-3 border border-gray-200 rounded-lg'
                placeholder='Please enter a username'
                onChange={(e)=>setEditForm({...EditForm, username: e.target.value})}
              />
            </div>

            <div className="">
              <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>
                Bio
              </label>
              <textarea rows={3} value={EditForm.bio}
                className='w-full p-3 border border-gray-200 rounded-lg'
                placeholder='Please enter your short bio'
                onChange={(e)=>setEditForm({...EditForm, bio: e.target.value})}
              />
            </div>

            <div className="">
              <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>
                Location
              </label>
              <input type="text" value={EditForm.location}
                className='w-full p-3 border border-gray-200 rounded-lg'
                placeholder='Please enter your location'
                onChange={(e)=>setEditForm({...EditForm, location: e.target.value})}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button type='button' onClick={()=>setShowEdit(false)}
                className='cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button type='submit'
                className='px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition cursor-pointer'
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfileModel
