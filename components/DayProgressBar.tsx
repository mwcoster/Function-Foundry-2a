import React, { useState, useEffect } from 'react';

export const DayProgressBar: React.FC = () => {
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState('');

    const calculateProgress = () => {
        const now = new Date();
        const start = new Date(now);
        start.setHours(0, 0, 0, 0); // Start of the day (midnight)
        
        const totalMsInDay = 24 * 60 * 60 * 1000;
        const elapsedMs = now.getTime() - start.getTime();
        
        setProgress((elapsedMs / totalMsInDay) * 100);
        setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };

    useEffect(() => {
        calculateProgress();
        const interval = setInterval(calculateProgress, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-2xl mx-auto px-4 group">
            <div 
                className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden shadow-inner"
                title={`Time passed today: ${Math.round(progress)}%`}
            >
                <div 
                    className="absolute top-0 left-0 h-full bg-sky-400 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${progress}%` }}
                />
                <div 
                    className="absolute top-1/2 -translate-y-1/2 h-4 w-1 bg-white/90 shadow-lg rounded transition-all duration-300 opacity-0 group-hover:opacity-100"
                    style={{ left: `calc(${progress}% - 2px)` }}
                >
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-white bg-slate-800/70 px-2 py-0.5 rounded-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {currentTime}
                    </span>
                </div>
            </div>
        </div>
    );
};