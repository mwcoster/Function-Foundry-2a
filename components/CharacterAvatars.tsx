import React from 'react';

// --- Sister Mary Samuel (Strategic Advisor) [3] ---
export const SisterMaryAvatar: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#78716C"/>
        <path d="M50 0 L 50 100 A 50 50 0 0 1 50 0 Z" fill="#1C1917"/> {/* Black Veil */}
        <path d="M20 30 C 20 50, 80 50, 80 30 L 75 80 H 25 Z" fill="#F5F5F4"/> {/* White Habit */}
        <circle cx="50" cy="45" r="15" fill="#FDE68A"/> {/* Face */}
        <circle cx="42" cy="45" r="2" fill="#0369A1"/> {/* Eyes */}
        <circle cx="58" cy="45" r="2" fill="#0369A1"/> 
        <path d="M45 55 Q 50 60, 55 55" stroke="#991B1B" strokeWidth="1.5"/> {/* Mouth */}
        <text x="50" y="25" fontSize="8" fill="#F5F5F4" textAnchor="middle" fontFamily="serif">CEO</text>
    </svg>
);

// --- Sonia (Chief of Staff) [3] ---
export const SoniaAvatar: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#3B82F6"/>
        <rect x="10" y="60" width="80" height="40" fill="#1E40AF"/> {/* Blazer */}
        <circle cx="50" cy="40" r="30" fill="#FDE68A"/> {/* Face */}
        <rect x="30" y="35" width="40" height="10" rx="2" fill="none" stroke="#60A5FA" strokeWidth="2"/> {/* Glasses */}
        <circle cx="40" cy="40" r="3" fill="#1F2937"/> {/* Eyes */}
        <circle cx="60" cy="40" r="3" fill="#1F2937"/>
        <path d="M45 50 Q 50 55, 55 50" stroke="#1F2937" strokeWidth="1"/> {/* Professional expression */}
    </svg>
);

// --- Fi-Nancy (The Financial Friend) [4] ---
export const FiNancyAvatar: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#34D399"/>
        <path d="M30 40 L 70 40 L 80 70 L 20 70 Z" fill="#9CA3AF"/> {/* Gnome hat */}
        <circle cx="50" cy="70" r="20" fill="#FDE68A"/> {/* Nose/Face */}
        <path d="M25 70 C 25 85, 75 85, 75 70 Z" fill="#FFFFFF"/> {/* Beard */}
        <rect x="40" y="60" width="20" height="5" fill="#34D399"/> {/* Mouth covering */}
    </svg>
);

// --- Pep (Chief Morale Officer) [4] ---
export const PepAvatar: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#FBCFE8"/>
        <path d="M50 10 L 90 50 L 50 90 L 10 50 Z" fill="#F43F5E"/> {/* Lightning bolt/Mascot shape */}
        <circle cx="50" cy="50" r="25" fill="#FFFFFF"/>
        <circle cx="40" cy="45" r="3" fill="#000000"/> {/* Googly Eyes */}
        <circle cx="60" cy="45" r="3" fill="#000000"/>
        <path d="M40 60 Q 50 70, 60 60" stroke="#000000" strokeWidth="2" fill="none"/> {/* Enthusiastic mouth */}
    </svg>
);

// --- Jake (Coworker / Friend) [4] ---
export const JakeAvatar: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#2DD4BF"/>
        <circle cx="50" cy="45" r="35" fill="#FDE68A"/> {/* Face */}
        <rect x="30" y="70" width="40" height="30" fill="#D1D5DB"/> {/* Shirt */}
        <path d="M20 20 Q 50 5, 80 20 L 75 45 L 25 45 Z" fill="#5A3E2D"/> {/* Hair */}
        <circle cx="40" cy="45" r="4" fill="#10B981"/> {/* Eyes (Teal/Green) */}
        <circle cx="60" cy="45" r="4" fill="#10B981"/>
        <path d="M40 60 Q 50 65, 60 60" stroke="#1F2937" strokeWidth="2"/> {/* Relaxed mouth */}
    </svg>
);

// --- CRITICAL FIX: Bea (The Creative Curator) [1, 6-8] ---
export const BeaAvatar: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#8B5CF6"/> {/* Deep Purple/Dreamy Background */}
        <circle cx="50" cy="40" r="30" fill="#FCE7F6"/> {/* Head/Face */}
        <path d="M50 70 C 65 80, 35 80, 50 70" fill="#E9D5FF"/> {/* Artistic smock/apron collar */}
        
        {/* Dreamy/Wonder Eyes */}
        <circle cx="40" cy="40" r="4" fill="#6D28D9"/> 
        <circle cx="60" cy="40" r="4" fill="#6D28D9"/> 
        <path d="M45 55 Q 50 58, 55 55" stroke="#6D28D9" strokeWidth="1.5"/> {/* Gentle mouth */}

        {/* Artistic details: paint splatter and pencil */}
        <circle cx="30" cy="70" r="5" fill="#FBBF24" opacity="0.7"/> 
        <rect x="70" y="65" width="20" height="3" transform="rotate(45 70 65)" fill="#A78BFA"/>
        <text x="50" y="15" fontSize="10" fill="#FFFFFF" textAnchor="middle" fontFamily="serif">Curate</text>
    </svg>
);

// --- Generic Avatars for Body Double Room [5] ---
const GenericAvatar1: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} viewBox="0 0 100 100" fill="#4B5563"><circle cx="50" cy="50" r="45"/></svg>
);

const GenericAvatar2: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} viewBox="0 0 100 100" fill="#6B7280"><rect x="10" y="10" width="80" height="80" rx="10"/></svg>
);

const GenericAvatar3: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} viewBox="0 0 100 100" fill="#9CA3AF"><path d="M50 0 L 100 100 L 0 100 Z"/></svg>
);

const GenericAvatar4: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} viewBox="0 0 100 100" fill="#D1D5DB"><circle cx="50" cy="50" r="40" fill="#D1D5DB"/><rect x="30" y="60" width="40" height="20" fill="#9CA3AF"/></svg>
);

export const GENERIC_AVATARS = [GenericAvatar1, GenericAvatar2, GenericAvatar3, GenericAvatar4];
