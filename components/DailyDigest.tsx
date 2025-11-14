import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { CapturedItem, TimeBlock } from '../hooks/types';
import { SoniaAvatar } from './CharacterAvatars';

interface DailyDigestProps {
    questItems: CapturedItem[];
    timeBlocks: TimeBlock[];
    onClose: () => void;
}

interface DigestContent {
    greeting: string;
    topQuests: { text: string }[];
    appointments: { text: string }[];
    quote: string;
}

export const DailyDigest: React.FC<DailyDigestProps> = ({ questItems, timeBlocks, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [digest, setDigest] = useState<DigestContent | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const generateDigest = async () => {
            setIsLoading(true);
            setError(null);

            try {
                if (!process.env.API_KEY) {
                    throw new Error("API key not configured.");
                }

                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

                // Get today's date and filter today's time blocks
                const now = new Date();
                const today_hours = now.getHours() + now.getMinutes()/60;
                const todaysBlocks = timeBlocks.filter(block => {
                    // Simple check for non-recurring blocks happening "today" (after current time)
                    return block.recurring === 'none' && block.startHour >= today_hours;
                    // In a real app, date logic would be more complex
                }).map(b => `${b.title} at ${Math.floor(b.startHour)}:${(b.startHour % 1 * 60).toString().padStart(2, '0')}`);

                const prompt = `You are Sonia, a sharp, kind, and clever Chief of Staff. It's the beginning of the day. Generate a "Daily Digest" for the user.
                
                Analyze the user's current quests and today's appointments.
                - Quests: ${questItems.length > 0 ? JSON.stringify(questItems.map(q => q.text)) : "No quests today."}
                - Today's Appointments: ${todaysBlocks.length > 0 ? JSON.stringify(todaysBlocks) : "No appointments scheduled for the rest of today."}

                Your response must be a JSON object with the following structure:
                - greeting: A warm and professional opening.
                - topQuests: An array of objects, each with a 'text' property. Select the 3 most important quests. If fewer than 3 exist, return all of them. If none, return an empty array.
                - appointments: An array of objects, each with a 'text' property, listing today's upcoming appointments. If none, return an empty array.
                - quote: A short, insightful, and motivational quote for the day, fitting your persona.`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                greeting: { type: Type.STRING },
                                topQuests: { 
                                    type: Type.ARRAY, 
                                    items: { 
                                        type: Type.OBJECT,
                                        properties: { text: { type: Type.STRING } },
                                        required: ["text"]
                                    } 
                                },
                                appointments: { 
                                    type: Type.ARRAY, 
                                    items: {
                                        type: Type.OBJECT,
                                        properties: { text: { type: Type.STRING } },
                                        required: ["text"]
                                    }
                                },
                                quote: { type: Type.STRING }
                            },
                            required: ["greeting", "topQuests", "appointments", "quote"]
                        }
                    }
                });
                
                setDigest(JSON.parse(response.text));

            } catch (e) {
                console.error(e);
                setError("Sonia couldn't prepare your digest right now. Please try again later.");
                // Fallback content
                setDigest({
                    greeting: "Bon jour! I had a little trouble connecting, but let's get your day started.",
                    topQuests: questItems.slice(0, 3).map(q => ({ text: q.text })),
                    appointments: [],
                    quote: "The secret of getting ahead is getting started."
                });
            } finally {
                setIsLoading(false);
            }
        };

        generateDigest();
    }, [questItems, timeBlocks]);
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-600 font-semibold">Sonia is preparing your daily digest...</p>
                </div>
            );
        }

        if (error && !digest) {
            return <p className="text-red-600 text-center font-semibold">{error}</p>;
        }

        if (digest) {
            return (
                <div className="animate-fade-in text-left w-full">
                    <p className="text-lg text-slate-700 leading-relaxed mb-6">{digest.greeting}</p>
                    
                    {digest.topQuests.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-bold text-slate-800 font-serif text-xl border-b-2 border-slate-300 pb-2 mb-3">Top Quests for Today</h3>
                            <ul className="list-disc list-inside space-y-2 text-slate-700">
                                {digest.topQuests.map((quest, i) => <li key={i}>{quest.text}</li>)}
                            </ul>
                        </div>
                    )}

                    {digest.appointments.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-bold text-slate-800 font-serif text-xl border-b-2 border-slate-300 pb-2 mb-3">Upcoming Appointments</h3>
                            <ul className="list-disc list-inside space-y-2 text-slate-700">
                                 {digest.appointments.map((appt, i) => <li key={i}>{appt.text}</li>)}
                            </ul>
                        </div>
                    )}
                    
                    <div className="mt-6 pt-4 border-t border-slate-300/70 text-center">
                         <p className="text-slate-600 italic font-serif">"{digest.quote}"</p>
                    </div>
                </div>
            )
        }
        return null;
    };


    return (
         <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-lg animate-fade-in">
            <div className="relative bg-white/80 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl w-full max-w-2xl p-8 transform transition-all animate-fade-in-up flex flex-col items-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-sky-400 p-2 flex-shrink-0 shadow-lg mb-4">
                    <SoniaAvatar />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 font-serif mb-6">Your Daily Digest</h2>
                
                <div className="w-full min-h-[200px] flex items-center justify-center">
                    {renderContent()}
                </div>

                <button 
                    onClick={onClose}
                    disabled={isLoading}
                    className="mt-8 px-8 py-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50"
                >
                    {isLoading ? "Loading..." : "Let's Go!"}
                </button>
            </div>
        </div>
    );
};