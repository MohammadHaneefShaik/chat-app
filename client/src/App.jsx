import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

function App() {
  const { authUser } = useAuthContext();

  return (
    <div className='h-[100dvh] w-full bg-chat-bg text-chat-textMain'>
      <Routes>
        <Route path='/' element={authUser ? <Home /> : <Navigate to={'/login'} />} />
        <Route path='/login' element={authUser ? <Navigate to='/' /> : <Login />} />
        <Route path='/register' element={authUser ? <Navigate to='/' /> : <Register />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
