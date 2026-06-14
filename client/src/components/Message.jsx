import { useAuthContext } from '../context/AuthContext';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import useConversation from '../zustand/useConversation';

const Message = ({ message }) => {
    const { authUser } = useAuthContext();
    const { removeMessage } = useConversation();
    const [isHovered, setIsHovered] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fromMe = message.senderId === authUser._id;
    const formattedTime = format(new Date(message.createdAt), 'HH:mm');
    const chatClassName = fromMe ? 'justify-end' : 'justify-start';
    
    // Sleek dark theme colors
    const bubbleBgColor = fromMe 
        ? 'bg-chat-bubbleSent' 
        : 'bg-chat-bubbleRecv';
        
    const textColor = 'text-chat-textMain';
        
    const borderRadius = fromMe 
        ? 'rounded-2xl rounded-tr-sm' 
        : 'rounded-2xl rounded-tl-sm';

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/messages/${message._id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                removeMessage(message._id);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div 
            className={`flex w-full mt-2 mb-3 ${chatClassName} group`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {fromMe && isHovered && !isDeleting && (
                <button 
                    onClick={handleDelete}
                    className='mr-2 text-chat-textMuted hover:text-red-500 transition-colors flex items-center justify-center'
                    title="Delete message"
                >
                    <Trash2 size={16} />
                </button>
            )}
            
            <div className={`relative px-4 py-2.5 shadow-sm ${bubbleBgColor} ${textColor} text-[15px] max-w-[75%] md:max-w-[65%] ${borderRadius} ${isDeleting ? 'opacity-50' : ''}`}>
                {message.image && (
                    <img src={message.image} alt='attachment' className='max-w-full rounded-xl mb-2 mt-1 cursor-pointer' />
                )}
                
                <span className="break-words leading-snug flex flex-col">
                    {message.text}
                    
                    {/* Timestamp and ticks embedded inside bubble at bottom right */}
                    <div className={`text-[11px] flex justify-end items-center gap-1 mt-1 -mb-1 float-right ${fromMe ? 'text-chat-textMuted' : 'text-chat-textMuted'}`}>
                        <span className="opacity-70">{formattedTime}</span>
                        {fromMe && (
                            <svg viewBox="0 0 16 15" width="14" height="13" className={`fill-current ${message.isRead ? 'text-blue-500' : 'text-gray-400 opacity-70'}`}>
                                <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.32.32 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                            </svg>
                        )}
                    </div>
                </span>
            </div>
        </div>
    );
};

export default Message;
