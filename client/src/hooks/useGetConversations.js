import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const useGetConversations = () => {
    const [loading, setLoading] = useState(false);
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        const getConversations = async () => {
            setLoading(true);
            try {
                const [usersRes, groupsRes] = await Promise.all([
                    axios.get('/api/users'),
                    axios.get('/api/conversations/groups')
                ]);
                setConversations([...groupsRes.data, ...usersRes.data]);
            } catch (error) {
                const errorData = error.response?.data?.error;
                let errorMessage;
                if (typeof errorData === 'string') {
                    errorMessage = errorData;
                } else if (errorData && typeof errorData === 'object') {
                    errorMessage = String(errorData.message || 'Failed to get conversations');
                } else {
                    errorMessage = error.message || 'Failed to get conversations';
                }
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        getConversations();
    }, []);

    return { loading, conversations };
};

export default useGetConversations;
