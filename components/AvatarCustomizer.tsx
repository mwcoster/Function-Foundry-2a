import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CharacterData } from '../hooks/types';

interface AvatarCustomizerProps {
    character: CharacterData;
    onSave: (newAvatarUrl: string) => void;
    onClose: () => void;
}

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ character, onSave, onClose }) => {
    const [prompt, setPrompt] = useState(character.basePrompt);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png',
                    aspectRatio: '1:1',
                },
            });
            
            if (response.generatedImages && response.generatedImages.length > 0) {
                const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
                const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                setGeneratedImage(imageUrl);
            } else {
                setError('No image was generated. Please try a different prompt.');
            }

        } catch (e) {
            console.error(e);
            setError('Failed to generate image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSave = () => {
        if (generatedImage) {
            onSave(generatedImage);
        }
    };

    return (
        <div className="absolute inset-0 bg-slate-900/40 z-30 flex items-center justify-center animate-fade-in p-4 backdrop-blur-lg">
            <div className="relative bg-white/70 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl w-full max-w-2xl p-6 md:p-8 transform transition-all animate-fade-in-up max-h-[90vh] flex flex-col font-sans overflow-hidden">
                <div className="flex-shrink-0 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 font-serif">Customize {character.name}</h2>
                        <p className="text-slate-600 mt-1">Describe the new look you want for your character.</p>
                    </div>
                     <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors p-1 rounded-full hover:bg-black/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-grow mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar pr-2">
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 mb-1">Prompt</label>
                        <textarea
                            id="prompt"
                            rows={6}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full p-2 bg-white/60 border-2 border-slate-300/40 rounded-md shadow-inner text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                            placeholder="e.g., A friendly garden gnome tending to a money tree, cartoon style."
                        />
                         <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="mt-4 w-full px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-800 transition-all disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Generating...' : 'Generate Image'}
                        </button>
                    </div>

                    <div className="flex flex-col items-center justify-center bg-slate-500/10 rounded-md p-4 min-h-[200px] border border-slate-500/10 shadow-inner">
                        {isLoading && (
                            <div className="flex flex-col items-center text-slate-500">
                                <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="mt-3 text-sm font-medium">Creating magic...</p>
                            </div>
                        )}
                        {error && <p className="text-red-500 text-center font-medium">{error}</p>}
                        {generatedImage && (
                            <img src={generatedImage} alt="Generated avatar" className="w-full h-full object-cover rounded-md shadow-lg animate-fade-in" />
                        )}
                         {!isLoading && !generatedImage && !error && (
                            <div className="text-center text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="mt-2 text-sm">Your new avatar will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-shrink-0 mt-6 flex justify-end gap-4 border-t border-slate-900/10 pt-5">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-200/70 text-slate-800 font-semibold rounded-lg hover:bg-slate-300/80 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!generatedImage || isLoading}
                        className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-emerald-400 disabled:shadow-none disabled:cursor-not-allowed transition-all"
                    >
                        Save Avatar
                    </button>
                </div>
            </div>
        </div>
    );
};