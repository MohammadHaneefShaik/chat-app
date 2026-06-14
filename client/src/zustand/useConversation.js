import { create } from 'zustand';

const useConversation = create((set) => ({
    selectedConversation: null,
    setSelectedConversation: (selectedConversation) => set({ selectedConversation }),
    messages: [],
    setMessages: (messages) => set({ messages }),
    markMessagesAsRead: (receiverId) => set((state) => ({
        messages: state.messages.map((message) => {
            if (message.receiverId === receiverId && !message.isRead) {
                return { ...message, isRead: true };
            }
            return message;
        })
    })),
    removeMessage: (messageId) => set((state) => ({
        messages: state.messages.filter((message) => message._id !== messageId)
    })),
}));

export default useConversation;
