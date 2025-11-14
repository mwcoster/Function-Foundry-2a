import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CapturedItem } from '../hooks/types';

interface OmniInboxProps {
  items: CapturedItem[];
  onDeleteItem: (itemId: string) => void;
  onPromoteToQuest: (itemId:string) => void;
  onAddQuest: (text: string) => void;
}

// Interface for enhanced AI analysis output
interface AnalysisResult {
  nextSteps: string[];
  tags: string[];
  explanation: string;
}

export const OmniInbox: React.FC<OmniInboxProps> = ({ items, onDeleteItem, onPromoteToQuest, onAddQuest }) => {
  const [analysis, setAnalysis] = useState<Record<string, { loading: boolean; result: AnalysisResult | null; error: string | null; }>>({});

  const handleAnalyze = async (item: CapturedItem) => {
    setAnalysis(prev => ({ ...prev, [item.id]: { loading: true, result: null, error: null } }));
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      // NOTE: Mandate for Metaphorical Dictation Mode (Phase 2, Sprint 2)
      const prompt = `You are Sonia, a hyper-competent Chief of Staff. A "brain bean" has been captured with the following text: "${item.text}".
      
      Analyze the text. If the text contains a metaphor or analogy (e.g., 'the task is a broken engine that needs new wiring'), you must perform two actions:
      1. Translate the metaphor into 1-3 concrete, actionable GTD next steps.
      2. Identify 1-3 specific tags relevant to the analogy (e.g., 'Upcycling', 'Transformation', 'Artisan').
      
      If the text is a simple task, provide 1-3 simple next steps and relevant tags (e.g., 'Finance', 'Home').
      
      Respond with a JSON object.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              nextSteps: { type: "array", items: { type: "string" }, description: "1-3 concrete, actionable next steps." },
              tags: { type: "array", items: { type: "string" }, description: "1-3 structural tags for filtering and organization." },
              explanation: { type: "string", description: "A brief, witty sentence explaining how the metaphor was translated." }
            },
            required: ["nextSteps", "tags", "explanation"]
          }
        }
      });

      const parsedResult = JSON.parse(response.text);

      setAnalysis(prev => ({ 
        ...prev, 
        [item.id]: { 
          loading: false, 
          result: {
            nextSteps: parsedResult.nextSteps || [],
            tags: parsedResult.tags || [],
            explanation: parsedResult.explanation || "Analysis complete."
          }, 
          error: null 
        } 
      }));

    } catch (e) {
      console.error(e);
      setAnalysis(prev => ({ ...prev, [item.id]: { loading: false, result: null, error: "Couldn't process this brain bean's deep metaphor." } }));
    }
  };
  
  const handlePromoteSuggestion = (suggestionText: string, itemId: string) => {
    onAddQuest(suggestionText);
    onDeleteItem(itemId);
  }

  return (
    <div className="p-4 sm:p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg w-full animate-fade-in-up border border-white/30 font-sans">
      <div className="flex items-center gap-3 mb-4 px-2 sm:px-0">
        <span className="text-3xl" aria-hidden="true">📥</span>
        <h2 id="omni-inbox-heading" className="text-2xl font-bold text-slate-700 font-serif">Omni-Inbox</h2>
      </div>
      <div role="list" aria-labelledby="omni-inbox-heading" className="max-h-64 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {items.length > 0 ? (
          items.map(item => {
            const currentAnalysis = analysis[item.id];
            return (
              <div key={item.id} role="listitem" className="bg-white/70 p-3 rounded-lg shadow-sm border border-white/50 hover:bg-white/90 transition-all duration-200 group transform hover:scale-[1.02] hover:shadow-md">
                <div className="flex justify-between items-center">
                  <p className="text-slate-800 text-left flex-grow mr-2">{item.text} {item.postponedCount && item.postponedCount > 0 ? `(${item.postponedCount})` : ''}</p>
                  <div className="flex-shrink-0 flex items-center gap-1">
                    <button onClick={() => handleAnalyze(item)} disabled={currentAnalysis?.loading} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-100 rounded-full transition-colors opacity-50 group-hover:opacity-100" aria-label={`Analyze item: ${item.text}`} title="Analyze/Clarify Item">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.895 3.488 6 6 0 01-1.292 2.571L14.5 17.5a1 1 0 101.414-1.414l-2.072-2.071a6.002 6.002 0 01-.893-.893L17.5 14.5a1 1 0 10-1.414 1.414l-2.071-2.072A6.002 6.002 0 018 14a6 6 0 01-6-6z" clipRule="evenodd" /></svg>
                    </button>
                    <button onClick={() => onPromoteToQuest(item.id)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-full transition-colors opacity-50 group-hover:opacity-100" aria-label={`Promote to Quest: ${item.text}`} title="Promote to Quest">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v5.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 8.586V3a1 1 0 011-1zm3 10a1 1 0 10-2 0v4a1 1 0 102 0v-4zM5.293 9.414a1 1 0 011.414 0L10 12.707l3.293-3.293a1 1 0 011.414 1.414L11.414 15a1 1 0 01-1.414 0L5.293 10.828a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                    <button onClick={() => onDeleteItem(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors opacity-50 group-hover:opacity-100" aria-label={`Delete item: ${item.text}`} title="Delete Item">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                </div>
                
                {currentAnalysis?.loading && <div className="text-center text-sm text-slate-500 mt-2">Sonia is translating the genius...</div>}
                {currentAnalysis?.error && <div className="text-center text-sm text-red-500 mt-2">{currentAnalysis.error}</div>}
                
                {currentAnalysis?.result && (
                  <div className="mt-3 pt-3 border-t border-sky-200/50 animate-fade-in">
                    <p className="text-xs font-semibold text-sky-700 italic mb-2">Sonia's Translation: {currentAnalysis.result.explanation}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                        {currentAnalysis.result.tags.map(tag => (
                            <span key={tag} className="text-xs font-medium bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                    </div>

                    <h4 className="font-semibold text-slate-700 text-sm mt-3 mb-1">Suggested Next Steps:</h4>
                    <div className="space-y-1">
                      {currentAnalysis.result.nextSteps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-center justify-between p-2 bg-white/70 rounded-md shadow-xs border border-white/80">
                            <p className="text-sm text-slate-800">{step}</p>
                            <button onClick={() => handlePromoteSuggestion(step, item.id)} className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full hover:bg-emerald-700 transition-colors">
                                Questify
                            </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 px-4">
            <span className="text-4xl">🕊️</span>
            <p className="mt-3 font-semibold text-slate-600">All clear!</p>
            <p className="text-slate-500 text-sm">Your inbox is empty. A perfect time for a deep breath.</p>
          </div>
        )}
      </div>
    </div>
  );
};