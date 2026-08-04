import { useRef, useCallback, useEffect } from 'react';
import { useSocketContext } from '../context/SocketContext';
import { useAuthContext } from '../context/AuthContext';
import useCallStore from '../zustand/useCallStore';
import { webRTCHandlers } from '../context/SocketContext';
import toast from 'react-hot-toast';

const STUN_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

const useWebRTC = () => {
    const { socket } = useSocketContext();
    const { authUser } = useAuthContext();
    const pcRef = useRef(null); // RTCPeerConnection

    const {
        setCallState,
        setCallType,
        setReceiver,
        setLocalStream,
        setRemoteStream,
        setOffer,
        resetCall,
        callType,
        offer,
        caller,
        receiver,
    } = useCallStore();

    // ── Helpers ──────────────────────────────────────────────────

    const getMedia = useCallback(async (type) => {
        const constraints = {
            audio: true,
            video: type === 'video',
        };
        return await navigator.mediaDevices.getUserMedia(constraints);
    }, []);

    const createPeerConnection = useCallback((otherUserId) => {
        const pc = new RTCPeerConnection(STUN_SERVERS);

        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('ice-candidate', {
                    otherUserId,
                    candidate: event.candidate,
                });
            }
        };

        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        pcRef.current = pc;
        return pc;
    }, [socket, setRemoteStream]);

    const cleanupCall = useCallback(() => {
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        // Stop local stream tracks
        const { localStream } = useCallStore.getState();
        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
        }
        resetCall();
    }, [resetCall]);

    // ── Actions ──────────────────────────────────────────────────

    /**
     * Initiate a call to another user
     * @param {object} receiverUser - { _id, username, profilePic }
     * @param {'audio'|'video'} type
     */
    const startCall = useCallback(async (receiverUser, type) => {
        if (!socket) return;
        try {
            const stream = await getMedia(type);
            setLocalStream(stream);
            setReceiver(receiverUser);
            setCallType(type);
            setCallState('calling');

            const pc = createPeerConnection(receiverUser._id);

            stream.getTracks().forEach((track) => pc.addTrack(track, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit('call-user', {
                receiverId: receiverUser._id,
                callType: type,
                offer,
                callerInfo: {
                    _id: authUser._id,
                    username: authUser.username,
                    profilePic: authUser.profilePic,
                },
            });
        } catch (err) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                toast.error('Microphone/camera permission denied. Please allow access in your browser settings.');
            } else if (err.name === 'NotFoundError') {
                toast.error('No microphone or camera found on this device.');
            } else {
                toast.error('Could not start call. Please try again.');
                console.error('startCall error:', err);
            }
            cleanupCall();
        }
    }, [socket, authUser, getMedia, createPeerConnection, setLocalStream, setReceiver, setCallType, setCallState, cleanupCall]);

    /**
     * Accept an incoming call
     */
    const answerCall = useCallback(async () => {
        if (!socket) return;
        const { caller: callerUser, offer: incomingOffer, callType: incomingType } = useCallStore.getState();
        try {
            const stream = await getMedia(incomingType);
            setLocalStream(stream);

            const pc = createPeerConnection(callerUser._id);
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));

            await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit('call-accepted', {
                callerId: callerUser._id,
                answer,
            });

            setCallState('in-call');
        } catch (err) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                toast.error('Microphone/camera permission denied. Please allow access to accept calls.');
            } else if (err.name === 'NotFoundError') {
                toast.error('No microphone or camera found on this device.');
            } else {
                toast.error('Could not connect call. Please try again.');
                console.error('answerCall error:', err);
            }
            cleanupCall();
        }
    }, [socket, getMedia, createPeerConnection, setLocalStream, setCallState, cleanupCall]);

    /**
     * Handle call-accepted from remote (caller side)
     */
    const handleCallAccepted = useCallback(async ({ answer }) => {
        if (!pcRef.current) return;
        try {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            setCallState('in-call');
        } catch (err) {
            console.error('handleCallAccepted error:', err);
        }
    }, [setCallState]);

    /**
     * Add an ICE candidate from the remote peer
     */
    const handleIceCandidate = useCallback(async ({ candidate }) => {
        if (!pcRef.current) return;
        try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
            console.error('handleIceCandidate error:', err);
        }
    }, []);

    /**
     * Reject incoming call
     */
    const rejectCall = useCallback(() => {
        if (!socket) return;
        const { caller: callerUser } = useCallStore.getState();
        if (callerUser) {
            socket.emit('call-rejected', { callerId: callerUser._id });
        }
        cleanupCall();
    }, [socket, cleanupCall]);

    /**
     * End an active call (either side)
     */
    const endCall = useCallback(() => {
        if (!socket) return;
        const state = useCallStore.getState();
        const otherUserId = state.callState === 'calling'
            ? state.receiver?._id
            : state.caller?._id;

        if (otherUserId) {
            socket.emit('call-ended', { otherUserId });
        }
        cleanupCall();
    }, [socket, cleanupCall]);

    /**
     * Toggle microphone mute
     */
    const toggleMute = useCallback(() => {
        const { localStream } = useCallStore.getState();
        if (!localStream) return;
        localStream.getAudioTracks().forEach((track) => {
            track.enabled = !track.enabled;
        });
    }, []);

    /**
     * Toggle camera on/off
     */
    const toggleCamera = useCallback(() => {
        const { localStream } = useCallStore.getState();
        if (!localStream) return;
        localStream.getVideoTracks().forEach((track) => {
            track.enabled = !track.enabled;
        });
    }, []);

    // Register handlers so SocketContext can relay events to the active peer connection
    useEffect(() => {
        webRTCHandlers.onCallAccepted = handleCallAccepted;
        webRTCHandlers.onIceCandidate = handleIceCandidate;
        return () => {
            webRTCHandlers.onCallAccepted = null;
            webRTCHandlers.onIceCandidate = null;
        };
    }, [handleCallAccepted, handleIceCandidate]);

    return {
        startCall,
        answerCall,
        rejectCall,
        endCall,
        handleCallAccepted,
        handleIceCandidate,
        toggleMute,
        toggleCamera,
    };
};

export default useWebRTC;
