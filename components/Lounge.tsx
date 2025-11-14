import React from 'react';
import { Character } from './Character'; // CORRECTED: Importing the functional Character component
import { CharacterData, HubId } from '../hooks/types';
import { CHARACTERS } from '../constants';

interface LoungeProps {
  characters: CharacterData[];
  onSelectHub: (id: HubId) => void;
  isSanctuary: boolean;
  procrastinationAlertQuestId: string | null;
}

export const Lounge: React.FC<LoungeProps> = ({ 
  characters, 
  onSelectHub, 
  isSanctuary,
  procrastinationAlertQuestId
}) => {
  // Sort characters for diegetic display order: Sister Mary (top), then functional roles
  const sisterMary = characters.find(c => c.id === HubId.SisterMary);
  const otherCharacters = characters.filter(c => c.id !== HubId.SisterMary).sort((a, b) => {
    // Custom sort logic to ensure predictable layout for the 6 hubs
    // Using an established order: Sonia, FiNancy, Pep, Jake, Bea
    const order: HubId[] = [HubId.Sonia, HubId.FiNancy, HubId.Pep, HubId.Jake, HubId.Bea];
    return order.indexOf(a.id) - order.indexOf(b.id);
  });
  
  // NOTE: The Character component handles rendering the avatar and click events (Source [1]).

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 pt-8 sm:pt-16 relative">
      <div className="text-center mb-8 sm:mb-12 z-10">
        <h1 className="text-6xl sm:text-7xl font-bold text-stone-100 font-lounge-title tracking-normal" style={{textShadow: '2px 2px 8px rgba(45, 55, 72, 0.6)'}}>the Lounge</h1>
        <p className="text-slate-800 mt-2 text-xl font-serif italic">Your sanctuary for focus and creativity.</p>
      </div>

      {/* Main Character Grid (Diegetic Interface) */}
      <div className="w-full max-w-lg flex-grow grid grid-rows-[auto_auto] grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 items-center justify-items-center px-4 z-20 pb-32">
        {/* Top Row: Sister Mary Samuel (Strategic Advisor) */}
        {sisterMary && (
          <div className="col-span-2 md:col-span-3 flex justify-center items-center py-4">
            <Character
              key={sisterMary.id}
              character={sisterMary}
              onClick={() => onSelectHub(sisterMary.id)}
              isSanctuary={isSanctuary}
              // Sister Mary is the point of intervention for RSD (Course Correction Compass)
              hasProcrastinationAlert={procrastinationAlertQuestId !== null}
            />
          </div>
        )}

        {/* Bottom Rows: Functional Roles (The rest of the Executive Suite) */}
        {otherCharacters.map(char => (
          <div key={char.id} className="col-span-1">
            <Character
              character={char}
              onClick={() => onSelectHub(char.id)}
              isSanctuary={isSanctuary}
            />
          </div>
        ))}
      </div>
      
      {/* Ensures the UI is low-stimulation below the characters in Sanctuary Mode */}
      <div className="fixed inset-0 top-1/2 bg-white/20 z-0 opacity-10 transition-opacity duration-1000" style={{ opacity: isSanctuary ? 0.05 : 0 }} />
    </div>
  );
};