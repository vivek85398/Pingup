import React, { useEffect, useRef } from 'react'
import { Routes, Route, useLocation} from 'react-router-dom'
import Login from './pages/Login'
import ChatBox from './pages/ChatBox'
import Messages from './pages/Messages'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import Feed from './pages/Feed'
import CreatePost from './pages/CreatePost'
import { useUser } from '@clerk/clerk-react'
import Layout from './pages/Layout'
import toast, { Toaster } from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { fetchUser } from './features/users/userSlice'
import { fetchConnections } from './features/connections/connectionSlice'
import { addMessages } from './features/messages/messageSlice'
import Notification from './components/Notification'

const App = () => {
  const { user } = useUser();
  const dispatch = useDispatch();
  const { pathname} = useLocation();

  const pathNameRef = useRef(pathname);

  useEffect(()=>{
    pathNameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (user) {
      const eventSource = new EventSource(import.meta.env.VITE_BASEURL + '/api/message/' + user?.id);

      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message && message.from_user_id) {
            if(pathNameRef.current.startsWith(`/messages/${message.from_user_id?._id}`)) {
              dispatch(addMessages(message));
            }
            else {
              toast.custom((t)=>(
                <Notification t={t} message={message}/>
              ), {position: 'bottom-right'});
            }
          }
        } catch (error) {
          console.warn('Non-JSON message received:', event.data);
        }
      };

      eventSource.onerror = () => {
        console.error('SSE connection error. Attempting to reconnect...');
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [user, dispatch]);  
  
  useEffect(() => {
    if(user) {
      dispatch(fetchUser(user?.id));
      dispatch(fetchConnections(user?.id));
    }
  }, [user]);

  return (
    <>
      <Toaster/>
      <Routes>
        <Route path='/' element={ !user ? <Login/> : <Layout/>}>
          <Route index element={<Feed/>}/>
          <Route path='messages' element={<Messages/>}/>
          <Route path='messages/:userId' element={<ChatBox/>}/>
          <Route path='connections' element={<Connections/>}/>
          <Route path='discover' element={<Discover/>}/>
          <Route path='profile' element={<Profile/>}/>
          <Route path='profile/:profileId' element={<Profile/>}/>
          <Route path='create-post' element={<CreatePost/>}/>
        </Route>
      </Routes>
    </>
  )
}

export default App