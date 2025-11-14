import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CapturedItem, CharacterData } from '../hooks/types';

interface TrophyRoomProps {
completedQuests: CapturedItem[];
character: CharacterData;
}

export const TrophyRoom: React.FC<TrophyRoomProps> = ({ completedQuests, character }) => {
const [cheers, setCheers] = useState<Record<string, { loading: boolean; message: string | null }>>({});

const handleGetCheer = async (quest: CapturedItem) => {
setCheers(prev => ({ ...prev, [quest.id]: { loading: true, message: null } }));
try {
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// NOTE: Corrected prompt for simple, concise validation (max 15 words, max 1 emoji/exclamation mark)
const prompt = `You are Pep, the Chief Morale Officer. The user just completed this quest: "${quest.text}". Provide simple, brief validation for this accomplishment. Keep the message under 15 words and use a maximum of one emoji (or none) and one exclamation point (or none). The tone must be genuine, validating, and concise, respecting the user's Artisan Philosopher archetype's need for intellectual respect.`;

const response = await ai.models.generateContent({
model: 'gemini-2.5-flash',
contents: prompt,
});

setCheers(prev => ({ ...prev, [quest.id]: { loading: false, message: response.text } }));
} catch (e) {
console.error(e);
setCheers(prev => ({ ...prev, [quest.id]: { loading: false, message: "My pom-poms are tangled! Try again in a moment." } }));
}
};

return (
<div className="mt-8 p-4 sm:p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg w-full max-w-2xl animate-fade-in-up border bord
er-white/30 font-sans">
<div className="flex items-center gap-3 mb-4 px-2 sm:px-0">
<span className="text-3xl" aria-hidden="true">🏆</span>
<h2 id="trophy-room-heading" className="text-2xl font-bold text-slate-700 font-serif">Trophy Shelf</h2>
</div>
<p className="text-slate-600 text-sm mb-4 text-center">Click on a trophy to get a personalized cheer from Pep!</p>

<div role="list" aria-labelledby="trophy-room-heading" className="max-h-96 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
{completedQuests.length > 0 ? (
completedQuests.map((quest, index) => (
<div 
key={quest.id} 
role="listitem" 
className="bg-stone-100 p-3 rounded-lg shadow-sm border border-stone-200/50 animate-fade-in-up"
style={{ animationDelay: `${index * 50}ms`}}
>
<button 
onClick={() => handleGetCheer(quest)}
disabled={cheers[quest.id]?.loading}
className="w-full flex items-center text-left group transition-transform duration-200 hover:sca
le-[1.02]"
>
<span className="text-2xl mr-4 group-hover:animate-bounce" aria-hidden="true">🏅</span>
<p className="text-stone-900 flex-grow">{quest.text}</p>
<span className="text-pink-500 font-bold text-sm ml-2 opacity-0 group-hover:opacity-100 transition-opacity">Get Cheer!</span>
</button>
{cheers[quest.id]?.loading && (
<div className="text-center text-sm text-slate-500 mt-2">Pep is warming up...</div>
)}
{cheers[quest.id]?.message && (
<div className="mt-3 pt-3 border-t border-pink-200/50">
<div className="p-3 bg-white/80 border border-pink-200 rounded-lg text-pink-800 animate-fade-in">
<p className="font-medium">{cheers[quest.id]?.message}</p>
</div>
</div>
)}
</div>
))
) : (
<div className="text-center py-8 px-4">
<span className="text-4xl">✨</span>
<p className="mt-3 font-semibold text-slate-600">Your First Trophy Awaits!</p>
<p className="text-slate-500 text-sm">Complete a quest in the Ques
t Log to earn a trophy.</p>
</div>
)}
</div>
</div>
);
};