import { Search, Users } from 'lucide-react';
import SearchInput from './SearchInput';
import Conversations from './Conversations';
import LogoutButton from './LogoutButton';
import useConversation from '../zustand/useConversation';
import { useState } from 'react';
import CreateGroupModal from './CreateGroupModal';

const Sidebar = () => {
    const { selectedConversation } = useConversation();
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

    return (
        <div className={`border-r border-chat-border flex-col w-full md:w-[380px] flex-shrink-0 bg-chat-panel z-10 ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
            <div className='px-6 py-6'>
                <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-xl overflow-hidden shadow-sm'>
                            <img src="/logo.png" alt="Chit Chatt Logo" className="w-full h-full object-cover" />
                        </div>
                        <h2 className='text-2xl font-bold text-chat-textMain tracking-wide'>Chit Chatt</h2>
                    </div>
                    <button 
                        onClick={() => setIsGroupModalOpen(true)}
                        className='p-2 bg-chat-bg hover:bg-chat-hover text-chat-textMuted hover:text-chat-accent rounded-xl transition-all'
                        title="Create Group"
                    >
                        <Users size={20} />
                    </button>
                </div>
                <SearchInput />
            </div>
            <Conversations />
            <div className='p-6 mt-auto'>
                <LogoutButton />
            </div>
            
            <CreateGroupModal 
                isOpen={isGroupModalOpen} 
                onClose={() => setIsGroupModalOpen(false)} 
            />
        </div>
    );
};

export default Sidebar;
