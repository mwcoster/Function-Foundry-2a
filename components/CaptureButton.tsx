import React, { useState, useEffect, useRef } from 'react';

// Non-standard browser API, so we need to declare it
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface CaptureButtonProps {
    onCapture: (text: string) => void;
    isOpen: boolean;
    onToggle: () => void;
    showButton: boolean;
}

export const CaptureButton: React.FC<CaptureButtonProps> = ({ onCapture, isOpen, onToggle, showButton }) => {
    const [text, setText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const inputRef = React.useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onCapture(text.trim());
            setText('');
        }
    };

    const handleMicClick = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Sorry, your browser doesn't support speech recognition.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setText(text + finalTranscript + interimTranscript);
        };
        
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
    };

    useEffect(() => {
        return () => {
            recognitionRef.current?.stop();
        };
    }, []);

    return (
        <div className="fixed bottom-8 right-8 z-30">
            {isOpen && (
                <div 
                className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 animate-fade-in backdrop-blur-md" 
                style={{ zIndex: 9001 }} 
                onClick={onToggle} 
                onMouseDown={(e) => e.stopPropagation()}>
                    <form onSubmit={handleSubmit} className="relative w-full max-w-lg bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <label htmlFor="capture-input" className="block text-lg font-semibold text-slate-800 font-serif">Capture a "Brain Bean"</label>
                        <p className="text-slate-600 text-sm mb-4">An idea, a to-do, a worry... get it out of your head.</p>
                        <div className="relative">
                             <textarea
                                ref={inputRef}
                                id="capture-input"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full p-3 pr-12 bg-white/60 border-2 border-slate-300/40 rounded-lg shadow-inner"
                                rows={4}
                                placeholder="What's on your mind?"
                            />
                            <button 
                                type="button"
                                onClick={handleMicClick}
                                className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-300/70'}`}
                                title="Transcribe speech"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                                    <path d="M5.5 10.5a.5.5 0 01.5.5v1a4 4 0 004 4h0a4 4 0 004-4v-1a.5.5 0 011 0v1a5 5 0 01-4.5 4.975V19h2a.5.5 0 010 1h-5a.5.5 0 010-1h2v-1.525A5 5 0 014.5 12v-1a.5.5 0 01.5-.5z" />
                                </svg>
                            </button>
                        </div>
                        <button type="submit" className="mt-4 w-full px-4 py-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-md transition-colors">
                            Capture
                        </button>
                    </form>
                </div>
            )}
            {showButton && (
                <button
                    onClick={onToggle}
                    className="w-16 h-16 bg-slate-800 hover:bg-slate-700 rounded-full text-white shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-300"
                    aria-label={isOpen ? "Close capture form" : "Open capture form"}
                    title={isOpen ? "Close capture form" : "Open capture form"}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </button>
            )}
        </div>
    );
};