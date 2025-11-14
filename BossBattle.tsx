import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CapturedItem } from '../hooks/types';

interface BossBattleProps {
    quest: CapturedItem;
    onClose: () => void;
    onComplete: (questId: string) => void;
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

    const totalHitPoints = hitPoints.length;
    const completedHitPoints = hitPoints.filter(hp => hp.isComplete).length;
    const bossHealth = totalHitPoints > 0 ? (1 - (completedHitPoints / totalHitPoints)) * 100 : 100;

    useEffect(() => {
        if (totalHitPoints > 0 && completedHitPoints === totalHitPoints) {
            const timer = setTimeout(() => {
                setIsVictory(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [completedHitPoints, totalHitPoints]);


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

    const handleVictoryClose = () => {
        onComplete(quest.id);
    };

    if (isVictory) {
        return (
             <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4 animate-fade-in backdrop-blur-md">
                <div className="relative bg-white/80 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center transform transition-all animate-fade-in-up font-sans">
                    <span className="text-6xl">🏆</span>
                    <h2 className="text-3xl font-bold text-slate-800 font-serif mt-4">Quest Complete!</h2>
                    <p className="text-slate-600 mt-2">You successfully tackled:</p>
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
            <div className="relative bg-white/70 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl w-full max-w-xl p-6 transform transition-all animate-fade-in-up font-sans flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex-shrink-0 text-center">
                    <h2 className="text-2xl font-bold text-slate-800 font-serif">Boss Battle</h2>
                    <p className="text-slate-600 mt-1">Defeat this dreaded quest by breaking it down.</p>
                    <p className="font-semibold text-lg text-slate-800 bg-slate-100/50 border border-slate-200/50 py-2 px-4 rounded-lg my-4">"{quest.text}"</p>
                    
                    {/* Boss Health Bar */}
                    <div className="w-full bg-slate-300 rounded-full h-6 my-4 shadow-inner border border-white/50">
                        <div 
                            className="bg-sky-500 h-full rounded-full transition-all duration-500 ease-out text-right pr-2 text-white font-bold text-sm flex items-center justify-end"
                            style={{ width: `${bossHealth}%` }}
                        >
                           <span className="drop-shadow-sm">{Math.round(bossHealth)}%</span>
                        </div>
                    </div>
                </div>

                <div className="flex-grow my-4 overflow-y-auto custom-scrollbar pr-2 space-y-2">
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