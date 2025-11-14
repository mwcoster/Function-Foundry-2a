import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { SoniaAvatar } from './CharacterAvatars';

interface TransitionRitualProps {
  onComplete: () => void;
}

type RitualStep = 'ritual' | 'tagging' | 'complete';

export const TransitionRitual: React.FC<TransitionRitualProps> = ({ onComplete }) => {
  const [steps, setSteps] = useState<string[] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [phase, setPhase] = useState<RitualStep>('ritual');
  
  // NEW STATE: Energy/Value-Cost Tagger (Phase 4, Sprint 3)
  const [energySpent, setEnergySpent] = useState<number | null>(null);
  const [valueAlignment, setValueAlignment] = useState<number | null>(null);

  useEffect(() => {
    const generateRitual = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!process.env.API_KEY) {
          throw new Error("API key not configured.");
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const prompt = `You are Sonia, an ADHD coach and Chief of Staff. A user just finished a task. Provide a simple, 2-step transition ritual to help them reset and detach before the next task. The steps should be physical, brief, and mindful. Format the response as a JSON array of 2 strings. Example: ["Take 3 deep, slow breaths.", "Gently stretch your neck from side to side."]`
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              minItems: 2,
              maxItems: 2,
            }
          }
        });

        setSteps(JSON.parse(response.text));
      } catch (e) {
        console.error("Failed to generate ritual:", e);
        setError("Sonia is having a little trouble. Let's just take a deep breath.");
        // Fallback ritual
        setSteps(["Take one deep, cleansing breath.", "Stand up and stretch your arms to the sky."]);
      } finally {
        setIsLoading(false);
      }
    };

    generateRitual();
  }, []);

  const handleNextStep = () => {
    if (steps && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Transition from Ritual to Tagging phase
      setPhase('tagging');
    }
  };
  
  const handleTaggingComplete = () => {
      if (energySpent !== null && valueAlignment !== null) {
          // In a final V1.0, this data would be sent to the persistence layer.
          // For now, we transition to completion.
          setPhase('complete');
      }
  };

  const renderRitualContent = () => {
    if (isLoading) {
      return (<p className="text-slate-600 font-semibold">Sonia is preparing your ritual...</p>);
    }
    
    if (error && !steps) {
      return <p className="text-red-500 text-center font-semibold">{error}</p>
    }
    
    if (steps && phase === 'ritual') {
      const stepText = steps[currentStep];
      const isLastStep = currentStep === steps.length - 1;
      return (
        <div className="animate-fade-in w-full">
          <p className="font-semibold text-slate-500 text-sm uppercase tracking-wider mb-4">Step {currentStep + 1} of {steps.length}</p>
          <p className="text-3xl font-serif text-slate-800 leading-snug">{stepText}</p>
          <button
            onClick={handleNextStep}
            className="mt-12 px-10 py-3 bg-gradient-to-br from-sky-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-sky-500/30 hover:from-sky-600 hover:to-blue-700 transition-all"
          >
            {isLastStep ? "Continue to Check-In" : "Next Step"}
          </button>
        </div>
      );
    }
    
    // NEW RENDER: Tagging Phase (Energy/Value-Cost Tagger)
    if (phase === 'tagging') {
        return (
            <div className="animate-fade-in w-full text-center">
                <h3 className="text-2xl font-bold text-slate-700 font-serif mb-6">Cognitive Check-In</h3>
                <p className="text-lg text-slate-600 mb-6">Help the system learn how to support you, Artisan.</p>
                
                <div className="space-y-6">
                    <div>
                        <label className="font-semibold text-slate-700 block mb-2">1. Energy Spent (1-5):</label>
                        <p className="text-xs text-slate-500 mb-2">1 = Barely Noticed, 5 = Utterly Depleted</p>
                        <div className="flex justify-center gap-3">
                            {[4-8].map(rating => (
                                <button
                                    key={`energy-${rating}`}
                                    onClick={() => setEnergySpent(rating)}
                                    className={`w-10 h-10 rounded-full border-2 font-bold transition-all ${energySpent === rating ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white/70 border-slate-300 text-slate-700 hover:bg-indigo-100'}`}
                                >
                                    {rating}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="font-semibold text-slate-700 block mb-2">2. Value Alignment (1-5):</label>
                        <p className="text-xs text-slate-500 mb-2">1 = Totally Irrelevant, 5 = Highly Purposeful</p>
                        <div className="flex justify-center gap-3">
                            {[4-8].map(rating => (
                                <button
                                    key={`value-${rating}`}
                                    onClick={() => setValueAlignment(rating)}
                                    className={`w-10 h-10 rounded-full border-2 font-bold transition-all ${valueAlignment === rating ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/70 border-slate-300 text-slate-700 hover:bg-emerald-100'}`}
                                >
                                    {rating}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleTaggingComplete}
                    disabled={energySpent === null || valueAlignment === null}
                    className="mt-12 px-10 py-3 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-800 disabled:opacity-50 transition-all"
                >
                    Log Data & Finish
                </button>
            </div>
        );
    }
    
    // Final Completion Step
    if (phase === 'complete') {
        onComplete();
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-lg animate-fade-in">
      <div className="relative bg-white/80 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl w-full max-w-lg p-8 text-center transform transition-all animate-fade-in-up flex flex-col items-center">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-sky-400 p-2 flex-shrink-0 shadow-lg mb-6">
          <SoniaAvatar />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 font-serif mb-4">Transition Ritual</h2>
        <p className="text-lg text-slate-600 mb-8">A brief pause to reset your focus.</p>

        <div className="min-h-[150px] flex items-center justify-center w-full">
          {renderRitualContent()}
        </div>
      </div>
    </div>
  );
};