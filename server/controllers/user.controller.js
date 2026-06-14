import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import cloudinary from '../config/cloudinary.js';

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');

        // Add unread counts
        const usersWithUnreadCounts = await Promise.all(filteredUsers.map(async (user) => {
            const unreadCount = await Message.countDocuments({
                senderId: user._id,
                receiverId: loggedInUserId,
                isRead: false
            });
            return {
                ...user.toObject(),
                unreadCount
            };
        }));

        res.status(200).json(usersWithUnreadCounts);
    } catch (error) {
        console.error('Error in getUsersForSidebar: ', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({ error: 'Profile pic is required' });
        }

        let secureUrl = profilePic;
        try {
            if (process.env.CLOUDINARY_CLOUD_NAME) {
                const uploadResponse = await cloudinary.uploader.upload(profilePic);
                secureUrl = uploadResponse.secure_url;
            }
        } catch (err) {
            console.error("Cloudinary upload failed, falling back to base64", err);
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: secureUrl },
            { new: true }
        ).select('-password');

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log('Error in update profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
