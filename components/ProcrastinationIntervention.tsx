import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CapturedItem, CharacterData } from '../hooks/types';

interface ProcrastinationInterventionProps {
  quest: CapturedItem;
  character: CharacterData;
  onAcknowledge: () => void;
}

export const ProcrastinationIntervention: React.FC<ProcrastinationInterventionProps> = ({ quest, character, onAcknowledge }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [reflection, setReflection] = useState<string | null>(null);

  useEffect(() => {
    const generateReflection = async () => {
      setIsLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        // NOTE: Implemented Course Correction Compass / RSD Protocol (Phase 3, Sprint 1)
        const prompt = `You are ${character.name}, a strategic and empathetic guide. The user seems to be repeatedly postponing the following task: "${quest.text}".
        
        This task is triggering a shame spiral linked to Rejection Sensitive Dysphoria (RSD). Your response must initiate the **Course Correction Protocol**.
        
        1. Immediately reframe the postponement as **"data, not a moral failing."**
        2. Ask one or two non-judgmental, reflective questions to help them uncover the specific friction (e.g., ambiguity, fear of failure).
        3. Do not offer a solution yet; simply create a safe space for reflection and close the guilt loop on the old timeline. Keep your response brief, compassionate, and reference the task's title.`;
        
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        setReflection(response.text);

      } catch (e) {
        console.error(e);
        setReflection("It seems there's some friction with this task. How does it make you feel when you think about it?");
      } finally {
        setIsLoading(false);
      }
    };

    generateReflection();
  }, [quest.id, quest.text, character.name]);

  return (
    <div className="p-4 sm:p-6 bg-amber-50/70 backdrop-blur-sm rounded-2xl shadow-lg w-full max-w-2xl animate-fade-in-up border border-amber-200/50 font-sans">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl flex-shrink-0" aria-hidden="true">💬</span>
        <h2 className="text-xl font-bold text-slate-700 font-serif">A Gentle Reflection</h2>
      </div>
      {isLoading ? (
        <p className="text-slate-600">Sister Mary is gathering her thoughts...</p>
      ) : (
        <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{reflection}</p>
      )}
      <button 
        onClick={onAcknowledge}
        className="mt-4 w-full text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors py-2 bg-white/50 rounded-lg border border-white"
      >
        Acknowledge and Dismiss
      </button>
    </div>
  );
};