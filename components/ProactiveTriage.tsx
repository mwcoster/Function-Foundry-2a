import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ExtractedItem } from '../hooks/types';

interface ProactiveTriageProps {
  onAddQuest: (text: string) => void;
}

interface TriageItem {
  sourceText: string;
  suggestion: {
    task?: string;
    responseOptions?: string[];
  }
}

// NOTE: SIMULATED_INBOX data has been removed to prepare for live API integration (Phase 4, Sprint 1 Mandate)

export const ProactiveTriage: React.FC<ProactiveTriageProps> = ({ onAddQuest }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [triageItems, setTriageItems] = useState<TriageItem[] | null>(null);
  const [copiedResponse, setCopiedResponse] = useState<string | null>(null);

  // Placeholder data that *would* come from a secure API endpoint in a full implementation
  // This simulates receiving 3 actionable items from Sonia's scan.
  const API_SIMULATION_DATA = [
    { sourceText: "Email from 'Wally's Specialist': 'Need to confirm next appointment time and billing details.'", suggestion: { responseOptions: ["Confirmed. Sending billing details now.", "Understood. Will call after 2 PM today.", "Thank you. Let me check my calendar."] } },
    { sourceText: "Calendar: 'Project X Draft Review Due' - Today at 4 PM.", suggestion: { task: "Set up the Project X document for final review and formatting." } },
    { sourceText: "Email from 'Landlord': 'Annual lease renewal documents enclosed.'", suggestion: { task: "Review and sign the annual lease renewal contract." } }
  ];

  const handleScan = async () => {
    setIsLoading(true);
    setError(null);
    // In V1.0, we use the hardcoded simulation data above to show the feature works
    // In Phase 4, this function will call the backend API endpoint.
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // NOTE: In the current prototype structure, we will present simulated data to show the feature functionality 
    // while acknowledging the API integration is pending.
    
    setTriageItems(API_SIMULATION_DATA as TriageItem[]);
    setIsLoading(false);


    // Original AI call logic (kept for reference, but bypassed until live API is integrated):
    /*
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are Sonia, a hyper-competent Chief of Staff specializing in proactive assistance. Scan the following items for trigger phrases and suggest EITHER a single concrete task OR three simple, one-sentence response options.`,
        // ... omitted config/schema
      });
      setTriageItems(JSON.parse(response.text));
    } catch (e) {
      setError("Sonia had trouble scanning your items. Live API integration pending.");
      setIsLoading(false);
    }
    */
  };

  const handleAddTask = (task: string, index: number) => {
    onAddQuest(task);
    // Remove item from list after actioning
    setTriageItems(prev => prev ? prev.filter((_, i) => i !== index) : null);
  };

  const handleCopyResponse = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResponse(text);
    setTimeout(() => setCopiedResponse(null), 2000);
  };

  const handleDismiss = (index: number) => {
    setTriageItems(prev => prev ? prev.filter((_, i) => i !== index) : null);
  };


  return (
    <div className="p-4 sm:p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg w-full animate-fade-in-up border border-white/30 font-sans">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl" aria-hidden="true">⚡️</span>
        <h2 className="text-2xl font-bold text-slate-700 font-serif">Proactive Triage</h2>
      </div>
      <p className="text-slate-600 mb-4 text-sm">Let Sonia scan your external inputs for actionable items (API integration pending).</p>

      {!triageItems && (<>
        <button onClick={handleScan} disabled={isLoading} className="w-full px-6 py-2 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-800 transition-all disabled:opacity-50">
          {isLoading ? "Scanning..." : "Simulate Proactive Scan"}
        </button>
        {error && <p className="text-red-500 text-center font-medium mt-4">{error}</p>}
      </>
      )}

      {triageItems && (
        <div className="space-y-4">
          <p className="font-semibold text-slate-700 text-sm">Sonia found {triageItems.length} actionable item(s):</p>
          {triageItems.map((item, index) => (
            <div key={index} className="bg-white/70 p-3 rounded-lg shadow-sm border border-white/50">
              <p className="text-xs text-slate-500 mb-2 italic">{item.sourceText}</p>
              
              {item.suggestion.task && (
                <div className="flex justify-between items-center bg-sky-50/70 p-2 rounded-md border border-sky-200/50">
                  <p className="text-slate-800 font-medium text-sm mr-2">{item.suggestion.task}</p>
                  <button onClick={() => handleAddTask(item.suggestion.task!, index)} className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full hover:bg-emerald-700 transition-colors flex-shrink-0">
                    Add Quest
                  </button>
                </div>
              )}

              {item.suggestion.responseOptions && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">Quick Response Options:</p>
                  {item.suggestion.responseOptions.map((resp, respIndex) => (
                    <button key={respIndex} onClick={() => handleCopyResponse(resp)} className="w-full text-left text-sm p-2 bg-slate-100/70 rounded-md hover:bg-slate-200/70 transition-colors border border-slate-200/50">
                      <span className="font-medium text-slate-800">{copiedResponse === resp ? "Copied!" : `"${resp}"`}</span>
                    </button>
                  ))}
                </div>
              )}
              
              <div className="text-right mt-2">
                <button onClick={() => handleDismiss(index)} className="text-xs text-slate-500 hover:text-red-500">Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};