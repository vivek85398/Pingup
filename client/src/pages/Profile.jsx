import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loading from '../components/Loading'
import UserProfileInfo from '../components/UserProfileInfo'
import PostCard from '../components/PostCard'
import moment from 'moment'
import ProfileModel from '../components/ProfileModel'
import api from '../api/axios'
import { useUser } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

const Profile = () => {
  const {profileId} = useParams();
  const [User, setUser] = useState(null);
  const [Posts, setPosts] = useState([]);
  const [ActiveTab, setActiveTab] = useState('posts');
  const [ShowEdit, setShowEdit] = useState(false);

  const { user } = useUser();
  const currentUser = useSelector((state)=> state.user.value);

  const fetchUser = async (profileId) => {
    try {
      const { data } = await api.post('/api/user/profiles', {profileId, userId: user.id});

      if(data.success){
        setUser(data.profile);
        setPosts(data.posts);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(data.message);
    }
  }

  useEffect(()=>{
    if(profileId){
      fetchUser(profileId);
    }else {
      fetchUser(currentUser._id);
    }
  }, [profileId, currentUser]);

  return User ? (
    <div className='relative h-full overflow-y-scroll bg-gray-50 p-6'>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
            {User.cover_photo && <img className='w-full h-full object-cover' src={User.cover_photo} alt=''/>}
          </div>
          <UserProfileInfo user={User} posts={Posts} profileId={profileId} setShowEdit={setShowEdit}/>
        </div>
        <div className="mt-6">
        <div className="bg-white rounded-xl shadow p-1 flex max-w-md mx-auto">
          {["posts", "media", "Likes"].map((tab)=>(
            <button key={tab}
              onClick={()=>setActiveTab(tab)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${ActiveTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        {
          ActiveTab === 'posts' && (
            <div className="mt-6 flex flex-col items-center gap-6">
              {Posts.reverse().map((post)=> <PostCard key={post._id} post={post} />)}
            </div>
          )
        }
        {
          ActiveTab === 'media' && (
            <div className="flex flex-wrap mt-6 max-w-6xl">
              {
                Posts.filter((post)=>post.image_urls.length > 0).map((post)=>(
                  <>
                    {
                      post.image_urls.map((image, index)=>(
                        <Link target='_blank' to={image} key={index} className='relative group'>
                          <img src={image} key={index} className='w-64 aspect-video object-cover' alt="" />
                          <p className='absolute bottom-0 right-0 text-xs p-1 px-3 backdrop-blur text-white opacity-0 group-hover:opacity-100 transition duration-300'>
                            Posted {moment(post.createdAt).fromNow()}
                          </p>
                        </Link>
                      ))
                    }
                  </>
                ))
              }
            </div>
          )
        }
       </div>
      </div>
      {ShowEdit && <ProfileModel setShowEdit={setShowEdit}/>}
    </div>
  ) : (<Loading/>)
}

export default Profile
