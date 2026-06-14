import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useGetConversations from '../hooks/useGetConversations';
import { X, Users } from 'lucide-react';

const CreateGroupModal = ({ isOpen, onClose }) => {
    const { conversations } = useGetConversations(); // Here conversations includes users and groups, but we only want to list users
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter out groups, we only want to add individual users
    const users = conversations.filter(c => !c.isGroup);

    if (!isOpen) return null;

    const toggleUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) return toast.error("Group name is required");
        if (selectedUsers.length < 1) return toast.error("Select at least 1 user");

        setLoading(true);
        try {
            await axios.post('/api/conversations/group', {
                groupName,
                participantIds: selectedUsers
            });
            toast.success("Group created successfully!");
            onClose();
            // In a real app, you might want to refresh the conversation list or update Zustand store
            window.location.reload(); 
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to create group");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-chat-panel w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[80vh]">
                <div className="p-5 border-b border-chat-border/50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Users size={20} className="text-chat-accent" />
                        Create Group
                    </h2>
                    <button onClick={onClose} className="text-chat-textMuted hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-5 overflow-y-auto flex-1">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-chat-textMuted mb-2">Group Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-chat-bg border border-chat-border/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-chat-accent"
                            placeholder="e.g. Study Group"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-chat-textMuted mb-2">Select Participants</label>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {users.map(user => (
                                <div 
                                    key={user._id} 
                                    onClick={() => toggleUser(user._id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${selectedUsers.includes(user._id) ? 'bg-chat-hover border-chat-accent' : 'bg-chat-bg border-transparent hover:border-chat-border'}`}
                                >
                                    <img src={user.profilePic} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                                    <span className="font-medium text-white flex-1">{user.username}</span>
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${selectedUsers.includes(user._id) ? 'bg-chat-accent border-chat-accent' : 'border-chat-textMuted'}`}>
                                        {selectedUsers.includes(user._id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="p-5 border-t border-chat-border/50">
                    <button 
                        onClick={handleCreateGroup}
                        disabled={loading}
                        className="w-full bg-chat-accent hover:bg-chat-accentHover text-white py-3 rounded-xl font-semibold transition-colors flex justify-center items-center"
                    >
                        {loading ? <span className="loading loading-spinner"></span> : 'Create Group'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;
