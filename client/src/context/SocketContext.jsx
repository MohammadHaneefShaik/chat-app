import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuthContext } from './AuthContext';
import io from 'socket.io-client';
import useCallStore from '../zustand/useCallStore';
// Registry for WebRTC handler callbacks set by useWebRTC hook
export const webRTCHandlers = { onCallAccepted: null, onIceCandidate: null };

export const SocketContext = createContext();

export const useSocketContext = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { authUser } = useAuthContext();
    // Keep a stable ref to the latest socket for WebRTC handler re-use
    const socketRef = useRef(null);

    useEffect(() => {
        if (authUser) {
            const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const newSocket = io(socketUrl, {
                query: { userId: authUser._id },
            });

            socketRef.current = newSocket;
            setSocket(newSocket);

            newSocket.on('getOnlineUsers', (users) => {
                setOnlineUsers(users);
            });

            // ── WebRTC Signaling listeners ──────────────────────────

            // Someone is calling us
            newSocket.on('incoming-call', ({ callerId, callType, offer, callerInfo }) => {
                const { callState } = useCallStore.getState();
                // Ignore if already in a call
                if (callState !== 'idle') return;
                useCallStore.getState().setCaller(callerInfo);
                useCallStore.getState().setCallType(callType);
                useCallStore.getState().setOffer(offer);
                useCallStore.getState().setCallState('incoming');
            });

            // Relay call-accepted to the WebRTC hook
            newSocket.on('call-accepted', (data) => {
                if (webRTCHandlers.onCallAccepted) webRTCHandlers.onCallAccepted(data);
            });

            // Relay ICE candidates to the WebRTC hook
            newSocket.on('ice-candidate', (data) => {
                if (webRTCHandlers.onIceCandidate) webRTCHandlers.onIceCandidate(data);
            });

            newSocket.on('call-rejected', ({ reason }) => {
                const { callState } = useCallStore.getState();
                if (callState === 'calling') {
                    useCallStore.getState().resetCall();
                }
            });

            newSocket.on('call-ended', () => {
                // Stop streams
                const { localStream } = useCallStore.getState();
                if (localStream) {
                    localStream.getTracks().forEach((t) => t.stop());
                }
                useCallStore.getState().resetCall();
            });

            return () => {
                newSocket.close();
                socketRef.current = null;
            };
        } else {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
            setSocket(null);
        }
    }, [authUser]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
