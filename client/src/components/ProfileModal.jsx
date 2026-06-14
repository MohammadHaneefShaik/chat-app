import { useState, useRef } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { Camera, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProfileModal = ({ isOpen, onClose }) => {
    const { authUser, setAuthUser } = useAuthContext();
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setImagePreview(reader.result);
        };
    };

    const handleUpdateProfile = async () => {
        if (!imagePreview) return toast.error('Please select an image first');
        
        setLoading(true);
        try {
            const res = await axios.put('/api/users/update-profile', { profilePic: imagePreview });
            // Update local storage and context
            const updatedUser = { ...authUser, profilePic: res.data.profilePic };
            localStorage.setItem('chat-user', JSON.stringify(updatedUser));
            setAuthUser(updatedUser);
            
            toast.success('Profile updated successfully');
            setImagePreview(null);
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm'>
            <div className='bg-chat-panel w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative border border-chat-border/50'>
                <button 
                    onClick={onClose}
                    className='absolute top-4 right-4 text-chat-textMuted hover:text-white transition-colors'
                >
                    <X size={24} />
                </button>
                
                <div className='p-8 flex flex-col items-center'>
                    <h2 className='text-xl font-bold text-chat-textMain mb-6'>Profile Settings</h2>
                    
                    <div className='relative mb-6 group'>
                        <div className='w-32 h-32 rounded-full overflow-hidden border-4 border-chat-bg shadow-lg'>
                            <img 
                                src={imagePreview || authUser.profilePic} 
                                alt="Profile" 
                                className='w-full h-full object-cover'
                            />
                        </div>
                        
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className='absolute bottom-0 right-0 p-3 bg-chat-accent rounded-full text-white shadow-lg hover:bg-chat-accentHover transition-colors'
                            title='Change Profile Picture'
                        >
                            <Camera size={20} />
                        </button>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleImageChange} 
                        />
                    </div>
                    
                    <div className='w-full text-center mb-8'>
                        <p className='text-lg font-bold text-chat-textMain'>{authUser.username}</p>
                        <p className='text-sm text-chat-textMuted'>{authUser.email}</p>
                    </div>

                    <button 
                        onClick={handleUpdateProfile}
                        disabled={loading || !imagePreview}
                        className={`w-full py-3 rounded-full font-semibold transition-colors flex items-center justify-center ${
                            imagePreview && !loading
                                ? 'bg-chat-accent text-white hover:bg-chat-accentHover' 
                                : 'bg-chat-inputBg text-chat-textMuted'
                        }`}
                    >
                        {loading ? <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div> : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
