import { useEffect, useState } from 'react';
import useConversation from '../zustand/useConversation';
import MessageInput from './MessageInput';
import Messages from './Messages';
import { useSocketContext } from '../context/SocketContext';
import { ArrowLeft } from 'lucide-react';

const MessageContainer = () => {
    const { selectedConversation, setSelectedConversation } = useConversation();
    const { onlineUsers, socket } = useSocketContext();
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        return () => setSelectedConversation(null);
    }, [setSelectedConversation]);

    useEffect(() => {
        if (!socket) return;

        const handleTyping = (senderId) => {
            if (selectedConversation && senderId === selectedConversation._id) {
                setIsTyping(true);
            }
        };

        const handleStopTyping = (senderId) => {
            if (selectedConversation && senderId === selectedConversation._id) {
                setIsTyping(false);
            }
        };

        const handleMessagesRead = ({ receiverId }) => {
            if (selectedConversation && receiverId === selectedConversation._id) {
                useConversation.getState().markMessagesAsRead(receiverId);
            }
        };

        const handleMessageDeleted = (messageId) => {
            useConversation.getState().removeMessage(messageId);
        };

        socket.on('typing', handleTyping);
        socket.on('stopTyping', handleStopTyping);
        socket.on('messagesRead', handleMessagesRead);
        socket.on('messageDeleted', handleMessageDeleted);

        return () => {
            socket.off('typing', handleTyping);
            socket.off('stopTyping', handleStopTyping);
            socket.off('messagesRead', handleMessagesRead);
            socket.off('messageDeleted', handleMessageDeleted);
        };
    }, [socket, selectedConversation]);

    // Mark messages as read when opening conversation
    useEffect(() => {
        if (selectedConversation) {
            const markAsRead = async () => {
                try {
                    await fetch(`/api/messages/mark-read/${selectedConversation._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                } catch (error) {
                    console.log(error);
                }
            };
            markAsRead();
        }
    }, [selectedConversation]);

    return (
        <div className={`flex flex-col flex-1 h-full w-full relative bg-chat-bg ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
            {!selectedConversation ? (
                <NoChatSelected />
            ) : (
                <>
                    {/* Header */}
                    <div className='h-[72px] md:h-[88px] px-4 md:px-8 flex items-center justify-between bg-chat-bg border-b border-chat-border/50 z-10'>
                        <div className='flex items-center gap-3 md:gap-4'>
                            <button 
                                className='md:hidden p-2 -ml-2 text-chat-textMuted hover:text-white transition-colors' 
                                onClick={() => setSelectedConversation(null)}
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div className='relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0'>
                                <img src={selectedConversation.profilePic} alt='avatar' className='w-full h-full rounded-full object-cover shadow-sm' />
                                {onlineUsers.includes(selectedConversation._id) && (
                                    <div className='absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-chat-bg'></div>
                                )}
                            </div>
                            <div className='flex flex-col'>
                                <span className='font-bold text-base md:text-lg text-chat-textMain tracking-wide'>
                                    {selectedConversation.username}
                                </span>
                                <span className={`text-[11px] md:text-xs font-medium ${isTyping ? 'text-chat-accent' : 'text-chat-textMuted'}`}>
                                    {isTyping ? 'typing...' : (onlineUsers.includes(selectedConversation._id) ? 'Online now' : 'Last seen recently')}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Messages />
                    <MessageInput />
                </>
            )}
        </div>
    );
};

export default MessageContainer;

const NoChatSelected = () => {
    return (
        <div className='flex items-center justify-center w-full h-full'>
            <div className='bg-chat-panel/50 text-chat-textMuted rounded-full px-6 py-2 text-sm font-medium'>
                Select a chat to start messaging
            </div>
        </div>
    );
};
