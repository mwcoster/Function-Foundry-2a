import { MindMapWorkbench } from './MindMapWorkbench';
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedItem, CharacterData, HubId } from '../hooks/types';
import { SoniaAvatar, SisterMaryAvatar } from './CharacterAvatars';

interface StrategicSinterprops {
  onFinish: () => void;
  onBulkAddItems: (items: ExtractedItem[]) => void;
  characters: CharacterData[];
}

type HuddleStep = 'intro' | 'braindump' | 'review' | 'advice' | 'outro';

// Non-standard browser API, so we need to declare it
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const StrategicSinter: React.FC<StrategicSinterprops> = ({ onFinish, onBulkAddItems, characters }) => {
  const [step, setStep] = useState<HuddleStep>('intro');
  const [brainDumpText, setBrainDumpText] = useState('');
  const [whiteboardPoints, setWhiteboardPoints] = useState<string[]>([]);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const sisterMary = characters.find(c => c.id === HubId.SisterMary);

  useEffect(() => {
    if (step === 'braindump') {
      const points = brainDumpText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      setWhiteboardPoints(points);
    }
  }, [brainDumpText, step]);
  
  // Cleanup effect for speech recognition
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleAnalyzeDump = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are Sonia, a hyper-competent Chief of Staff. Analyze the following "brain dump" from the user and extract all distinct thoughts, ideas, or to-do items. For each item, classify it as either a simple 'inbox' capture or a more concrete 'quest'.
          
Brain Dump:
"${brainDumpText}"`,
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
      setSelectedItems(parsedItems.reduce((acc, item, index) => ({...acc, [`${index}`]: true }), {}));
      setStep('review');

    } catch (e) {
      console.error(e);
      setError("Sonia had some trouble parsing that. Could you try rephrasing?");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfirmItems = async () => {
    setIsLoading(true);
    const itemsToAdd = extractedItems.filter((_, index) => selectedItems[`${index}`]);
    onBulkAddItems(itemsToAdd);

    // Fetch advice from Sister Mary in parallel
    if (sisterMary) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${sisterMary.basePrompt}\nBased on the user's brain dump, provide one short, powerful sentence of strategic advice or encouragement. Brain Dump: "${brainDumpText}"`
        });
        setAdvice(response.text);
      } catch (e) {
        console.error(e);
        setAdvice("Remember to lead with your values today.");
      }
    }
    
    setIsLoading(false);
    setStep('advice');
  };
  
  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Sorry, your browser doesn't support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    const initialText = brainDumpText.trim().length > 0 ? brainDumpText.trim() + '\n' : '';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setError(`Mic error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; ++i) {
        transcript += event.results[i].transcript;
        if (event.results[i].isFinal) {
          transcript += '\n';
        }
      }
      setBrainDumpText(initialText + transcript.replace(/\n\n/g, '\n'));
    };

    recognition.start();
  };

  const renderStepContent = () => {
    switch (step) {
      case 'intro': return (
        <>
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-sky-400 p-2 flex-shrink-0 shadow-lg mx-auto mb-6"><SoniaAvatar /></div>
          <h2 className="text-3xl font-bold text-slate-800 font-serif">The Strategic Sinter</h2>
          <p className="text-lg text-slate-700 leading-relaxed mt-4">C'est parfait! It's Midday. Let's fire up the forge and transmute the chaos into clear, rock-solid action steps for your prime work block.</p>
          <button onClick={() => setStep('braindump')} className="mt-8 px-8 py-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-md transition-colors">Begin Transmutation</button>
        </>
      );
      
      case 'braindump': return (
        <>
          <h2 className="text-2xl font-bold text-slate-700 font-serif mb-2">The Brain Dump</h2>
          <p className="text-slate-600 mb-4">What's on your mind? Type or use the mic. We'll sort it out together.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="relative">
              <textarea 
                value={brainDumpText} 
                onChange={e => setBrainDumpText(e.target.value)} 
                rows={12} 
                className="w-full p-3 pr-12 bg-white/60 border-2 border-slate-300/40 rounded-lg shadow-inner" 
                placeholder="Ideas, tasks, worries..."
              />
              <button 
                type="button"
                onClick={handleMicClick}
                className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-300/70'}`}
                title={isListening ? "Stop listening" : "Start listening"}
              >
                {/* ICON GOES HERE */}
              </button>
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>
            
            <div className="relative"> 
              <h3 className="text-xl font-semibold text-slate-700 font-serif mb-2">Mind-Map Workbench</h3>
              <p className="text-sm text-slate-600 mb-4">Real-Time Visual Scaffold</p>
              
              <MindMapWorkbench brainDumpText={brainDumpText} />

              <button 
                onClick={handleAnalyzeDump} 
                disabled={isLoading || brainDumpText.trim().length === 0} 
                className="mt-8 px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50"
              >
                {isLoading ? "Sonia is analyzing..." : "Analyze My Thoughts"}
              </button>
            </div>
          </div>
        </>
      );
      case 'review': return (
        <>
          <h2 className="text-2xl font-bold text-slate-700 font-serif mb-2">Sonia's Suggestions</h2>
          <p className="text-slate-600 mb-4">Here's what I've extracted. Uncheck anything you don't want to add.</p>
          <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2 space-y-2 text-left">
            {extractedItems.map((item, index) => (
              <div key={index} className="flex items-center p-2 bg-white/60 rounded-md">
                <input type="checkbox" id={`item-${index}`} checked={selectedItems[`${index}`] || false} onChange={() => setSelectedItems(prev => ({...prev, [`${index}`]: !prev[`${index}`]}))} className="w-5 h-5 rounded text-indigo-500 mr-3" />
                <label htmlFor={`item-${index}`} className="flex-grow text-slate-800">{item.text}</label>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.type === 'quest' ? 'bg-sky-200 text-sky-800' : 'bg-purple-200 text-purple-800'}`}>{item.type}</span>
              </div>
            ))}
          </div>
          <button onClick={handleConfirmItems} className="mt-4 w-full px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md">Add to Lists</button>
        </>
      );
      case 'advice': return (
        <>
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-400 p-2 flex-shrink-0 shadow-lg mx-auto mb-6"><SisterMaryAvatar /></div>
          <h2 className="text-2xl font-bold text-slate-700 font-serif">A Word from Sister Mary</h2>
          {isLoading ? <p className="text-lg text-slate-700 leading-relaxed mt-4">Thinking...</p> : <p className="text-lg text-slate-700 leading-relaxed mt-4 italic">"{advice}"</p>}
          <button onClick={() => setStep('outro')} className="mt-8 px-8 py-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-md">Continue</button>
        </>
      );
      case 'outro': return (
        <>
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-sky-400 p-2 flex-shrink-0 shadow-lg mx-auto mb-6"><SoniaAvatar /></div>
          <h2 className="text-3xl font-bold text-slate-800 font-serif">Huddle Complete</h2>
          <p className="text-lg text-slate-700 leading-relaxed mt-4">Excellent. Your lists are updated and you have your focus for the day. The bridge is yours, mon capitaine.</p>
          <button onClick={onFinish} className="mt-8 px-8 py-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-md">Finish Huddle</button>
        </>
      );
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-lg animate-fade-in">
      <div className={`relative bg-white/80 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl w-full ${step === 'braindump' ? 'max-w-4xl' : 'max-w-2xl'} p-8 text-center transform transition-all animate-fade-in-up`}>
        {renderStepContent()}
      </div>
    </div>
  )
};