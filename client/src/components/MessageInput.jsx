import { useState, useRef, useEffect } from 'react';
import { Send, PlusCircle, Smile, X, Image as ImageIcon } from 'lucide-react';
import useSendMessage from '../hooks/useSendMessage';
import EmojiPicker from 'emoji-picker-react';
import { useSocketContext } from '../context/SocketContext';
import { useAuthContext } from '../context/AuthContext';
import useConversation from '../zustand/useConversation';

const MessageInput = () => {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    
    const { loading, sendMessage } = useSendMessage();
    const { socket } = useSocketContext();
    const { authUser } = useAuthContext();
    const { selectedConversation } = useConversation();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() && !imagePreview) return;
        
        await sendMessage({ message, image: imagePreview });
        
        setMessage('');
        setImagePreview(null);
        setShowEmojiPicker(false);
        
        // Stop typing immediately when sent
        if (socket && selectedConversation) {
            socket.emit('stopTyping', { senderId: authUser._id, receiverId: selectedConversation._id });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setImagePreview(reader.result);
        };
    };

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const onEmojiClick = (emojiObject) => {
        setMessage(prev => prev + emojiObject.emoji);
    };

    const handleTyping = (e) => {
        setMessage(e.target.value);

        if (!socket || !selectedConversation) return;

        socket.emit('typing', { senderId: authUser._id, receiverId: selectedConversation._id });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stopTyping', { senderId: authUser._id, receiverId: selectedConversation._id });
        }, 2000); // Stop typing after 2 seconds of inactivity
    };

    return (
        <div className='bg-chat-bg z-10 w-full relative'>
            {/* Image Preview Area */}
            {imagePreview && (
                <div className='px-6 pt-4 pb-2'>
                    <div className='relative inline-block'>
                        <img src={imagePreview} alt="Preview" className='h-24 rounded-lg object-cover border border-chat-border' />
                        <button 
                            onClick={removeImage}
                            className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600'
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            <form className='px-6 py-4 flex flex-col' onSubmit={handleSubmit}>
                <div className='w-full relative flex items-center gap-3'>
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                    />
                    <button 
                        type='button' 
                        onClick={() => fileInputRef.current?.click()}
                        className='p-2 rounded-full text-chat-textMuted hover:text-chat-textMain hover:bg-chat-hover transition-colors'
                        title="Attach image"
                    >
                        <ImageIcon size={22} />
                    </button>
                    
                    <div className='flex-1 relative bg-chat-inputBg rounded-3xl border border-chat-border/50 shadow-inner flex items-center pr-2'>
                        <div className='relative' ref={emojiPickerRef}>
                            <button 
                                type='button' 
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className='absolute left-3 top-1/2 -translate-y-1/2 text-chat-textMuted hover:text-chat-textMain transition-colors z-10'
                            >
                                <Smile size={20} />
                            </button>
                            
                            {showEmojiPicker && (
                                <div className='absolute bottom-12 left-0 z-50'>
                                    <EmojiPicker 
                                        onEmojiClick={onEmojiClick}
                                        theme="dark"
                                        lazyLoadEmojis={true}
                                    />
                                </div>
                            )}
                        </div>
                        
                        <input
                            type='text'
                            className='w-full bg-transparent text-[15px] py-3.5 pl-12 pr-4 text-chat-textMain focus:outline-none placeholder-chat-textMuted'
                            placeholder='Type a message...'
                            value={message}
                            onChange={handleTyping}
                        />
                        <button 
                            type='submit' 
                            className={`p-2 rounded-full flex items-center justify-center transition-colors ${
                                message.trim() || imagePreview ? 'bg-chat-accent text-white hover:bg-chat-accentHover' : 'bg-transparent text-chat-textMuted'
                            }`}
                            disabled={loading || (!message.trim() && !imagePreview)}
                        >
                            {loading ? <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div> : <Send size={18} className={(message.trim() || imagePreview) ? 'ml-0.5' : ''} />}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default MessageInput;
