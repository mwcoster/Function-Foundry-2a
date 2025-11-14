import React, { useState } from 'react';
import { CapturedItem } from '../hooks/types';

interface SomedayMaybeSafariProps {
    items: CapturedItem[];
    onPromoteToQuest: (itemId: string) => void;
    onDeleteItem: (itemId: string) => void;
    onBack: () => void;
}

export const SomedayMaybeSafari: React.FC<SomedayMaybeSafariProps> = ({ items, onPromoteToQuest, onDeleteItem, onBack }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (items.length > 0) {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
        }
    };
    
    const handlePromote = (itemId: string) => {
        onPromoteToQuest(itemId);
        if (items.length <= 1) { 
            onBack();
        } else if (currentIndex >= items.length - 1) {
            setCurrentIndex(0);
        }
    }
    
    const handleDelete = (itemId: string) => {
        onDeleteItem(itemId);
        if (items.length <= 1) {
            onBack();
        } else if (currentIndex >= items.length - 1) {
            setCurrentIndex(0);
        }
    }

    const currentItem = items.length > 0 ? items[currentIndex] : null;

    return (
        <div className="w-full max-w-2xl bg-stone-100/70 backdrop-blur-sm rounded-2xl shadow-lg border border-stone-200/50 font-sans flex flex-col animate-fade-in-up p-4 sm:p-6 text-center">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden="true">🧭</span>
                    <h2 className="text-2xl font-bold text-slate-700 font-serif">Someday/Maybe Safari</h2>
                </div>
                <button onClick={onBack} className="px-4 py-2 bg-slate-200/70 text-slate-800 font-semibold rounded-lg hover:bg-slate-300/80 transition-colors shadow-sm text-sm">Back to Hub</button>
            </div>
            
            <p className="text-slate-600 my-4 text-sm max-w-md mx-auto">
                "It's time for our 'Someday/Maybe Safari.' We're not here to do anything, just to admire the magnificent ideas we've captured."
            </p>

            <div className="flex-grow flex flex-col items-center justify-center p-4 min-h-[200px]">
                {currentItem ? (
                    <div className="w-full p-6 bg-yellow-200 shadow-lg rounded-md border border-yellow-300 transform -rotate-1 animate-fade-in">
                        <p className="font-serif text-xl text-slate-800">{currentItem.text}</p>
                    </div>
                ) : (
                    <div className="text-center py-8 px-4">
                        <span className="text-4xl">🦋</span>
                        <p className="mt-3 font-semibold text-slate-600">The safari is quiet today.</p>
                        <p className="text-slate-500 text-sm">Your Omni-Inbox is empty of old ideas. Capture some new ones!</p>
                    </div>
                )}
            </div>

            {currentItem && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-4">
                    <button onClick={() => handleDelete(currentItem.id)} className="px-4 py-2 bg-white/80 text-red-600 font-semibold rounded-lg shadow-sm hover:bg-red-50 transition-colors">Let it Go</button>
                    <button onClick={handleNext} className="px-6 py-3 bg-gradient-to-br from-yellow-500 to-orange-500 text-white font-semibold rounded-lg shadow-lg shadow-yellow-500/30 hover:from-yellow-600 hover:to-orange-600 transition-all">Next Idea</button>
                    <button onClick={() => handlePromote(currentItem.id)} className="px-4 py-2 bg-white/80 text-green-600 font-semibold rounded-lg shadow-sm hover:bg-green-50 transition-colors">Make it a Quest</button>
                </div>
            )}
        </div>
    );
};