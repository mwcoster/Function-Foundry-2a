import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { HubId } from '../hooks/types';

// --- IMPORTANT ---
// These types are our local "stand-in" for the ones
// we are no longer importing from '@google/genai'
enum Type { OBJECT = 'OBJECT', STRING = 'STRING' }
enum Modality { AUDIO = 'AUDIO' }
interface FunctionDeclaration { name: string; parameters: any; description?: string; }
interface Blob { data: string; mimeType: string; }
interface LiveServerMessage {
  toolCall?: { functionCalls: { id: string; name: string; args: any }[] };
  serverContent?: {
    modelTurn?: { parts?: { inlineData?: { data: string } }[] };
  };
}
// --- END TYPES ---

// A local interface to represent the LiveSession object.
// We are now using a native WebSocket.
interface LiveSession {
  send(data: string): void; // We will now send stringified JSON
  close(): void;
}

// --- Utility Functions (Unchanged from your original) ---

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

interface GlobalVoiceControlProps {
  onCapture: (text: string) => void;
  onOpenHub: (id: HubId) => void;
  onCloseHub: () => void;
  onAddQuest: (text: string) => void;
  onSparkJoy: () => void;
  onToggleSanctuaryMode: () => void;
  onStartHuddle: () => void;
}

export interface GlobalVoiceControlHandle {
  startListening: () => void;
  stopListening: () => void;
}

const functionDeclarations: FunctionDeclaration[] = [
  // ... (Your function declarations are fine, I'm copying them)
  {
    name: 'capture',
    parameters: {
      type: Type.OBJECT,
      description: 'Captures a thought, idea, or to-do item into the user\'s inbox.',
      properties: {
        item: {
          type: Type.STRING,
          description: 'The content of the item to capture. For example, "buy milk" or "new idea for the marketing campaign".',
        },
      },
      required: ['item'],
    },
  },
  {
    name: 'openHub',
    parameters: {
      type: Type.OBJECT,
      description: 'Opens the view for a specific character or "hub".',
      properties: {
        characterName: {
          type: Type.STRING,
          description: 'The name of the character hub to open. Can be "Sonia", "Pep", "Sister Mary", "Fi-Nancy", "Jake", or "Bea".',
        },
      },
      required: ['characterName'],
    },
  },
  {
    name: 'closeHub',
    parameters: {
      type: Type.OBJECT,
      description: 'Closes the current character hub view and returns to the main lounge screen.',
      properties: {},
    },
  },
  {
    name: 'addQuest',
    parameters: {
      type: Type.OBJECT,
      description: 'Adds a new quest directly to the user\'s quest log.',
      properties: {
        quest: {
          type: Type.STRING,
          description: 'The content of the quest to add. For example, "finish the project proposal".',
        },
      },
      required: ['quest'],
    },
  },
  {
    name: 'sparkJoy',
    parameters: {
      type: Type.OBJECT,
      description: 'Triggers a delightful, brief celebration animation.',
      properties: {},
    },
  },
  {
    name: 'toggleSanctuaryMode',
    parameters: {
      type: Type.OBJECT,
      description: 'Toggles Sanctuary Mode on or off to provide a calmer, monochrome interface.',
      properties: {},
    },
  },
  {
    name: 'startHuddle',
    parameters: {
      type: Type.OBJECT,
      description: 'Initiates a "Team Huddle" with Sonia and Sister Mary Samuel for a quick piece of strategic advice.',
      properties: {},
    },
  },
];

export const GlobalVoiceControl = forwardRef<GlobalVoiceControlHandle, GlobalVoiceControlProps>((props, ref) => {
  const { onCapture, onOpenHub, onCloseHub, onAddQuest, onSparkJoy, onToggleSanctuaryMode, onStartHuddle } = props;
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  
  // This ref will now hold a native WebSocket object
  const sessionRef = useRef<WebSocket | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setIsAvailable(true);
    }
    return () => {
      // Ensure we clean up on unmount
      stopListening();
    };
  }, []);

  // --- THIS IS THE FULLY REWRITTEN startListening FUNCTION ---
  const startListening = async () => {
    // 1. We no longer check for API Key. The server handles it.
    if (isListening) { 
      return;
    }

    setIsListening(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 2. Build the WebSocket URL to point to OUR proxy.
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsHost = window.location.host;
      const modelPath = 'v1beta/models/gemini-2.5-flash-native-audio-preview-09-2025:connect';
      const proxyUrl = `${wsProtocol}//${wsHost}/api-proxy/${modelPath}`;

      // 3. Create a native WebSocket connection.
      const ws = new WebSocket(proxyUrl);
      sessionRef.current = ws;

      ws.onopen = () => {
        console.log('Global voice session opened via proxy.');
        
        // 4. Send the *initial configuration* as the first message.
        // This is where your "proper prompt and system instructions" go.
        const configMessage = {
          config: {
            responseModalities: [Modality.AUDIO],
            tools: [{ functionDeclarations }],
            systemInstruction: 'You are a voice assistant for a productivity app called "The Hub". The user will give you commands to manage their tasks. Call the appropriate functions. If the user asks to "call a huddle" or "start a huddle", use the startHuddle function. If the user simply says the name of a character (Sonia, Pep, Sister Mary, Fi-Nancy, Jake, or Bea), treat it as a command to open that character\'s hub using the `openHub` function. Confirm actions with short, friendly phrases like "Got it." or "Opening Sonia\'s hub for you."',
          },
        };
        ws.send(JSON.stringify(configMessage));

        // 5. Set up all the audio processing (this is the same as before)
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);

        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
          const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
          const pcmBlob = createBlob(inputData);
          
          // 6. Send audio data as a stringified JSON object
          const audioMessage = {
            clientContent: { media: pcmBlob }
          };
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(audioMessage));
          }
        };
        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
      };

      ws.onmessage = async (event) => {
        const message: LiveServerMessage = JSON.parse(event.data);
        
        // 7. Handle incoming tool calls
        if (message.toolCall) {
          for (const fc of message.toolCall.functionCalls) {
            let result = "ok";
            // ... (your switch statement logic is unchanged)
            switch (fc.name) {
              case 'capture': onCapture(fc.args.item as string); break;
              case 'addQuest': onAddQuest(fc.args.quest as string); break;
              case 'closeHub': onCloseHub(); break;
              case 'sparkJoy': onSparkJoy(); break;
              case 'toggleSanctuaryMode': onToggleSanctuaryMode(); break;
              case 'startHuddle': onStartHuddle(); break;
              case 'openHub':
                const hubId = ((fc.args.characterName as string).toLowerCase().replace(/[\s-]/g, '') as HubId);
                const matchedId = Object.values(HubId).find(id => id.replace('-', '') === hubId);
                if (matchedId) {
                  onOpenHub(matchedId);
                } else {
                  result = `Unknown character: ${fc.args.characterName}`;
                }
                break;
              default: result = `Unknown function: ${fc.name}`;
            }
            
            // 8. Send the tool response back to the model
            const toolResponse = {
              functionResponses: { id: fc.id, name: fc.name, response: { result } }
            };
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify(toolResponse));
            }
          }
        }
        
        // 9. Handle incoming audio (same as your original logic)
        const base64EncodedAudioString = message.serverContent?.modelTurn?.parts?.find(p => p.inlineData)?.inlineData?.data;
        if (base64EncodedAudioString && outputAudioContextRef.current) {
          nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
          const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputAudioContextRef.current, 24000, 1);
          const source = outputAudioContextRef.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(outputAudioContextRef.current.destination);
          source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
          source.start(nextStartTimeRef.current);
          nextStartTimeRef.current += audioBuffer.duration;
          audioSourcesRef.current.add(source);
        }
      };

      ws.onerror = (e: Event) => {
        console.error('Global voice session WebSocket error:', e);
        stopListening();
      };

      ws.onclose = (e: CloseEvent) => {
        console.log('Global voice session WebSocket closed.');
        if (e.reason) {
          console.error(`WebSocket closed with reason: ${e.reason}`);
        }
        stopListening(); // Ensure full cleanup
      };

    } catch (err) {
      console.error('Error starting voice session:', err);
      alert("Could not access microphone. Please check permissions.");
      setIsListening(false);
    }
  };

  // --- THIS IS THE UPDATED stopListening FUNCTION ---
  const stopListening = () => {
    if (!isListening && !sessionRef.current) return;

    sessionRef.current?.close();
    sessionRef.current = null;
    
    scriptProcessorRef.current?.disconnect();
    mediaStreamSourceRef.current?.disconnect();
    inputAudioContextRef.current?.close().catch(console.error);
    outputAudioContextRef.current?.close().catch(console.error);

    for (const source of audioSourcesRef.current.values()) {
      source.stop();
    }
    audioSourcesRef.current.clear();

    scriptProcessorRef.current = null;
    mediaStreamSourceRef.current = null;
    inputAudioContextRef.current = null;
    outputAudioContextRef.current = null;
    nextStartTimeRef.current = 0;

    setIsListening(false);
  };
  
  useImperativeHandle(ref, () => ({
    startListening,
    stopListening,
  }));

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  if (!isAvailable) return null;

  // ... (Your JSX return statement is UNCHANGED)
  return (
    <div className="fixed bottom-8 left-8 z-30">
      <button
        onClick={handleToggleListening}
        className={`w-16 h-16 rounded-full text-white shadow-lg flex items-center justify-center transform hover:scale-110 transition-all duration-300 bg-slate-800 hover:bg-slate-700 ${isListening ? 'animate-pulse' : ''}`}
        aria-label={isListening ? "Stop voice control" : "Start voice control"}
        title={isListening ? "Stop voice control" : "Start voice control"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
          {isListening ? (
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          ) : (
            <>
              <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
              <path d="M5.5 10.5a.5.5 0 01.5.5v1a4 4 0 004 4h0a4 4 0 004-4v-1a.5.5 0 011 0v1a5 5 0 01-4.5 4.975V19h2a.5.5 0 010 1h-5a.5.5 0 010-1h2v-1.525A5 5 0 014.5 12v-1a.5.5 0 01.5-.5z" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
});
