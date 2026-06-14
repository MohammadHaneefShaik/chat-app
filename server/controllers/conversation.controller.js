import Conversation from '../models/conversation.model.js';
import User from '../models/user.model.js';

export const createGroupConversation = async (req, res) => {
    try {
        const { participantIds, groupName } = req.body;
        const loggedInUserId = req.user._id;

        if (!participantIds || participantIds.length === 0) {
            return res.status(400).json({ error: "Participant IDs are required" });
        }

        if (!groupName) {
            return res.status(400).json({ error: "Group name is required" });
        }

        // Add the creator to the participants
        const allParticipants = [...new Set([...participantIds, loggedInUserId.toString()])];

        if (allParticipants.length < 2) {
            return res.status(400).json({ error: "Group must have at least 2 participants" });
        }

        const newConversation = new Conversation({
            participants: allParticipants,
            isGroup: true,
            groupName: groupName,
            groupAdmin: loggedInUserId,
            messages: []
        });

        await newConversation.save();

        res.status(201).json(newConversation);
    } catch (error) {
        console.error('Error in createGroupConversation:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getGroupConversations = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const groupConversations = await Conversation.find({
            participants: { $in: [loggedInUserId] },
            isGroup: true
        });

        // Format them similarly to users for the sidebar
        const formattedGroups = groupConversations.map(group => ({
            _id: group._id,
            username: group.groupName,
            profilePic: `https://avatar.iran.liara.run/initials?seed=${encodeURIComponent(group.groupName)}`,
            isGroup: true,
            unreadCount: 0 // Simplification for now
        }));

        res.status(200).json(formattedGroups);
    } catch (error) {
        console.error('Error in getGroupConversations:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
