import React from 'react';
import { CharacterData, HubId } from '../hooks/types';

interface CharacterProps {
    character: CharacterData;
    onClick: () => void;
    isSanctuary: boolean;
    hasProcrastinationAlert?: boolean;
}

export const Character = React.forwardRef<HTMLDivElement, CharacterProps>(({ character, onClick, isSanctuary, hasProcrastinationAlert }, ref) => {
    const AvatarComponent = character.avatar;
    const isCEO = character.id === HubId.SisterMary;
    const sizeClass = isCEO ? 'w-28 h-28' : 'w-24 h-24';

    return (
        <div
            ref={ref}
            className={`group relative flex flex-col items-center cursor-pointer transform transition-transform duration-300 hover:scale-110 ${sizeClass} animate-[idle-bob_5s_ease-in-out_infinite]`}
            style={{ animationDelay: `${Math.random() * 1}s`}}
            onClick={onClick}
            title={`Chat with ${character.name}`}
        >
            <div className={`relative w-full h-full drop-shadow-lg rounded-full overflow-hidden p-1 bg-slate-200/80 shadow-lg ${isSanctuary ? 'grayscale' : ''}`}>
                 <div className="w-full h-full rounded-full overflow-hidden ring-2 ring-slate-700/80">
                    {typeof AvatarComponent === 'string' 
                        ? <img src={AvatarComponent} alt={character.name} className="w-full h-full object-cover" />
                        : <AvatarComponent className="w-full h-full" />
                    }
                </div>
                 {hasProcrastinationAlert && character.id === HubId.SisterMary && (
                    <div className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-lg animate-fade-in">
                        <div className="w-6 h-6 text-slate-600">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});