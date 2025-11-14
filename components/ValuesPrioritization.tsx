import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CapturedItem } from '../hooks/types';

interface ValuesPrioritizationProps {
    userValues: string[];
    onSetUserValues: (values: string[]) => void;
    questItems: CapturedItem[];
}

export const ValuesPrioritization: React.FC<ValuesPrioritizationProps> = ({ userValues, onSetUserValues, questItems }) => {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<string | null>(null);

    const handleAddValue = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue && !userValues.includes(inputValue)) {
            onSetUserValues([...userValues, inputValue]);
            setInputValue('');
        }
    };

    const handleRemoveValue = (valueToRemove: string) => {
        onSetUserValues(userValues.filter(value => value !== valueToRemove));
    };

    const handleGetSuggestion = async () => {
        if (userValues.length === 0 || questItems.length === 0) return;
        setIsLoading(true);
        setSuggestion(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `You are Sonia, a hyper-competent Chief of Staff. Based on the user's core values and their current quest log, suggest the single most important quest to focus on next and briefly explain why it aligns with their values.

Core Values:
${userValues.join(', ')}

Quest Log:
${questItems.map(q => `- ${q.text}`).join('\n')}

Respond with the suggested quest text first, followed by a colon, and then your brief reasoning. For example: "Suggested Quest: Your reasoning here."`;
            
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setSuggestion(response.text);

        } catch (e) {
            console.error(e);
            setSuggestion("I had trouble analyzing the quests. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="p-4 sm:p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg w-full animate-fade-in-up border border-white/30 font-sans">
            <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl" aria-hidden="true">🧭</span>
                <h2 className="text-2xl font-bold text-slate-700 font-serif">Values-Based Prioritization</h2>
            </div>
            <p className="text-slate-600 mb-4 text-sm">Define what's important to you, then let Sonia help you focus.</p>

            <div className="mb-4">
                <form onSubmit={handleAddValue} className="flex gap-2">
                    <input 
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="Add a core value (e.g., Creativity)"
                        className="w-full p-2 bg-white/60 border-2 border-slate-300/40 rounded-md shadow-inner"
                    />
                    <button type="submit" className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-800 transition-colors">Add</button>
                </form>
                <div className="mt-2 flex flex-wrap gap-2">
                    {userValues.map(value => (
                        <div key={value} className="bg-slate-200/70 text-slate-800 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2">
                            <span>{value}</span>
                            <button onClick={() => handleRemoveValue(value)} className="text-slate-600 hover:text-slate-800">&times;</button>
                        </div>
                    ))}
                </div>
            </div>

            {userValues.length > 0 && questItems.length > 0 && (
                 <div className="text-center mt-4 p-4 bg-stone-100/50 rounded-lg border border-stone-200/50">
                    <button onClick={handleGetSuggestion} disabled={isLoading} className="px-6 py-2 bg-slate-700 text-white font-semibold rounded-full shadow-md hover:bg-slate-800 transition-all disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed">
                        {isLoading ? "Analyzing..." : "Ask Sonia for Priority Advice"}
                    </button>
                    {suggestion && (
                        <div className="mt-4 p-3 bg-white/80 border border-slate-200 rounded-lg text-slate-900 animate-fade-in text-left">
                            <p className="font-semibold">Sonia's Suggestion:</p>
                            <p>{suggestion}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};