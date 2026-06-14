import useGetConversations from '../hooks/useGetConversations';
import Conversation from './Conversation';

const Conversations = () => {
    const { loading, conversations } = useGetConversations();

    return (
        <div className='flex flex-col overflow-y-auto flex-1'>
            {conversations.map((conversation, idx) => (
                <Conversation
                    key={conversation._id}
                    conversation={conversation}
                    lastIdx={idx === conversations.length - 1}
                />
            ))}

            {loading ? <span className='loading loading-spinner mx-auto mt-4'></span> : null}
        </div>
    );
};

export default Conversations;
