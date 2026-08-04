import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL
            ? [process.env.FRONTEND_URL.replace(/\/$/, ''), 'http://localhost:5173']
            : ['http://localhost:5173'],
        methods: ['GET', 'POST'],
    },
});

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    const userId = socket.handshake.query.userId;
    if (userId && userId !== 'undefined') {
        userSocketMap[userId] = socket.id;
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });

    // ── Typing indicators ──────────────────────────────────────
    socket.on('typing', ({ senderId, receiverId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) io.to(receiverSocketId).emit('typing', senderId);
    });

    socket.on('stopTyping', ({ senderId, receiverId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) io.to(receiverSocketId).emit('stopTyping', senderId);
    });

    // ── WebRTC Signaling ───────────────────────────────────────

    // Caller initiates a call
    socket.on('call-user', ({ receiverId, callType, offer, callerInfo }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('incoming-call', {
                callerId: userId,
                callType,
                offer,
                callerInfo,
            });
        } else {
            // Receiver is offline
            socket.emit('call-rejected', { reason: 'unavailable' });
        }
    });

    // Receiver accepts the call
    socket.on('call-accepted', ({ callerId, answer }) => {
        const callerSocketId = getReceiverSocketId(callerId);
        if (callerSocketId) {
            io.to(callerSocketId).emit('call-accepted', { answer });
        }
    });

    // Receiver rejects the call
    socket.on('call-rejected', ({ callerId }) => {
        const callerSocketId = getReceiverSocketId(callerId);
        if (callerSocketId) {
            io.to(callerSocketId).emit('call-rejected', { reason: 'rejected' });
        }
    });

    // Either side ends the call
    socket.on('call-ended', ({ otherUserId }) => {
        const otherSocketId = getReceiverSocketId(otherUserId);
        if (otherSocketId) {
            io.to(otherSocketId).emit('call-ended');
        }
    });

    // Relay ICE candidates
    socket.on('ice-candidate', ({ otherUserId, candidate }) => {
        const otherSocketId = getReceiverSocketId(otherUserId);
        if (otherSocketId) {
            io.to(otherSocketId).emit('ice-candidate', { candidate });
        }
    });
});

export { app, io, server };
