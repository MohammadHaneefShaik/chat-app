import { create } from 'zustand';

/**
 * callState:
 *   'idle'     — no call activity
 *   'calling'  — we initiated a call, waiting for answer
 *   'incoming' — we received an incoming call
 *   'in-call'  — call is active
 */

const useCallStore = create((set) => ({
    callState: 'idle',
    callType: null,        // 'audio' | 'video'
    caller: null,          // { _id, username, profilePic }
    receiver: null,        // { _id, username, profilePic }
    localStream: null,
    remoteStream: null,
    offer: null,           // incoming WebRTC offer SDP

    setCallState: (callState) => set({ callState }),
    setCallType: (callType) => set({ callType }),
    setCaller: (caller) => set({ caller }),
    setReceiver: (receiver) => set({ receiver }),
    setLocalStream: (localStream) => set({ localStream }),
    setRemoteStream: (remoteStream) => set({ remoteStream }),
    setOffer: (offer) => set({ offer }),

    resetCall: () => set({
        callState: 'idle',
        callType: null,
        caller: null,
        receiver: null,
        localStream: null,
        remoteStream: null,
        offer: null,
    }),
}));

export default useCallStore;
