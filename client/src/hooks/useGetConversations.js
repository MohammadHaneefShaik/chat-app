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
                toast.error(error.response?.data?.error || 'Failed to get conversations');
            } finally {
                setLoading(false);
            }
        };

        getConversations();
    }, []);

    return { loading, conversations };
};

export default useGetConversations;
