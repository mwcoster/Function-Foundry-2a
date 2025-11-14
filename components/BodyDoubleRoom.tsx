import React, { useState, useEffect, useMemo } from 'react';
import { GENERIC_AVATARS } from './CharacterAvatars';

interface BodyDoubleRoomProps {
    onClose: () => void;
}

const SESSION_DURATION = 25 * 60; // 25 minutes in seconds

export const BodyDoubleRoom: React.FC<BodyDoubleRoomProps> = ({ onClose }) => {
    const [secondsLeft, setSecondsLeft] = useState(SESSION_DURATION);
    const [isActive, setIsActive] = useState(false);

    const simulatedUsers = useMemo(() => 
        Array.from({ length: 5 }).map((_, i) => ({
            id: i,
            Avatar: GENERIC_AVATARS[i % GENERIC_AVATARS.length],
            style: {
                animation: `pulse-glow ${4 + Math.random() * 4}s infinite ${Math.random() * 2}s`,
            }
        }))
    , []);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && secondsLeft > 0) {
            interval = setInterval(() => {
                setSecondsLeft(prev => prev - 1);
            }, 1000);
        } else if (secondsLeft === 0) {
            setIsActive(false);
            // Optionally play a sound or show a notification
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, secondsLeft]);

    const toggleTimer = () => {
        if (secondsLeft === 0) {
            setSecondsLeft(SESSION_DURATION);
        }
        setIsActive(prev => !prev);
    };

    const resetTimer = () => {
        setIsActive(false);
        setSecondsLeft(SESSION_DURATION);
    }

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4 animate-fade-in backdrop-blur-md" onClick={onClose}>
            <div className="relative bg-white/70 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl w-full max-w-2xl p-6 text-center transform transition-all animate-fade-in-up font-sans" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-2 justify-center">
                    <span className="text-3xl" aria-hidden="true">👥</span>
                    <h2 className="text-3xl font-bold text-slate-800 font-serif">Body Double Room</h2>
                </div>
                <p className="text-slate-600 mb-6">A quiet space to work alongside others. Start the timer and begin.</p>
                
                <div className="my-8">
                    <p className="font-mono text-7xl font-bold text-slate-800 tracking-tighter" role="timer" aria-live="assertive">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </p>
                </div>

                <div className="flex justify-center gap-4 mb-8">
                    <button onClick={toggleTimer} className={`px-8 py-3 text-white font-semibold rounded-lg shadow-md transition-all w-40 ${isActive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-sky-700 hover:bg-sky-800'}`}>
                        {isActive ? 'Pause Session' : secondsLeft === 0 ? 'Start New Session' : 'Start Session'}
                    </button>
                    <button onClick={resetTimer} className="px-6 py-3 bg-slate-200/70 text-slate-800 font-semibold rounded-lg hover:bg-slate-300/80 transition-colors shadow-sm">
                        Reset
                    </button>
                </div>

                <div className="relative h-24 border-t border-b border-white/50 bg-black/5 flex items-center justify-center">
                    <p className="absolute top-2 left-4 text-xs font-semibold text-slate-500 uppercase">Focus Session In Progress</p>
                    <div className="flex items-center gap-6">
                        {simulatedUsers.map(user => (
                            <div key={user.id} className="w-12 h-12" style={user.style} title="Another user focusing">
                                <user.Avatar />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};