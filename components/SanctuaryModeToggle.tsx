import React from 'react';

interface SanctuaryModeToggleProps {
    enabled: boolean;
    onToggle: () => void;
}

export const SanctuaryModeToggle: React.FC<SanctuaryModeToggleProps> = ({ enabled, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            title={enabled ? "Disable Sanctuary Mode" : "Enable Sanctuary Mode"}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 bg-slate-800 text-white/80 hover:bg-slate-700 hover:text-white"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
        </button>
    );
};