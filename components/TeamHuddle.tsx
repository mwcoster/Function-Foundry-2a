import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { CapturedItem, CharacterData, HubId } from '../hooks/types';
import { SoniaAvatar, SisterMaryAvatar } from './CharacterAvatars';

interface TeamHuddleProps {
    onClose: () => void;
    questItems: CapturedItem[];
    inboxItems: CapturedItem[];
    characters: CharacterData[];
}

interface HuddleDialogue {
    sonia_dialogue: string;
    sister_mary_dialogue: string;
}

export const TeamHuddle: React.FC<TeamHuddleProps> = ({ onClose, questItems, inboxItems, characters }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [dialogue, setDialogue] = useState<HuddleDialogue | null>(null);
    const [error, setError] = useState<string | null>(null);

    const sonia = characters.find(c => c.id === HubId.Sonia);
    const sisterMary = characters.find(c => c.id === HubId.SisterMary);

    useEffect(() => {
        const generateDialogue = async () => {
            if (!sonia || !sisterMary) {
                setError("Character data is missing.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const questTexts = questItems.map(q => `- ${q.text}`).join('\n') || 'None';
                const inboxTexts = inboxItems.map(i => `- ${i.text}`).join('\n') || 'None';

                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: `You are a scriptwriter for a productivity app. Write a short "Huddle" dialogue between two characters: Sonia and Sister Mary Samuel.

                    Sonia (${sonia.title}) should identify a practical problem or point of friction based on the user's current tasks.
                    Sister Mary Samuel (${sisterMary.title}) should then provide a gentle, motivational reframing of that problem.

                    USER'S CURRENT CONTEXT:
                    Quests:
                    ${questTexts}

                    Inbox Items:
                    ${inboxTexts}

                    Your response must be a single JSON object.`,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                sonia_dialogue: { type: Type.STRING, description: "Sonia's practical observation." },
                                sister_mary_dialogue: { type: Type.STRING, description: "Sister Mary's motivational reframing." }
                            },
                            required: ["sonia_dialogue", "sister_mary_dialogue"]
                        },
                    },
                });
                
                setDialogue(JSON.parse(response.text));

            } catch (e) {
                console.error("Failed to generate huddle dialogue:", e);
                setError("The team is having trouble connecting at the moment. Please try again.");
                setDialogue({
                    sonia_dialogue: "It seems we have a lot on our plate, and it's difficult to see where to start.",
                    sister_mary_dialogue: "And what a wonderful challenge! Each task is just an opportunity to take one small, faithful step forward."
                });
            } finally {
                setIsLoading(false);
            }
        };

        generateDialogue();
    }, [questItems, inboxItems, sonia, sisterMary]);

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-lg animate-fade-in" onClick={onClose}>
            <div className="relative bg-white/80 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl w-full max-w-2xl p-8 transform transition-all animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold text-slate-800 font-serif text-center mb-6">Team Huddle</h2>
                
                {isLoading && (
                    <div className="flex flex-col items-center min-h-[200px] justify-center">
                        <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                        <p className="text-slate-600 font-semibold mt-4">The team is gathering...</p>
                    </div>
                )}
                {error && <p className="text-red-500 text-center font-semibold min-h-[200px]">{error}</p>}
                
                {dialogue && !isLoading && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Sonia's Dialogue */}
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-full bg-sky-400 p-1 flex-shrink-0 shadow-lg"><SoniaAvatar /></div>
                            <div>
                                <p className="font-bold text-slate-700">{sonia?.name || 'Sonia'}</p>
                                <div className="mt-1 p-3 bg-white/70 rounded-lg rounded-tl-none border border-white/50">
                                    <p className="text-slate-800">{dialogue.sonia_dialogue}</p>
                                </div>
                            </div>
                        </div>

                        {/* Sister Mary's Dialogue */}
                        <div className="flex items-start gap-4">
                             <div className="w-16 h-16 rounded-full bg-slate-400 p-1 flex-shrink-0 shadow-lg"><SisterMaryAvatar /></div>
                            <div>
                                <p className="font-bold text-slate-700">{sisterMary?.name || 'Sister Mary Samuel'}</p>
                                <div className="mt-1 p-3 bg-white/70 rounded-lg rounded-tl-none border border-white/50">
                                    <p className="text-slate-800 italic">{dialogue.sister_mary_dialogue}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="text-center mt-8">
                    <button onClick={onClose} className="px-8 py-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-md">
                        Got it. Let's go.
                    </button>
                </div>
            </div>
        </div>
    );
};