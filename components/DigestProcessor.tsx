import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedItem } from '../hooks/types';

interface DigestProcessorProps {
    onBulkAddItems: (items: ExtractedItem[]) => void;
}

export const DigestProcessor: React.FC<DigestProcessorProps> = ({ onBulkAddItems }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [digestText, setDigestText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [extractedItems, setExtractedItems] = useState<ExtractedItem[] | null>(null);
    const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});

    const handleProcess = async () => {
        if (!digestText.trim()) return;
        setIsLoading(true);
        setError(null);
        setExtractedItems(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `You are Sonia, a hyper-competent Chief of Staff. Analyze the following pasted text from a user's daily digest or notes. Extract all distinct thoughts, ideas, or to-do items. For each item, classify it as either a simple 'inbox' capture or a more concrete 'quest'.
                
                Pasted Text:
                "${digestText}"`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING, description: "The text of the captured item." },
                                type: { type: Type.STRING, description: "The type of item.", enum: ["inbox", "quest"] }
                            },
                            required: ["text", "type"]
                        },
                    },
                },
            });

            const parsedItems = JSON.parse(response.text) as ExtractedItem[];
            setExtractedItems(parsedItems);
            setSelectedItems(parsedItems.reduce((acc, _, index) => ({ ...acc, [`${index}`]: true }), {}));
        } catch (e) {
            console.error(e);
            setError("Sonia had trouble processing that. Could you check the formatting and try again?");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleConfirm = () => {
        if (!extractedItems) return;
        const itemsToAdd = extractedItems.filter((_, index) => selectedItems[`${index}`]);
        onBulkAddItems(itemsToAdd);
        // Reset state after confirmation
        setDigestText('');
        setExtractedItems(null);
        setSelectedItems({});
        setIsExpanded(false);
    };

    if (!isExpanded) {
        return (
             <button onClick={() => setIsExpanded(true)} className="w-full text-left p-3 bg-white/60 rounded-lg shadow-sm hover:bg-white/80 font-semibold text-slate-700 flex items-center gap-3">
                <span className="text-xl">📋</span>
                <span>Process External Digest</span>
            </button>
        )
    }

    return (
        <div className="p-4 sm:p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg w-full animate-fade-in-up border border-white/30 font-sans">
            <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden="true">📋</span>
                    <h2 className="text-2xl font-bold text-slate-700 font-serif">Process Digest</h2>
                </div>
                <button onClick={() => setIsExpanded(false)} className="text-slate-500 hover:text-slate-800">&times;</button>
            </div>
            <p className="text-slate-600 mb-4 text-sm">Paste text from an email, notes, or anywhere else to turn it into actions.</p>
            
            {!extractedItems ? (
                 <>
                    <textarea 
                        value={digestText}
                        onChange={e => setDigestText(e.target.value)}
                        rows={6}
                        placeholder="Paste your daily digest or notes here..."
                        className="w-full p-2 bg-white/60 border-2 border-slate-300/40 rounded-md shadow-inner"
                    />
                    <button onClick={handleProcess} disabled={isLoading || !digestText.trim()} className="mt-2 w-full px-6 py-2 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-800 disabled:opacity-50 transition-colors">
                        {isLoading ? "Processing..." : "Process with Sonia"}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                </>
            ) : (
                <>
                    <h3 className="font-semibold text-slate-700 mb-2">Sonia's suggestions:</h3>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2 space-y-2 text-left">
                        {extractedItems.map((item, index) => (
                            <div key={index} className="flex items-center p-2 bg-white/60 rounded-md">
                                <input type="checkbox" id={`proc-item-${index}`} checked={selectedItems[`${index}`] || false} onChange={() => setSelectedItems(prev => ({...prev, [`${index}`]: !prev[`${index}`]}))} className="w-5 h-5 rounded text-indigo-500 mr-3" />
                                <label htmlFor={`proc-item-${index}`} className="flex-grow text-slate-800">{item.text}</label>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.type === 'quest' ? 'bg-slate-300 text-slate-800' : 'bg-slate-200 text-slate-700'}`}>{item.type}</span>
                            </div>
                        ))}
                    </div>
                     <button onClick={handleConfirm} className="mt-4 w-full px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition-colors">Confirm and Add</button>
                </>
            )}
        </div>
    );
};