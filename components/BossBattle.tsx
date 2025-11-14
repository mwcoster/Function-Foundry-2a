import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CapturedItem } from '../hooks/types';

interface BossBattleProps {
  quest: CapturedItem;
  onClose: () => void;
  onComplete: (questId: string) => void;
  // NOTE: In a full app, this component would also receive powerUpCount and a handler to use one.
  // We simulate the count internally for implementation purposes.
}

interface HitPoint {
  id: string;
  text: string;
  isComplete: boolean;
}

export const BossBattle: React.FC<BossBattleProps> = ({ quest, onClose, onComplete }) => {
  const [hitPoints, setHitPoints] = useState<HitPoint[]>([]);
  const [newHitPoint, setNewHitPoint] = useState('');
  const [isVictory, setIsVictory] = useState(false);
  // SIMULATION: Internal state for power-ups (e.g., earned by completing small rituals)
  const [powerUpCount, setPowerUpCount] = useState(3);
  
  const totalHitPoints = hitPoints.length;
  const completedHitPoints = hitPoints.filter(hp => hp.isComplete).length;
  // Base health is calculated from completed sub-tasks
  const baseHealth = totalHitPoints > 0 ? (1 - (completedHitPoints / totalHitPoints)) * 100 : 100;
  
  // State to track health reduction from power-ups
  const [powerUpReduction, setPowerUpReduction] = useState(0);
  
  // Final Boss Health, including power-up damage
  const bossHealth = Math.max(0, baseHealth - powerUpReduction);


  useEffect(() => {
    // Check for win condition based on total health (including power-up damage)
    if (bossHealth <= 0 && !isVictory) {
      const timer = setTimeout(() => {
        setIsVictory(true);
      }, 500);
      return () => clearTimeout(timer);
    }
    
    // Check for win condition based purely on Hit Points if no power-ups used or available
    if (totalHitPoints > 0 && completedHitPoints === totalHitPoints && powerUpReduction === 0) {
      const timer = setTimeout(() => {
        setIsVictory(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [completedHitPoints, totalHitPoints, bossHealth, isVictory, powerUpReduction]);


  const handleAddHitPoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHitPoint.trim()) {
      setHitPoints(prev => [...prev, { id: uuidv4(), text: newHitPoint.trim(), isComplete: false }]);
      setNewHitPoint('');
    }
  };

  const toggleHitPoint = (id: string) => {
    setHitPoints(prev => prev.map(hp => hp.id === id ? { ...hp, isComplete: !hp.isComplete } : hp));
  };
  
  // NEW: Logic to consume a power-up and reduce boss health by 25% (simulating "Slice 15 Minutes Off")
  const handleUsePowerUp = () => {
      if (powerUpCount > 0) {
          setPowerUpCount(prev => prev - 1);
          setPowerUpReduction(prev => prev + 25); // Each power up deals 25% damage
          // If the damage is enough to win, ensure health goes to 0
          if (bossHealth - 25 <= 0) {
              setIsVictory(true);
          }
      }
  };

  const handleVictoryClose = () => {
    onComplete(quest.id);
  };

  if (isVictory) {
    return (
      <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4 animate-fade-in backdrop-blur-md">
        <div className="relative bg-white/80 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center transform transition-all animate-fade-in-up font-sans">
          <span className="text-6xl">🏆</span>
          <h2 className="text-3xl font-bold text-slate-800 font-serif mt-4">Boss Battle Victorious!</h2>
          <p className="text-slate-600 mt-2">You successfully vanquished the Dragon:</p>
          <p className="font-semibold text-slate-700 mt-1 mb-6">"{quest.text}"</p>
          <button onClick={handleVictoryClose} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md">
            Claim Your Trophy
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4 animate-fade-in backdrop-blur-md" onClick={onClose}>
      <div className="relative bg-white/70 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl w-full max-w-lg p-8 transform transition-all animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <h2 className="text-3xl font-bold text-slate-800 font-serif text-center mb-2">Boss Battle: Dragon Slayer Protocol</h2>
        <p className="text-xl font-semibold text-slate-700 text-center mb-6">"{quest.text}"</p>

        {/* Boss Health Bar */}
        <div className="w-full h-8 bg-red-800/20 rounded-full overflow-hidden mb-4 shadow-inner">
          <div 
            className="bg-sky-500 h-full rounded-full transition-all duration-500 ease-out text-right pr-2 text-white font-bold text-sm flex items-center justify-end"
            style={{ width: `${bossHealth}%` }}
          >
            {Math.round(bossHealth)}% Health Remaining
          </div>
        </div>

        {/* Power Up Section */}
        <div className="flex justify-between items-center mb-4 p-3 bg-indigo-100/50 rounded-lg border border-indigo-200/50">
            <p className="text-sm font-semibold text-indigo-800 flex items-center gap-2">
                <span className="text-xl">✨</span> Power-Ups Available: {powerUpCount}
            </p>
            <button
                onClick={handleUsePowerUp}
                disabled={powerUpCount === 0 || bossHealth === 0}
                className="px-4 py-1 bg-indigo-500 text-white text-sm font-semibold rounded-md shadow-md hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
                Use Power-Up (-25% Health)
            </button>
        </div>

        <div className="flex-grow max-h-60 overflow-y-auto custom-scrollbar pr-2 space-y-2">
          <h3 className="font-semibold text-slate-700">Hit Points (Sub-tasks)</h3>
          {hitPoints.map(hp => (
            <div key={hp.id} className={`p-2 rounded-md flex items-center gap-3 transition-all ${hp.isComplete ? 'bg-green-100/50 text-slate-500 line-through' : 'bg-white/60'}`}>
              <input type="checkbox" checked={hp.isComplete} onChange={() => toggleHitPoint(hp.id)} className="w-5 h-5 rounded text-green-500 focus:ring-green-400" />
              <label className="flex-grow">{hp.text}</label>
            </div>
          ))}
          {!hitPoints.length && <p className="text-sm text-slate-500 text-center py-4">No hit points yet. Add the first tiny step!</p>}
        </div>

        <form onSubmit={handleAddHitPoint} className="flex-shrink-0 flex gap-2 pt-4 border-t border-white/50">
          <input 
            type="text" 
            value={newHitPoint}
            onChange={e => setNewHitPoint(e.target.value)}
            placeholder="Add a tiny, easy first step..."
            className="w-full p-2 bg-white/60 border-2 border-slate-300/40 rounded-md shadow-inner"
          />
          <button type="submit" className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-800 transition-colors">Add</button>
        </form>

      </div>
    </div>
  );
};