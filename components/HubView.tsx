import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { CharacterData, HubId, CapturedItem, IdeaNode, ExtractedItem } from '../hooks/types';
import { VoiceChatInterface } from './VoiceChatInterface';
import { AvatarCustomizer } from './AvatarCustomizer';

// Character-specific Widgets
import { OmniInbox } from './OmniInbox';
import { QuestLog } from './QuestLog';
import { WeeklyReview } from './WeeklyReview';
import { ValuesPrioritization } from './ValuesPrioritization';
import { ProjectBriefs } from './ProjectBriefs';
import { TrophyRoom } from './TrophyRoom';
import { SundaySermonette } from './SundaySermonette';
import { EmotionalBarometer } from './EmotionalBarometer';
import { CommitmentContract } from './CommitmentContract';
import { BodyDoubleRoom } from './BodyDoubleRoom';
import { ProcrastinationIntervention } from './ProcrastinationIntervention';
import { IdeaGreenhouse } from './IdeaGreenhouse';
import { SomedayMaybeSafari } from './SomedayMaybeSafari';
import { StrategicSinter } from './StrategicSinter';
import { ProactiveTriage } from './ProactiveTriage';
import { DigestProcessor } from './DigestProcessor';
import { TimeWeavingLoom } from './TimeWeavingLoom'; // Ensure this import is available

interface HubViewProps {
  character: CharacterData;
  allCharacters: CharacterData[];
  onBack: () => void;
  inboxItems: CapturedItem[];
  questItems: CapturedItem[];
  completedQuests: CapturedItem[];
  onAvatarSave: (hubId: HubId, newAvatarUrl: string) => void;
  procrastinationAlert: CapturedItem | null;
  onClearProcrastinationAlert: () => void;
  userValues: string[];
  onSetUserValues: (values: string[]) => void;
  onDeleteItem: (itemId: string) => void;
  onPromoteToQuest: (itemId: string) => void;
  onAddQuest: (text: string) => void;
  onBulkAddItems: (items: ExtractedItem[]) => void;
  onCompleteQuest: (itemId: string) => void;
  onPostponeQuest: (itemId: string) => void;
  onStartBossBattle: (item: CapturedItem) => void;
  ideaNodes: IdeaNode[];
  setIdeaNodes: React.Dispatch<React.SetStateAction<IdeaNode[]>>;
  onStartHuddle: () => void;
}

export const HubView: React.FC<HubViewProps> = ({ 
  character, 
  allCharacters, 
  onBack,
  inboxItems,
  questItems,
  completedQuests,
  onAvatarSave,
  procrastinationAlert,
  onClearProcrastinationAlert,
  userValues,
  onSetUserValues,
  onDeleteItem,
  onPromoteToQuest,
  onAddQuest,
  onBulkAddItems,
  onCompleteQuest,
  onPostponeQuest,
  onStartBossBattle,
  ideaNodes,
  setIdeaNodes,
  onStartHuddle
}) => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [showBodyDouble, setShowBodyDouble] = useState(false);
  const [isHuddleActive, setIsHuddleActive] = useState(false);
  // CORRECTED: State variable to manage Bea's dedicated creative views. Obsolete 'jakeView' removed.
  const [beaView, setBeaView] = useState<'default' | 'greenhouse' | 'safari'>('default');
  
  // State for QuestLog Focus Mode
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusQuestId, setFocusQuestId] = useState<string | null>(null);
  const [isFocusLoading, setIsFocusLoading] = useState(false);
  const [focusError, setFocusError] = useState<string | null>(null);

  const handleToggleFocusMode = useCallback(async (enabled: boolean) => {
    setIsFocusMode(enabled);
    setFocusQuestId(null);
    setFocusError(null);

    if (enabled && questItems.length > 0) {
      setIsFocusLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `You are Sonia, a hyper-competent Chief of Staff. Based on the user's core values and their current quest log, identify the single most important quest to focus on to create momentum and clarity.
          
          Core Values:
          ${userValues.join(', ') || 'Not defined. Focus on a task that seems foundational or unblocks others.'}

          Quest Log (JSON format with IDs):
          ${JSON.stringify(questItems.map(q => ({id: q.id, text: q.text})))}

          Respond with a JSON object containing the ID of the most important quest.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "The ID of the most important quest from the provided list." }
              },
              required: ["id"]
            },
          },
        });
        
        const result = JSON.parse(response.text);

        if (result.id && questItems.some(q => q.id === result.id)) {
          setFocusQuestId(result.id);
        } else {
          // Fallback to the first item if the AI fails or returns an invalid ID
          setFocusQuestId(questItems.length > 0 ? questItems.id : null); 
          if(questItems.length > 0) console.warn("AI returned an invalid quest ID, falling back to the first quest.");
        }

      } catch (e) {
        console.error(e);
        setFocusError("Sonia is having trouble focusing right now. Please try again.");
        setIsFocusMode(false);
      } finally {
        setIsFocusLoading(false);
      }
    }
  }, [questItems, userValues]);

  const AvatarComponent = character.avatar;
  
  const renderWidgets = () => {
    switch (character.id) {
      case HubId.Sonia:
        return (
          <div className="space-y-4">
            <div className="p-1 bg-black/10 rounded-xl">
              <div className="space-y-4">
                <OmniInbox 
                  items={inboxItems} 
                  onDeleteItem={onDeleteItem} 
                  onPromoteToQuest={onPromoteToQuest} 
                  onAddQuest={onAddQuest} 
                />
                <QuestLog 
                  items={questItems} 
                  onCompleteQuest={onCompleteQuest} 
                  onStartBossBattle={onStartBossBattle} 
                  onPostponeQuest={onPostponeQuest}
                  isFocusMode={isFocusMode}
                  onToggleFocusMode={handleToggleFocusMode}
                  focusQuestId={focusQuestId}
                  isFocusLoading={isFocusLoading}
                  focusError={focusError}
                />
              </div>
            </div>
            <DigestProcessor onBulkAddItems={onBulkAddItems} />
            <ProactiveTriage onAddQuest={onAddQuest} />
            <button onClick={onStartHuddle} className="w-full text-center p-3 bg-white/60 rounded-lg shadow-sm hover:bg-white/80 font-semibold text-slate-700">Call Team Huddle</button>
            <button onClick={() => setIsHuddleActive(true)} className="w-full text-center p-3 bg-white/60 rounded-lg shadow-sm hover:bg-white/80 font-semibold text-slate-700">Start Strategic Sinter</button>
            <button onClick={() => setShowWeeklyReview(true)} className="w-full text-center p-3 bg-white/60 rounded-lg shadow-sm hover:bg-white/80 font-semibold text-slate-700">Start Weekly Review</button>
            {isHuddleActive && <StrategicSinter onFinish={() => setIsHuddleActive(false)} onBulkAddItems={onBulkAddItems} characters={allCharacters} />}
            {showWeeklyReview && <WeeklyReview onFinish={() => setShowWeeklyReview(false)} />}
            <ValuesPrioritization userValues={userValues} onSetUserValues={onSetUserValues} questItems={questItems} />
            <ProjectBriefs questItems={questItems} inboxItems={inboxItems} completedQuests={completedQuests} characters={allCharacters} />
          </div>
        );
      case HubId.Pep:
        return <TrophyRoom completedQuests={completedQuests} character={character} />;
      case HubId.SisterMary:
        return (
          <div className="space-y-4">
            {procrastinationAlert && <ProcrastinationIntervention quest={procrastinationAlert} onAcknowledge={onClearProcrastinationAlert} character={character}/>}
            <SundaySermonette character={character} completedQuests={completedQuests} />
            <EmotionalBarometer character={character} />
          </div>
        );
      case HubId.FiNancy:
        return <CommitmentContract />;
        
      // JAKE'S ROLE REFINED: Retains Body Double, no creative tools.
      case HubId.Jake:
        return (
          <div className="space-y-4">
            <button onClick={() => setShowBodyDouble(true)} className="w-full text-center p-3 bg-white/60 rounded-lg shadow-sm hover:bg-white/80 font-semibold text-slate-700">Enter Body Double Room</button>
            {showBodyDouble && <BodyDoubleRoom onClose={() => setShowBodyDouble(false)} />}
          </div>
        );
        
      // NEW: BEA'S HUB: Hosts Idea Greenhouse and Someday/Maybe Safari
      case HubId.Bea:
        return (
          <div className="space-y-4">
            <button onClick={() => setBeaView('greenhouse')} className="w-full text-center p-3 bg-white/60 rounded-lg shadow-sm hover:bg-white/80 font-semibold text-slate-700">Enter Idea Greenhouse</button>
            <button onClick={() => setBeaView('safari')} className="w-full text-center p-3 bg-white/60 rounded-lg shadow-sm hover:bg-white/80 font-semibold text-slate-700">Go on a Someday/Maybe Safari</button>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-16 sm:p-8 animate-fade-in-up">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 flex flex-col items-center">
          <div className="relative group w-48 h-48 rounded-full shadow-xl bg-slate-700 p-2 border-4 border-white/50 cursor-pointer" onClick={() => setIsCustomizing(true)}>
            <AvatarComponent className="w-full h-full object-cover rounded-full" />
            <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">Customize</button>
          </div>
          <h2 className="text-3xl font-bold text-white mt-4 font-serif">{character.name}</h2>
          <p className="text-white/80">{character.title}</p>
          <div className="mt-6 w-full max-w-sm">
            {renderWidgets()}
          </div>
        </div>

        <div className="md:w-2/3 flex items-start justify-center">
          {(() => {
            // BEA'S VIEW LOGIC (Hosts the creative widgets: Idea Greenhouse and Someday/Maybe Safari)
            if (character.id === HubId.Bea) {
              switch (beaView) {
                case 'greenhouse':
                  return <IdeaGreenhouse nodes={ideaNodes} setNodes={setIdeaNodes} onBack={() => setBeaView('default')} />;
                case 'safari':
                  return <SomedayMaybeSafari items={inboxItems} onPromoteToQuest={onPromoteToQuest} onDeleteItem={onDeleteItem} onBack={() => setBeaView('default')} />;
                default:
                  return <VoiceChatInterface character={character} onClose={onBack} />;
              }
            }
            
            // DEFAULT VIEW LOGIC (Applies to all other characters, including the now-simplified Jake)
            return <VoiceChatInterface character={character} onClose={onBack} />;

          })()}
        </div>
      </div>
      
      {isCustomizing && (
        <AvatarCustomizer 
          character={character} 
          onClose={() => setIsCustomizing(false)} 
          onSave={(newUrl) => {
            onAvatarSave(character.id, newUrl);
            setIsCustomizing(false);
          }}
        />
      )}
      
    </div>
  );
};