import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import { getReceiverSocketId, io } from '../socket/socket.js';
import cloudinary from '../config/cloudinary.js';

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        let { image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl = '';
        if (image) {
            try {
                if (process.env.CLOUDINARY_CLOUD_NAME) {
                    const uploadResponse = await cloudinary.uploader.upload(image);
                    imageUrl = uploadResponse.secure_url;
                } else {
                    imageUrl = image; // Fallback to raw base64
                }
            } catch (err) {
                console.error("Cloudinary upload failed, falling back to base64", err);
                imageUrl = image; // Fallback
            }
        }

        let isGroupChat = false;
        let conversation = await Conversation.findOne({
            _id: receiverId,
            isGroup: true
        }).catch(() => null);

        if (conversation) {
            isGroupChat = true;
        } else {
            conversation = await Conversation.findOne({
                participants: { $all: [senderId, receiverId] },
                isGroup: false
            });

            if (!conversation) {
                conversation = await Conversation.create({
                    participants: [senderId, receiverId],
                });
            }
        }

        const newMessage = new Message({
            senderId,
            receiverId: isGroupChat ? null : receiverId,
            conversationId: conversation._id,
            text: message || '',
            image: imageUrl || '',
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        // Run in parallel
        await Promise.all([conversation.save(), newMessage.save()]);

        // SOCKET IO FUNCTIONALITY
        if (isGroupChat) {
            conversation.participants.forEach(participantId => {
                if (participantId.toString() !== senderId.toString()) {
                    const participantSocketId = getReceiverSocketId(participantId);
                    if (participantSocketId) {
                        io.to(participantSocketId).emit('newMessage', newMessage);
                    }
                }
            });
        } else {
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('newMessage', newMessage);
            }
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log('Error in sendMessage controller: ', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            _id: userToChatId,
            isGroup: true
        }).populate('messages').catch(() => null);

        if (!conversation) {
            conversation = await Conversation.findOne({
                participants: { $all: [senderId, userToChatId] },
                isGroup: false
            }).populate('messages');
        }

        if (!conversation) return res.status(200).json([]);

        const messages = conversation.messages;

        res.status(200).json(messages);
    } catch (error) {
        console.log('Error in getMessages controller: ', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const markMessagesAsRead = async (req, res) => {
    try {
        const { id: senderId } = req.params; // ID of the user whose messages we are marking as read
        const receiverId = req.user._id;

        // Find conversation
        let conversation = await Conversation.findOne({
            _id: senderId,
            isGroup: true
        }).catch(() => null);

        if (conversation) {
            // It's a group chat. Just mark the messages as read locally in DB to hide badge.
            await Message.updateMany(
                { conversationId: conversation._id, senderId: { $ne: receiverId }, isRead: false },
                { $set: { isRead: true } }
            );
            return res.status(200).json({ message: "Group messages marked as read" });
        }

        conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
            isGroup: false
        });

        if (!conversation) return res.status(200).json({ message: "No conversation found" });

        // Update all unread messages sent by 'senderId' to 'receiverId'
        await Message.updateMany(
            { senderId, receiverId, isRead: false },
            { $set: { isRead: true } }
        );

        // Notify the sender that their messages were read
        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit('messagesRead', { conversationId: conversation._id, receiverId });
        }

        res.status(200).json({ message: "Messages marked as read successfully" });
    } catch (error) {
        console.log('Error in markMessagesAsRead controller: ', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const senderId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        // Only sender can delete their message
        if (message.senderId.toString() !== senderId.toString()) {
            return res.status(403).json({ error: "Unauthorized to delete this message" });
        }

        // Delete from database
        await Message.findByIdAndDelete(messageId);

        // Remove from conversation
        await Conversation.updateOne(
            { messages: messageId },
            { $pull: { messages: messageId } }
        );

        // Notify receiver
        const receiverSocketId = getReceiverSocketId(message.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('messageDeleted', messageId);
        }

        res.status(200).json({ message: "Message deleted successfully", messageId });
    } catch (error) {
        console.log('Error in deleteMessage controller: ', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
