import React, { useState, useEffect } from 'react'
import { BadgeCheck, Heart, MessageCircle, Share2 } from 'lucide-react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PostCard = ({ post }) => {
  const [Likes, setLikes] = useState(post.like_count || []);
  const currentUser = useSelector((state) => state.user.value);
  const postWithHashtags = post.content?.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>') || '';
  const navigate = useNavigate();
  const userId = currentUser?._id;

  useEffect(() => {
    if (post) setLikes(post.like_count || []);
  }, [post]);

  const handleLike = async () => {
    if (!userId) return;

    try {
      const { data } = await api.post('/api/post/like', { postId: post._id, userId });
      if (data.success) {
        toast.success(data.message);
        setLikes((prev) => {
          if (prev.includes(userId)) {
            return prev.filter((id) => id !== userId);
          } else {
            return [...prev, userId];
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl">
      <div
        onClick={() => navigate('/profile/' + post.user._id)}
        className="inline-flex items-center gap-3 cursor-pointer"
      >
        <img className="w-10 h-10 rounded-full shadow" src={post.user.profile_picture} alt="" />
        <div>
          <div className="flex items-center space-x-1">
            <span>{post.user.full_name}</span>
            <BadgeCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div>@{post.user.username} • {moment(post.createdAt).fromNow()}</div>
        </div>
      </div>

      {post.content && (
        <div
          className="text-gray-800 text-sm whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: postWithHashtags }}
        />
      )}

      <div className="grid grid-cols-2 gap-2">
        {post.image_urls.map((img, index) => (
          <img
            key={index}
            src={img}
            className={`w-full h-48 object-cover rounded-lg ${
              post.image_urls.length === 1 && 'col-span-2 h-auto sm:h-[75vh]'
            }`}
            alt=""
          />
        ))}
      </div>

      <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300">
        <div className="flex items-center gap-1">
          <Heart
            onClick={handleLike}
            className={`w-4 h-4 cursor-pointer ${Array.isArray(Likes) && Likes.includes(userId) ? 'text-red-500 fill-red-500' : ''
              }`}
          />
          <span>{Likes?.length || 0}</span>
        </div>

        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-1">
          <Share2 className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default PostCard;