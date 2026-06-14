import { useSocketContext } from '../context/SocketContext';
import useConversation from '../zustand/useConversation';

const Conversation = ({ conversation, lastIdx }) => {
    const { selectedConversation, setSelectedConversation } = useConversation();

    const isSelected = selectedConversation?._id === conversation._id;
    const { onlineUsers } = useSocketContext();
    const isOnline = onlineUsers.includes(conversation._id);

    return (
        <div
            className={`flex items-center gap-4 px-6 py-3.5 cursor-pointer transition-all border-l-4 ${
                isSelected 
                ? 'bg-chat-hover border-chat-accent' 
                : 'border-transparent hover:bg-chat-hover/50'
            }`}
            onClick={() => setSelectedConversation(conversation)}
        >
            <div className='relative w-12 h-12 flex-shrink-0'>
                <img 
                    src={conversation.profilePic} 
                    alt='user avatar' 
                    className='w-full h-full rounded-full object-cover shadow-sm' 
                />
                {isOnline && (
                    <div className='absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-[2.5px] border-chat-panel'></div>
                )}
            </div>

            <div className='flex flex-col flex-1 min-w-0 pr-2'>
                <div className='flex justify-between items-center mb-0.5'>
                    <p className='font-semibold text-[15px] truncate text-chat-textMain max-w-[70%]'>
                        {conversation.username}
                    </p>
                    <span className='text-[11px] font-medium text-chat-textMuted flex-shrink-0 ml-2'>
                        12:00
                    </span>
                </div>
                <div className='flex justify-between items-center mt-1'>
                    <p className={`text-[13px] truncate ${conversation.unreadCount > 0 ? 'text-white font-medium' : 'text-chat-textMuted'}`}>
                        Tap to view messages...
                    </p>
                    {conversation.unreadCount > 0 && (
                        <div className='bg-chat-accent text-white text-[10px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full ml-2 flex-shrink-0'>
                            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Conversation;
