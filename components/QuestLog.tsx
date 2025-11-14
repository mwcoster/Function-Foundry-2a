import React from 'react';
import { CapturedItem } from '../hooks/types';

interface QuestLogProps {
    items: CapturedItem[];
    onCompleteQuest: (itemId: string) => void;
    onStartBossBattle: (item: CapturedItem) => void;
    onPostponeQuest: (itemId: string) => void;
    isFocusMode: boolean;
    onToggleFocusMode: (enabled: boolean) => void;
    focusQuestId: string | null;
    isFocusLoading: boolean;
    focusError: string | null;
}

const QuestItem: React.FC<{
    item: CapturedItem;
    index: number;
    onPostponeQuest: (itemId: string) => void;
    onStartBossBattle: (item: CapturedItem) => void;
    handleComplete: (e: React.MouseEvent<HTMLButtonElement>, itemId: string) => void;
    isFocus?: boolean;
}> = ({ item, index, onPostponeQuest, onStartBossBattle, handleComplete, isFocus = false }) => (
    <div 
        role="listitem"
        className={`bg-white/70 p-3 rounded-lg shadow-sm flex justify-between items-center border border-white/50 group animate-fade-in-up ${isFocus ? 'ring-2 ring-indigo-400 shadow-lg' : ''}`}
        style={{ animationDelay: `${index * 50}ms`}}
    >
        <p className="text-slate-800 text-left flex-grow mr-2">{item.text} {item.postponedCount && item.postponedCount > 0 ? `(${item.postponedCount})` : ''}</p>
        <div className="flex-shrink-0 flex items-center gap-1">
            <button 
                onClick={() => onPostponeQuest(item.id)}
                className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-100 rounded-full transition-colors opacity-50 group-hover:opacity-100"
                aria-label={`Postpone quest: ${item.text}`}
                title="Postpone Quest"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
            </button>
            <button 
                onClick={() => onStartBossBattle(item)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors opacity-50 group-hover:opacity-100"
                aria-label={`Start Boss Battle for: ${item.text}`}
                title="Start Boss Battle"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-2.382l6.553 3.276A1 1 0 0018 17V3z" />
                </svg>
            </button>
            <button 
                onClick={(e) => handleComplete(e, item.id)}
                className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-all shadow-sm text-sm transform group-hover:scale-105"
                aria-label={`Complete quest: ${item.text}`}
                title="Complete Quest"
            >
                Complete
            </button>
        </div>
    </div>
);


export const QuestLog: React.FC<QuestLogProps> = ({ items, onCompleteQuest, onStartBossBattle, onPostponeQuest, isFocusMode, onToggleFocusMode, focusQuestId, isFocusLoading, focusError }) => {
    
    const handleComplete = (e: React.MouseEvent<HTMLButtonElement>, itemId: string) => {
        onCompleteQuest(itemId);
    }
    
    const focusQuest = items.find(item => item.id === focusQuestId);
    
    return (
        <div className="p-4 sm:p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg w-full max-w-2xl animate-fade-in-up border border-white/30 font-sans">
            <div className="flex items-center justify-between gap-3 mb-4 px-2 sm:px-0">
                <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden="true">🗺️</span>
                    <h2 id="quest-log-heading" className="text-2xl font-bold text-slate-700 font-serif">Quest Log</h2>
                </div>
                {items.length > 0 && (
                    <div className="flex items-center gap-2">
                        <label htmlFor="focus-toggle" className="text-sm font-semibold text-slate-600 cursor-pointer">Focus Mode</label>
                        <button
                            role="switch"
                            aria-checked={isFocusMode}
                            id="focus-toggle"
                            onClick={() => onToggleFocusMode(!isFocusMode)}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isFocusMode ? 'bg-indigo-500' : 'bg-slate-300'}`}
                        >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isFocusMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                )}
            </div>
            
            {focusError && <p className="text-red-500 text-center text-sm mb-2">{focusError}</p>}

            <div role="list" aria-labelledby="quest-log-heading" className="max-h-80 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {isFocusLoading ? (
                    <div className="text-center py-8 px-4">
                        <p className="font-semibold text-slate-600 animate-pulse">Sonia is focusing...</p>
                    </div>
                ) : isFocusMode ? (
                    focusQuest ? (
                        <QuestItem item={focusQuest} index={0} onPostponeQuest={onPostponeQuest} onStartBossBattle={onStartBossBattle} handleComplete={handleComplete} isFocus={true} />
                    ) : (
                        <div className="text-center py-8 px-4">
                            <p className="font-semibold text-slate-600">No focus quest identified.</p>
                            <p className="text-slate-500 text-sm">Turn off Focus Mode to see all quests.</p>
                        </div>
                    )
                ) : items.length > 0 ? (
                    items.map((item, index) => (
                        <QuestItem key={item.id} item={item} index={index} onPostponeQuest={onPostponeQuest} onStartBossBattle={onStartBossBattle} handleComplete={handleComplete} />
                    ))
                ) : (
                     <div className="text-center py-8 px-4">
                        <span className="text-4xl">🧘</span>
                        <p className="mt-3 font-semibold text-slate-600">The path is clear.</p>
                        <p className="text-slate-500 text-sm">Promote an item from your inbox to start a new quest.</p>
                    </div>
                )}
            </div>
        </div>
    );
};