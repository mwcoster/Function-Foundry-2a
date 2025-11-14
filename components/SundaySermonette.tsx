import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CharacterData, CapturedItem } from '../hooks/types';

interface SundaySermonetteProps {
    character: CharacterData;
    completedQuests: CapturedItem[];
}

export const SundaySermonette: React.FC<SundaySermonetteProps> = ({ character, completedQuests }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [sermon, setSermon] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setSermon(null);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const completedTexts = completedQuests.length > 0 
                ? completedQuests.map(q => `- ${q.text}`).join('\n')
                : "The user hasn't completed any quests this week. Reflect on the value of rest and preparation.";

            const prompt = `You are ${character.name}, the ${character.title}. Your personality is calm, reflective, and empathetic. Your goal is to provide support for emotional regulation, reframing negative self-talk, and connecting daily tasks to deeper meaning and values.
            
            Based on the following completed tasks from this past week, deliver a short, personalized weekly reflection (a "Sunday Sermonette"). It should connect a spiritual or philosophical theme to the user's actual logged activities and challenges. Keep it under 150 words.
            
            Completed tasks:
            ${completedTexts}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setSermon(response.text);

        } catch (e) {
            console.error(e);
            setError('Could not generate reflection at this time.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg w-full max-w-2xl animate-fade-in-up border border-white/30 font-sans">
            <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl" aria-hidden="true">🕯️</span>
                <h2 className="text-2xl font-bold text-slate-700 font-serif">The Sunday Sermonette</h2>
            </div>
            <p className="text-slate-600 mb-4 text-sm">An opt-in weekly reflection to connect your efforts to your values.</p>
            
            <button 
                onClick={handleGenerate} 
                disabled={isLoading}
                className="w-full px-6 py-2 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-800 transition-all disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
            >
                {isLoading ? 'Reflecting...' : 'Receive Weekly Reflection'}
            </button>

            {error && <p className="text-red-500 text-center font-medium mt-4">{error}</p>}
            
            {sermon && (
                <div className="mt-4 p-4 bg-stone-100/50 rounded-lg border border-stone-200/50 animate-fade-in">
                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{sermon}</p>
                </div>
            )}
        </div>
    );
};