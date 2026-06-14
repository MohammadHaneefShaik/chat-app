import { useState } from 'react';
import useConversation from '../zustand/useConversation';
import axios from 'axios';
import toast from 'react-hot-toast';

const useSendMessage = () => {
    const [loading, setLoading] = useState(false);
    const { messages, setMessages, selectedConversation } = useConversation();

    const sendMessage = async (messageData) => {
        setLoading(true);
        try {
            const res = await axios.post(`/api/messages/send/${selectedConversation._id}`, messageData);
            setMessages([...messages, res.data]);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return { sendMessage, loading };
};

export default useSendMessage;
