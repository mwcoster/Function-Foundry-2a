
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

export const AffirmationMessage: React.FC = () => {
    const [affirmation, setAffirmation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAffirmation = async () => {
            setIsLoading(true);
            try {
                if (!process.env.API_KEY) {
                    throw new Error("API key not configured.");
                }
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const prompt = "You are a gentle, wise voice. Provide a single, short, calming affirmation for someone seeking a moment of peace. Do not use quotation marks. Keep it under 15 words.";
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });

                setAffirmation(response.text);

            } catch (error) {
                console.error("Failed to fetch affirmation:", error);
                setAffirmation("Breathe in, breathe out. You are right where you need to be.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAffirmation();
    }, []);

    return (
        <div className="absolute inset-0 flex items-center justify-center p-8 bg-black/20 backdrop-blur-sm animate-fade-in z-20">
            <div className="text-center">
                {isLoading ? (
                    <div className="w-8 h-8 border-4 border-white/50 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <p className="text-white text-3xl font-serif italic drop-shadow-lg animate-fade-in">
                        "{affirmation}"
                    </p>
                )}
            </div>
        </div>
    );
};
