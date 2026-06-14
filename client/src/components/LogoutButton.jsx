import { useState } from 'react';
import axios from 'axios';
import { useAuthContext } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import ProfileModal from './ProfileModal';

const LogoutButton = () => {
    const { authUser, setAuthUser } = useAuthContext();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
            localStorage.removeItem('chat-user');
            setAuthUser(null);
        } catch (error) {
            console.error('Error logging out', error);
        }
    };

    return (
        <>
            <div className='mt-auto flex items-center justify-between'>
                <div 
                    className='flex items-center gap-3 cursor-pointer hover:bg-chat-hover/50 p-2 rounded-xl transition-colors'
                    onClick={() => setIsProfileOpen(true)}
                    title="Profile Settings"
                >
                    <div className='w-10 h-10 rounded-full bg-chat-bg flex items-center justify-center overflow-hidden shadow-sm'>
                        <img src={authUser.profilePic} alt="avatar" className='w-full h-full object-cover' />
                    </div>
                    <div className='flex flex-col'>
                        <span className='text-chat-textMain text-[15px] font-semibold'>{authUser.username}</span>
                        <span className='text-chat-accent text-[12px] font-medium'>Settings</span>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className='w-10 h-10 rounded-full bg-chat-bg hover:bg-red-500/10 flex items-center justify-center text-chat-textMuted hover:text-red-500 transition-colors'
                    title="Log out"
                >
                    <LogOut size={18} />
                </button>
            </div>
            
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </>
    );
};

export default LogoutButton;
