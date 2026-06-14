import { useEffect, useRef } from 'react';
import useGetMessages from '../hooks/useGetMessages';
import Message from './Message';
import useListenMessages from '../hooks/useListenMessages';

const Messages = () => {
    const { messages, loading } = useGetMessages();
    useListenMessages();
    const lastMessageRef = useRef();

    useEffect(() => {
        setTimeout(() => {
            lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }, [messages]);

    return (
        <div className='px-4 md:px-8 py-6 flex-1 overflow-y-auto z-10'>
            {!loading &&
                messages.length > 0 &&
                messages.map((message) => (
                    <div key={message._id} ref={lastMessageRef}>
                        <Message message={message} />
                    </div>
                ))}

            {loading && [...Array(4)].map((_, idx) => (
                <div key={idx} className={`flex gap-3 mb-6 ${idx % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                    <div className={`animate-pulse h-12 w-2/3 md:w-1/3 rounded-2xl ${idx % 2 === 0 ? 'bg-chat-bubbleSent rounded-tr-sm' : 'bg-chat-bubbleRecv rounded-tl-sm'}`}></div>
                </div>
            ))}
            
            {!loading && messages.length === 0 && (
                <div className='flex justify-center mt-10'>
                    <div className='bg-chat-panel/30 text-chat-textMuted rounded-full px-4 py-1 text-sm'>
                        No messages yet. Say hello!
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;
