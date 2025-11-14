import React from 'react';
import { TimeOfDay } from '../hooks/types';

export const HubContainer: React.FC<{ children: React.ReactNode; timeOfDay: TimeOfDay; }> = ({ children, timeOfDay }) => {
    
    const skyFill = {
        day: 'rgba(135, 206, 235, 0.7)', // Light Sky Blue
        dusk: 'rgba(70, 130, 180, 0.7)',  // Steel Blue
        night: 'rgba(12, 20, 69, 0.9)',    // Dark Navy
    }[timeOfDay];

    const godRaysFill = {
        day: 'rgba(255, 253, 240, 0.3)', // Soft daylight
        dusk: 'rgba(255, 165, 0, 0.2)',  // Warm orange dusk
        night: 'rgba(200, 220, 255, 0.1)' // Cool moonlight
    }[timeOfDay];
    
    const starsOpacity = timeOfDay === 'night' ? 1 : 0;

    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-[#EAE3D9]">
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 800 600"
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0 w-full h-full object-cover -z-10"
            >
                {/* Base color */}
                <rect width="800" height="600" fill="#EAE3D9" />

                {/* Sky and Trees outside window */}
                <g id="window-view" style={{ transition: 'all 1s ease-in-out' }}>
                    <path d="M 450 100 A 150 150 0 0 1 750 100 L 750 450 L 450 450 Z" fill={skyFill} />
                    <circle cx="530" cy="480" r="100" fill="rgba(60, 179, 113, 0.6)" />
                    <circle cx="680" cy="460" r="120" fill="rgba(46, 139, 87, 0.6)" />
                     <g id="Stars" opacity={starsOpacity} style={{ transition: 'opacity 1s ease-in-out' }}>
                        <circle fill="#FFFFFF" cx="550" cy="200" r="1.5" />
                        <circle fill="#FFFFFF" cx="650" cy="180" r="1" />
                        <circle fill="#FFFFFF" cx="700" cy="250" r="2" />
                        <circle fill="#FFFFFF" cx="600" cy="300" r="1.2" />
                    </g>
                </g>

                {/* Room Structure (lines) */}
                <g id="room-lines" stroke="#4D443E" strokeWidth="2" fill="none">
                    {/* Floor */}
                    <path d="M 0 550 L 800 550" />
                    <path d="M 0 520 L 800 520" />
                    <path d="M 0 490 L 800 490" />
                    <path d="M 0 460 L 800 460" />
                     {/* Back wall */}
                    <path d="M 0 430 L 800 430" />
                    {/* Window */}
                    <path d="M 450 100 A 150 150 0 0 1 750 100 L 750 450 L 450 450 Z" />
                    <line x1="600" y1="100" x2="600" y2="450" />
                    <line x1="450" y1="275" x2="750" y2="275" />
                    {/* Whiteboard */}
                    <rect x="100" y="200" width="250" height="150" />
                    <line x1="100" y1="380" x2="350" y2="380" />
                </g>
                
                 {/* God Rays */}
                <g id="lighting" style={{ transition: 'fill 1s ease-in-out' }} fill={godRaysFill}>
                    <polygon points="450 100, 300 550, 400 550" />
                    <polygon points="525 100, 425 550, 500 550" />
                    <polygon points="675 100, 625 550, 700 550" />
                </g>

                 {/* Text on whiteboard */}
                <text x="225" y="280" fontFamily="Caveat, cursive" fontSize="40" fill="#4D443E" textAnchor="middle">
                    AGENDA
                </text>
            </svg>
            <div className="relative z-10">
                {children}
            </div>
        </main>
    );
};
