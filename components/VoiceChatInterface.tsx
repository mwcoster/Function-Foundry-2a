import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CharacterData, HubId } from '../hooks/types';
import { CONVERSATION_STARTERS } from '../constants';

// --- IMPORTANT ---
// These types are now our local "stand-in" for the ones
// we are no longer importing from '@google/genai'
enum Type { OBJECT = 'OBJECT', STRING = 'STRING' }
enum Modality { AUDIO = 'AUDIO' }
interface FunctionDeclaration { name: string; parameters: any; description?: string; }
interface Blob { data: string; mimeType: string; }
interface LiveServerMessage {
  toolCall?: { functionCalls: { id: string; name: string; args: any }[] };
  serverContent?: {
    inputTranscription?: { text: string };
    outputTranscription?: { text: string };
    turnComplete?: boolean;
    modelTurn?: { parts?: { inlineData?: { data: string } }[] };
  };
}
// --- END TYPES ---


// Define structures used within the component
// A local interface to represent the LiveSession object, as it's not exported from the library.
interface LiveSession {
  send(data: string): void; // We will now send stringified JSON
  close(): void;
}

type ChatStatus = 'IDLE' | 'CONNECTING' | 'LISTENING' | 'SPEAKING' | 'ENDED' | 'ERROR';

interface TranscriptItem {
  speaker: 'user' | 'model';
  text: string;
}

interface AudioResources {
  stream: MediaStream | null;
  inputCtx: AudioContext | null;
  outputCtx: AudioContext | null;
  source: MediaStreamAudioSourceNode | null;
  processor: ScriptProcessorNode | null;
  playingSources: Set<AudioBufferSourceNode>;
  nextStartTime: number;
}

interface VoiceChatInterfaceProps {
  character: CharacterData;
  onClose: () => void;
}

// --- Utility Functions (Unchanged) ---

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const getVoiceForCharacter = (id: HubId): string => {
  switch (id) {
    case HubId.Sonia: return 'Zephyr';
    case HubId.SisterMary: return 'Zephyr';
    case HubId.Pep: return 'Kore';
    case HubId.FiNancy: return 'Puck';
    case HubId.Jake: return 'Charon';
    case HubId.Bea: return 'Luna';
    default: return 'Zephyr';
  }
};

// --- Component ---

export const VoiceChatInterface: React.FC<VoiceChatInterfaceProps> = ({ character, onClose }) => {
  const [status, setStatus] = useState<ChatStatus>('IDLE');
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  
  // This ref will now hold a native WebSocket object
  const sessionRef = useRef<WebSocket | null>(null);
  const audioResourcesRef = useRef<AudioResources>({ playingSources: new Set(), nextStartTime: 0 } as any);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [transcript, currentInput, currentOutput]);

  const closeHubFunction: FunctionDeclaration = {
    name: 'closeHub',
    parameters: {
      type: Type.OBJECT,
      description: 'Closes the current character hub view and returns to the main lounge screen.',
      properties: {},
    },
  };

  const saveTranscriptForAdaptiveCore = async (finalTranscript: TranscriptItem[]) => {
    setIsSaving(true);
    console.log(`[ADAPTIVE CORE] Saving transcript from ${character.name} for NLP analysis.`);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
  };

  const stopSession = () => {
    sessionRef.current?.close();
    sessionRef.current = null;

    const audio = audioResourcesRef.current;
    audio.stream?.getTracks().forEach(track => track.stop());
    audio.processor?.disconnect();
    audio.source?.disconnect();
    audio.inputCtx?.close().catch(console.error);
    audio.outputCtx?.close().catch(console.error);

    for (const source of audio.playingSources.values()) {
      source.stop();
    }
    audio.playingSources.clear();
    
    // ... clear other audio refs ...
    audio.processor = null;
    audio.source = null;
    audio.inputCtx = null;
    audio.outputCtx = null;
    audio.nextStartTime = 0;

    setStatus('ENDED');
  };

  const handleEndAndClose = useCallback(async () => {
    stopSession();
    await saveTranscriptForAdaptiveCore(transcript);
    onClose();
  }, [transcript, onClose]);


  // --- THIS IS THE FULLY REWRITTEN FUNCTION ---
  const startSession = async () => {
    // 1. We no longer check for API_KEY here. The server handles it.
    setStatus('CONNECTING');
    setTranscript([{ speaker: 'model', text: character.introDialogue }]);
    const audio = audioResourcesRef.current;

    try {
      audio.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus('LISTENING');

      const voiceName = getVoiceForCharacter(character.id);

      // 2. Build the WebSocket URL to point to OUR proxy.
      // We also determine if we're on a secure (wss) or insecure (ws) connection.
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsHost = window.location.host; // e.g., "localhost:3000" or "your-app.com"
      
      // This is the model path. Your server proxy will forward this to Google.
      const modelPath = 'v1beta/models/gemini-2.5-flash-native-audio-preview-09-2025:connect';
      
      // This is the *magic*. We call our OWN server.
      const proxyUrl = `${wsProtocol}//${wsHost}/api-proxy/${modelPath}`;

      // 3. Create a native WebSocket connection.
      //    We are NO LONGER using ai.live.connect.
      const ws = new WebSocket(proxyUrl);
      sessionRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected to proxy.");
        
        // 4. Send the *initial configuration* as the first message.
        //    This is what ai.live.connect was doing for us.
        const configMessage = {
          config: {
            responseModalities: [Modality.AUDIO],
            tools: [{ functionDeclarations: [closeHubFunction] }],
            systemInstruction: `${character.basePrompt}. You are in a voice conversation. Be concise. If the user says "go back" or "return to lounge", call the closeHub function.`,
            outputAudioTranscription: {},
            inputAudioTranscription: {},
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName } },
            },
          },
        };
        ws.send(JSON.stringify(configMessage));

        // 5. Set up all the audio processing (this is the same as before)
        audio.inputCtx = new AudioContext({ sampleRate: 16000 });
        audio.outputCtx = new AudioContext({ sampleRate: 24000 });
        audio.source = audio.inputCtx.createMediaStreamSource(audio.stream!);
        audio.processor = audio.inputCtx.createScriptProcessor(4096, 1, 1);
        audio.processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          
          // 6. Send audio data as a stringified JSON object
          //    instead of session.sendRealtimeInput(...)
          const audioMessage = {
            clientContent: { media: createBlob(inputData) }
          };
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(audioMessage));
          }
        };
        audio.source.connect(audio.processor);
        audio.processor.connect(audio.inputCtx.destination);
      };

      ws.onmessage = async (event) => {
        const msg: LiveServerMessage = JSON.parse(event.data);
        
        // 7. Handle incoming messages (same logic as before)
        if (msg.toolCall?.functionCalls?.some(fc => fc.name === 'closeHub')) {
          // We must send a tool response back!
          const toolResponse = {
            functionResponses: { id: msg.toolCall.functionCalls[0].id, name: 'closeHub', response: { result: "ok" } }
          };
          ws.send(JSON.stringify(toolResponse));
          handleEndAndClose();
          return;
        }
        
        if (msg.serverContent?.inputTranscription)
          setCurrentInput(t => t + msg.serverContent!.inputTranscription!.text);

        if (msg.serverContent?.outputTranscription)
          setCurrentOutput(t => t + msg.serverContent!.outputTranscription!.text);

        if (msg.serverContent?.turnComplete) {
          setTranscript(prev => [
            ...prev,
            { speaker: 'user', text: currentInput },
            { speaker: 'model', text: currentOutput },
          ]);
          setCurrentInput('');
          setCurrentOutput('');
        }

        const audioData = msg.serverContent?.modelTurn?.parts?.find(p => p.inlineData)?.inlineData?.data;
        if (audioData && audio.outputCtx) {
          setStatus('SPEAKING');
          audio.nextStartTime = Math.max(audio.nextStartTime, audio.outputCtx.currentTime);
          const buffer = await decodeAudioData(decode(audioData), audio.outputCtx, 24000, 1);
          const sourceNode = audio.outputCtx.createBufferSource();
          sourceNode.buffer = buffer;
          sourceNode.connect(audio.outputCtx.destination);
          sourceNode.onended = () => {
            audio.playingSources.delete(sourceNode);
            if (audio.playingSources.size === 0) setStatus('LISTENING');
          };
          sourceNode.start(audio.nextStartTime);
          audio.nextStartTime += buffer.duration;
          audio.playingSources.add(sourceNode);
        }
      };

      ws.onerror = (e) => {
        console.error('Voice session WebSocket error:', e);
        setStatus('ERROR');
      };

      ws.onclose = (e: CloseEvent) => {
        console.log('Voice session WebSocket closed.');
         // --- THIS IS THE NEW DEBUGGING CODE ---
        if (e.reason) {
          console.error(`WebSocket closed with reason: ${e.reason}`);
        }
        // --- END NEW DEBUGGING CODE ---
        setStatus('ENDED');
      };

    } catch (err) {
      console.error('Error starting voice session:', err);
      setStatus('ERROR');
    }
  };


  useEffect(() => {
    startSession(); // Start the session on component mount
    return () => { stopSession(); }; // Clean up on unmount
  }, [character.id]); // Re-start if the character changes

  
  return (
    <div className="w-full max-w-2xl bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 font-sans flex flex-col h-[70vh] animate-fade-in-up">
      <div className="flex items-center justify-between p-4 border-b border-white/50">
        <div className="flex items-center gap-3">
          {typeof character.avatar !== 'string'
            ? <character.avatar className="w-8 h-8 rounded-full bg-slate-400 p-1" />
            : <span className="text-3xl">🤖</span>}
          <h2 className="text-xl font-bold text-slate-700 font-serif">{character.name}'s Hub</h2>
        </div>
        <button
          onClick={handleEndAndClose}
          disabled={isSaving}
          className="px-4 py-2 bg-rose-200 text-rose-800 font-semibold rounded-lg hover:bg-rose-300 transition-colors shadow-sm text-sm"
        >
          {isSaving ? 'Logging Data...' : 'End Session'}
        </button>
      </div>

      <div className="flex-grow p-4 overflow-y-auto custom-scrollbar space-y-4">
        {transcript.map((item, index) => (
          <div key={index} className={`flex ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] p-3 rounded-xl ${
                item.speaker === 'user'
                  ? 'bg-indigo-500 text-white rounded-br-none'
                  : 'bg-slate-200 text-slate-800 rounded-tl-none'
              }`}
            >
              {item.text}
            </div>
          </div>
        ))}
        {currentInput && <div className="text-right italic text-slate-500">... {currentInput}</div>}
        {currentOutput && <div className="text-left italic text-slate-500">{currentOutput}</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 p-3 border-t border-white/50 flex flex-col justify-between items-center">
        <div className="text-sm font-semibold text-slate-700 w-full flex justify-between items-center">
          {status === 'LISTENING' && (
            <span className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Listening...
            </span>
          )}
          {status === 'SPEAKING' && (
            <span className="flex items-center gap-2 text-blue-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Speaking...
            </span>
          )}
          {status === 'CONNECTING' && <span>Connecting to the Executive Suite...</span>}
          {status === 'ENDED' && <span>Session Ended.</span>}
          {status === 'ERROR' && <span className="text-red-500">Connection Error.</span>}
          {isSaving && <span className="text-sm text-indigo-500">Saving reflection data...</span>}
        </div>

        <div className="mt-2 w-full flex justify-center">
          <p className="text-xs text-slate-500 text-center">
            {CONVERSATION_STARTERS[character.id]
              ? `Try saying: "${CONVERSATION_STARTERS[character.id]}"`
              : "Start the conversation."}
          </p>
        </div>
      </div>
    </div>
  );
};