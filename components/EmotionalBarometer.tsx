import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CharacterData } from '../hooks/types';

interface EmotionalBarometerProps {
character: CharacterData;
}

// NOTE: Updated Emotional States for RSD/Executive Exhaustion protocols
type EmotionalState = 'Overwhelmed/Chaos' | 'Dread/Avoidance' | 'Shame/Failure';

export const EmotionalBarometer: React.FC<EmotionalBarometerProps> = ({ character }) => {
const [isLoading, setIsLoading] = useState(false);
const [menu, setMenu] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);

const handleLogState = async (state: EmotionalState) => {
setIsLoading(true);
setMenu(null);
setError(null);

try {
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// NOTE: Customized prompt for Sister Mary Samuel's specialized interventions
const prompt = `You are ${character.name}, the Strategic Advisor. The user has logged the critical emotional state: "${state}".

Your goal is to provide specific, actionable interventions.

If the state is 'Overwhelmed/Chaos', provide 3 interventions focused on externalizing thought (e.g., capture, brain dumping, physical movement).
If the state is 'Dread/Avoidance', provide 3 interventions focused on breaking a task into a tiny, specific first step (e.g., scripting the first sentence of an email).
If the state is 'Shame/Failure', provide 3 interventions focused on reframing the setback as 'data, not a moral failing' (RSD Protocol).

Provide a "Co-Regulation Menu" of 3 simple, actionable interventions. Frame it with kindness and encouragement. Format the response as a simple list with each item on a new line, prefixed with a hyphen. Do not add any intro, outro, or other commentary.`;

const response = await ai.models.generateContent({
model: 'gemini-2.5-flash',
contents: prompt,
});

setMenu(response.text);

} catch (e) {
console.error(e);
setError('Could not generate suggestions at this time.');
} finally {
setIsLoading(false);
}
};

// NOTE: Updated Emotional States array
const states: { name: EmotionalState, emoji: string, color: string, style: string }[] = [
{ name: 'Overwhelmed/Chaos', emoji: '🌀', color: 'red', style: 'bg-red-200/60 border-red-300/50 hover:bg-red-300/80 text-red-800'},
{ name: 'Dread/Avoidance', emoji: '🛡️', color: 'slate', style: 'bg-slate-200/60 border-slate-300/50 hover:bg-slate-300/80 text-slate-800'},
{ name: 'Shame/Failure', emoji: '💔', color: 'purple', style: 'bg-purple-200/60 border-purple-300/50 hover:bg-purple-300/80 text-purple-800'}
];

return (
<div className="p-4 sm:p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg w-full max-w-2xl animate-fade-in-up border border-white/30 font-sans">
<div className="flex items-center gap-3 mb-4">
<span className="text-3xl" aria-hidden="true">🌡️</span>
<h2 className="text-2xl font-bold text-slate-700 font-serif">Emotional Barometer</h2>
</div>
<p className="text-slate-600 mb-4 text-sm">Check in with yourself. How are you feeling right now?</p>

<div className="grid grid-cols-3 gap-4 mb-4">
{states.map(({ name, emoji, style }) => (
<button
key={name}
onClick={() => handleLogState(name)}
disabled={isLoading}
className={`p-4 rounded-lg border text-center transition-colors disabled:opacity-50 ${style}`}
>
<span className="text-4xl">{emoji}</span>
<p className={`font-semibold text-lg mt-2`}>{name}</p>
</button>
))}
</div>

{isLoading && <p className="text-center text-slate-600 font-medium mt-4">Sister Mary is preparing some thoughts for you...</p>}
{error && <p className="text-red-500 text-center font-medium mt-4">{error}</p>}

{menu && (
<div className="mt-4 p-4 bg-
stone-100/50 rounded-lg border border-stone-200/50 animate-fade-in">
<h3 className="font-semibold text-slate-700 mb-2">Sister Mary's Suggestions for You:</h3>
<ul className="list-disc list-inside text-slate-800 space-y-1">
{menu.split('\n').map((item, index) => (
item.trim().length > 0 && <li key={index}>{item.trim().replace(/^- /, '')}</li>
))}
</ul>
</div>
)}
</div>
);
};