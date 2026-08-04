import { useEffect, useRef, useState, useCallback } from 'react';
import {
    Phone, PhoneOff, PhoneIncoming, Video, VideoOff,
    Mic, MicOff, X
} from 'lucide-react';
import useCallStore from '../zustand/useCallStore';
import useWebRTC from '../hooks/useWebRTC';

// ── Call duration timer ───────────────────────────────────────
const CallTimer = () => {
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, []);
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return <span className="text-chat-textMuted text-sm font-mono">{m}:{s}</span>;
};

// ── Pulsing ring animation around avatar ─────────────────────
const PulsingRing = ({ children }) => (
    <div className="relative flex items-center justify-center">
        <span className="absolute inline-flex h-full w-full rounded-full bg-chat-accent opacity-20 animate-ping" />
        <span className="absolute inline-flex h-[120%] w-[120%] rounded-full bg-chat-accent opacity-10 animate-ping" style={{ animationDelay: '0.3s' }} />
        {children}
    </div>
);

// ── Sound wave bars (for audio call) ─────────────────────────
const SoundWave = () => (
    <div className="flex items-end gap-1 h-8">
        {[1, 2, 3, 4, 5].map((i) => (
            <div
                key={i}
                className="w-1 bg-chat-accent rounded-full animate-bounce"
                style={{
                    height: `${Math.random() * 60 + 40}%`,
                    animationDuration: `${0.4 + i * 0.1}s`,
                    animationDelay: `${i * 0.08}s`,
                }}
            />
        ))}
    </div>
);

const CallModal = () => {
    const {
        callState, callType, caller, receiver,
        localStream, remoteStream,
    } = useCallStore();

    const { answerCall, rejectCall, endCall, toggleMute, toggleCamera } = useWebRTC();

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);

    // Bind streams to video elements
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const handleToggleMute = useCallback(() => {
        toggleMute();
        setIsMuted((m) => !m);
    }, [toggleMute]);

    const handleToggleCamera = useCallback(() => {
        toggleCamera();
        setIsCameraOff((c) => !c);
    }, [toggleCamera]);

    if (callState === 'idle') return null;

    // Other user info
    const otherUser = callState === 'incoming' ? caller : receiver;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

            {/* ── IN-CALL: Video ── */}
            {callState === 'in-call' && callType === 'video' && (
                <div className="relative w-full h-full flex items-center justify-center">
                    {/* Remote video — fullscreen */}
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    {!remoteStream && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                            <img src={otherUser?.profilePic} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-chat-accent/50" />
                            <p className="text-white font-semibold text-xl">{otherUser?.username}</p>
                            <p className="text-chat-textMuted text-sm">Connecting…</p>
                        </div>
                    )}

                    {/* Local video — PiP */}
                    <div className="absolute bottom-24 right-4 w-28 h-40 md:w-36 md:h-52 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover mirror"
                            style={{ transform: 'scaleX(-1)' }}
                        />
                        {isCameraOff && (
                            <div className="absolute inset-0 bg-chat-panel flex items-center justify-center">
                                <VideoOff size={20} className="text-chat-textMuted" />
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                        <ControlBtn onClick={handleToggleMute} active={isMuted} icon={isMuted ? <MicOff size={20} /> : <Mic size={20} />} label="Mute" />
                        <ControlBtn onClick={handleToggleCamera} active={isCameraOff} icon={isCameraOff ? <VideoOff size={20} /> : <Video size={20} />} label="Camera" />
                        <EndCallBtn onClick={endCall} />
                    </div>

                    {/* Timer top-left */}
                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                        <CallTimer />
                    </div>
                </div>
            )}

            {/* ── IN-CALL: Audio ── */}
            {callState === 'in-call' && callType === 'audio' && (
                <div className="relative z-10 flex flex-col items-center gap-8 px-8">
                    <p className="text-chat-textMuted text-sm font-medium tracking-widest uppercase">Audio Call</p>
                    <PulsingRing>
                        <img src={otherUser?.profilePic} alt="" className="w-28 h-28 rounded-full object-cover border-4 border-chat-accent/60 shadow-2xl" />
                    </PulsingRing>
                    <div className="flex flex-col items-center gap-1">
                        <h2 className="text-white text-2xl font-bold">{otherUser?.username}</h2>
                        <CallTimer />
                    </div>
                    <SoundWave />
                    <div className="flex items-center gap-6 mt-4">
                        <ControlBtn onClick={handleToggleMute} active={isMuted} icon={isMuted ? <MicOff size={20} /> : <Mic size={20} />} label="Mute" />
                        <EndCallBtn onClick={endCall} />
                    </div>
                </div>
            )}

            {/* ── OUTGOING: Calling ── */}
            {callState === 'calling' && (
                <div className="relative z-10 flex flex-col items-center gap-8 px-8">
                    <p className="text-chat-textMuted text-sm font-medium tracking-widest uppercase animate-pulse">
                        {callType === 'video' ? 'Video Calling…' : 'Calling…'}
                    </p>
                    <PulsingRing>
                        <img src={otherUser?.profilePic} alt="" className="w-28 h-28 rounded-full object-cover border-4 border-chat-accent/60 shadow-2xl" />
                    </PulsingRing>
                    <h2 className="text-white text-2xl font-bold">{otherUser?.username}</h2>
                    <div className="flex flex-col items-center gap-2 mt-2">
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <span
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-chat-accent animate-bounce"
                                    style={{ animationDelay: `${i * 0.15}s` }}
                                />
                            ))}
                        </div>
                    </div>
                    {/* Cancel */}
                    <EndCallBtn onClick={endCall} />
                </div>
            )}

            {/* ── INCOMING: Ringing ── */}
            {callState === 'incoming' && (
                <div className="relative z-10 flex flex-col items-center gap-8 px-8 max-w-sm w-full mx-4">
                    <div className="w-full bg-chat-panel/90 backdrop-blur-lg rounded-3xl p-8 flex flex-col items-center gap-6 border border-chat-border shadow-2xl">
                        <p className="text-chat-textMuted text-xs font-medium tracking-widest uppercase">
                            Incoming {callType === 'video' ? 'Video' : 'Audio'} Call
                        </p>
                        <PulsingRing>
                            <img src={otherUser?.profilePic} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-chat-accent/60 shadow-xl" />
                        </PulsingRing>
                        <div className="text-center">
                            <h2 className="text-white text-xl font-bold">{otherUser?.username}</h2>
                            <p className="text-chat-textMuted text-sm mt-1">is calling you…</p>
                        </div>
                        <div className="flex items-center gap-6 w-full justify-center">
                            {/* Reject */}
                            <button
                                onClick={rejectCall}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95">
                                    <PhoneOff size={22} className="text-white" />
                                </div>
                                <span className="text-chat-textMuted text-xs">Decline</span>
                            </button>
                            {/* Accept */}
                            <button
                                onClick={answerCall}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 animate-bounce">
                                    {callType === 'video' ? <Video size={22} className="text-white" /> : <Phone size={22} className="text-white" />}
                                </div>
                                <span className="text-chat-textMuted text-xs">Accept</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Reusable control button ───────────────────────────────────
const ControlBtn = ({ onClick, active, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center gap-2 group`}
    >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg
            ${active ? 'bg-white/20 border border-white/30' : 'bg-black/40 border border-white/10 hover:bg-white/10'}`}
        >
            <span className="text-white">{icon}</span>
        </div>
        {label && <span className="text-chat-textMuted text-xs">{label}</span>}
    </button>
);

// ── End call button ───────────────────────────────────────────
const EndCallBtn = ({ onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center gap-2"
    >
        <div className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95">
            <PhoneOff size={22} className="text-white" />
        </div>
        <span className="text-chat-textMuted text-xs">End</span>
    </button>
);

export default CallModal;
