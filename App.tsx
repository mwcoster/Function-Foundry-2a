import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTimeOfDay } from './components/useTimeOfDay';
import { HubContainer } from './components/HubContainer';
import { Lounge } from './components/Lounge';
import { HubView } from './components/HubView';
import { CaptureButton } from './components/CaptureButton';
import { OnboardingGuide } from './components/OnboardingGuide';
import { PraiseToast } from './components/PraiseToast';
import { GlobalVoiceControl, GlobalVoiceControlHandle } from './components/GlobalVoiceControl';
import { SanctuaryModeToggle } from './components/SanctuaryModeToggle';
import { AffirmationMessage } from './components/AffirmationMessage';
import { CHARACTERS } from './constants';
import { HubId, CapturedItem, CharacterData, TimeBlock, IdeaNode, ExtractedItem } from './hooks/types';
import { BossBattle } from './components/BossBattle';
import { TransitionRitual } from './components/TransitionRitual';
import { DailyDigest } from './components/DailyDigest';
import { TeamHuddle } from './components/TeamHuddle';
import { TimeWeavingLoom } from './components/TimeWeavingLoom';
import { DayProgressBar } from './components/DayProgressBar';
import { ProactiveMonitor } from './components/ProactiveMonitor'; 

// Simple hook to persist state to localStorage
const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error(error);
      return defaultValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};


const App: React.FC = () => {
  const timeOfDay = useTimeOfDay();
  const [isOnboarding, setIsOnboarding] = usePersistentState('isOnboardingCompleted', true);
  const [inboxItems, setInboxItems] = usePersistentState<CapturedItem[]>('inboxItems', []);
  const [questItems, setQuestItems] = usePersistentState<CapturedItem[]>('questItems', []);
  const [completedQuests, setCompletedQuests] = usePersistentState<CapturedItem[]>('completedQuests', []);
  const [userValues, setUserValues] = usePersistentState<string[]>('userValues', []);
  const [timeBlocks, setTimeBlocks] = usePersistentState<TimeBlock[]>('timeBlocks', []);
  const [ideaNodes, setIdeaNodes] = usePersistentState<IdeaNode[]>('ideaNodes', []);
  const [activeHub, setActiveHub] = useState<HubId | null>(null);
  const [isCaptureModalOpen, setCaptureModalOpen] = useState(false);
  const [isSanctuaryMode, setSanctuaryMode] = useState(false);
  const [praiseMessage, setPraiseMessage] = useState<string | null>(null);
  const [bossBattleQuest, setBossBattleQuest] = useState<CapturedItem | null>(null);
  const [characters, setCharacters] = useState<Record<HubId, CharacterData>>(CHARACTERS);
  const [procrastinationAlert, setProcrastinationAlert] = usePersistentState<CapturedItem | null>('procrastinationAlert', null);
  const [transitionInfo, setTransitionInfo] = useState<{ questId: string } | null>(null);
  const [showDailyDigest, setShowDailyDigest] = useState(false);
  const [isTeamHuddleActive, setIsTeamHuddleActive] = useState(false);
  const [isLoomOpen, setIsLoomOpen] = useState(false);
  
  // PROACTIVE STATE (Phase 4)
  const [isFocusing, setIsFocusing] = useState(false);
  const [transitionNudge, setTransitionNudge] = useState<'context' | 'time' | null>(null);
  const [isSilenceAlarmActive, setIsSilenceAlarmActive] = useState(false);

  const globalVoiceControlRef = useRef<GlobalVoiceControlHandle>(null);
  const prevActiveHubRef = useRef<HubId | null>(activeHub);

  useEffect(() => {
    if (activeHub === null && prevActiveHubRef.current !== null) {
      setTimeout(() => {
        // globalVoiceControlRef.current?.startListening(); // This line is commented out as part of the fix
      }, 250);
    } else if (activeHub !== null && prevActiveHubRef.current === null) {
      // globalVoiceControlRef.current?.stopListening(); // This line is commented out as part of the fix
    }
    prevActiveHubRef.current = activeHub;
  }, [activeHub]);
  
  // FIX: Explicitly access the date part  for correct string comparison (Error 1)
 useEffect(() => {
  const lastDigestDate = window.localStorage.getItem('lastDigestDate');
  const today = new Date().toISOString().split('T')[0]; // ✅ use only date string
  if (lastDigestDate !== today) {
    setShowDailyDigest(true);
  }
}, []);

const handleCloseDigest = () => {
  const today = new Date().toISOString().split('T')[0]; // ✅ same fix
  window.localStorage.setItem('lastDigestDate', today);
  setShowDailyDigest(false);
};


  const showPraise = (message: string) => {
    setPraiseMessage(message);
  };

  const handleCapture = useCallback((text: string) => {
    setInboxItems(prev => [...prev, { id: uuidv4(), text, postponedCount: 0 }]);
    setCaptureModalOpen(false);
    showPraise("Captured!");
  }, [setInboxItems]);

  const handleDeleteInboxItem = (itemId: string) => {
    setInboxItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handlePromoteToQuest = (itemId: string) => {
    const item = inboxItems.find(i => i.id === itemId);
    if (item) {
      setQuestItems(prev => [...prev, item]);
      setInboxItems(prev => prev.filter(i => i.id !== itemId));
      showPraise("New Quest Added!");
    }
  };

  const handleAddQuest = useCallback((text: string) => {
    setQuestItems(prev => [...prev, { id: uuidv4(), text, postponedCount: 0 }]);
    showPraise("New Quest Added!");
  }, [setQuestItems]);

  const handleBulkAddItems = useCallback((items: ExtractedItem[]) => {
    const newInboxItems: CapturedItem[] = [];
    const newQuestItems: CapturedItem[] = [];
    items.forEach(item => {
      const newItem: CapturedItem = { id: uuidv4(), text: item.text, postponedCount: 0 };
      if (item.type === 'inbox') {
        newInboxItems.push(newItem);
      } else {
        newQuestItems.push(newItem);
      }
    });
    if (newInboxItems.length > 0) {
      setInboxItems(prev => [...prev, ...newInboxItems]);
    }
    if (newQuestItems.length > 0) {
      setQuestItems(prev => [...prev, ...newQuestItems]);
    }
    showPraise(`${items.length} new item(s) added!`);
  }, [setInboxItems, setQuestItems]);

  const handleCompleteQuest = (itemId: string) => {
    const item = questItems.find(q => q.id === itemId);
    if (item) {
      setTransitionInfo({ questId: itemId });
    }
  };

  const handleTransitionComplete = () => {
    if (transitionInfo) {
      const item = questItems.find(q => q.id === transitionInfo.questId);
      if (item) {
        setCompletedQuests(prev => [item, ...prev]);
        setQuestItems(prev => prev.filter(q => q.id !== transitionInfo.questId));
        showPraise("Quest Complete!");
      }
    }
    setTransitionInfo(null);
  };

  const handlePostponeQuest = (itemId: string) => {
    let postponedQuest: CapturedItem | undefined;
    setQuestItems(prev => {
      const newQuests = prev.map(q => {
        if (q.id === itemId) {
          const newCount = (q.postponedCount || 0) + 1;
          postponedQuest = { ...q, postponedCount: newCount };
          return postponedQuest;
        }
        return q;
      });

      if (postponedQuest && postponedQuest.postponedCount && postponedQuest.postponedCount >= 3) {
        if (!procrastinationAlert || (procrastinationAlert.id !== postponedQuest.id)) {
          setProcrastinationAlert(postponedQuest);
        }
      }
      return newQuests;
    });
    showPraise("Quest Postponed.");
  };
  
  const handleBossBattleComplete = (questId: string) => {
    const item = questItems.find(q => q.id === questId);
    if(item) {
      setCompletedQuests(prev => [item, ...prev]);
      setQuestItems(prev => prev.filter(q => q.id !== questId));
    }
    setBossBattleQuest(null);
    showPraise("Boss Battle Victorious!");
  };

  const handleAvatarSave = (hubId: HubId, newAvatarUrl: string) => {
    setCharacters(prev => ({
      ...prev,
      [hubId]: { ...prev[hubId], avatar: newAvatarUrl }
    }));
  };

  const activeCharacter = activeHub ? characters[activeHub] : null;

  const allCharacters = Object.values(characters);
  
  // Handlers for Proactive Monitor Outputs (Phase 4, Sprint 2)
  const handleProcrastinationNudge = useCallback((quest: CapturedItem) => {
    setProcrastinationAlert(quest);
    showPraise("Procrastination Alert: Pre-Nudge initiated.");
  }, []);

  const handleTransitionNudge = useCallback((type: 'context' | 'time') => {
    setTransitionNudge(type);
    showPraise("Transition Buffer Initiated.");
  }, []);

  const handleSilenceAlarm = useCallback(() => {
    setIsSilenceAlarmActive(true);
    showPraise("Silence Alarm Activated.");
  }, []);

  const handleCloseSilenceAlarm = useCallback(() => {
      setIsSilenceAlarmActive(false);
  }, []);
  
  const handleCloseTransitionNudge = useCallback(() => {
      setTransitionNudge(null);
  }, []);


  return (
    <HubContainer timeOfDay={timeOfDay}>
      <div className={`transition-all duration-1000 ${isSanctuaryMode ? 'grayscale' : ''}`}>
        <div className="fixed top-4 right-4 z-40">
          <SanctuaryModeToggle enabled={isSanctuaryMode} onToggle={() => setSanctuaryMode(s => !s)} />
        </div>

        {/* Proactive Monitor Integration (Phase 4) */}
        <ProactiveMonitor
            questItems={questItems}
            timeBlocks={timeBlocks}
            isFocusing={isFocusing} // Pass simulated focus state
            onProcrastinationNudge={handleProcrastinationNudge}
            onTransitionNudge={handleTransitionNudge}
            onSilenceAlarm={handleSilenceAlarm} 
        />
        
        {/* PROACTIVE NUDGE UI COMPONENTS (Phase 4) */}
        {isSilenceAlarmActive && (
             <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-lg animate-fade-in">
                <div className="bg-white/90 p-8 rounded-lg text-center">
                    <p className="text-xl font-bold text-red-600">Silence Alarm Activated!</p>
                    <p className="mt-2 text-slate-700">Pardon the interruption, Artisan. You seem to be in a hyperfocus trap.</p>
                    <button onClick={handleCloseSilenceAlarm} className="mt-4 px-4 py-2 bg-slate-700 text-white rounded">Acknowledge</button>
                </div>
            </div>
        )}
        
        {transitionNudge && (
             <div className="fixed top-0 w-full p-4 z-50 animate-slide-down">
                <div className="bg-indigo-100 p-3 rounded-lg text-center border border-indigo-300">
                    <p className="text-sm font-semibold text-indigo-800">Buffer Protocol Initiated: Context Switch Ahead ({transitionNudge}). Take three deep breaths.</p>
                    <button onClick={handleCloseTransitionNudge} className="mt-1 text-xs text-indigo-600 hover:text-indigo-800">Dismiss</button>
                </div>
            </div>
        )}


        {showDailyDigest && !isOnboarding && (
          <DailyDigest 
            questItems={questItems}
            timeBlocks={timeBlocks}
            onClose={handleCloseDigest}
          />
        )}
        
        {isOnboarding && (
          <OnboardingGuide 
            onFinish={() => setIsOnboarding(false)} 
            onOpenCaptureModal={() => setCaptureModalOpen(true)}
            isCaptureModalOpen={isCaptureModalOpen}
            inboxItemCount={inboxItems.length}
          />
        )}
        
        {activeHub && activeCharacter ? (
          <HubView 
            character={activeCharacter}
            allCharacters={allCharacters}
            onBack={() => setActiveHub(null)}
            inboxItems={inboxItems}
            questItems={questItems}
            completedQuests={completedQuests}
            onAvatarSave={handleAvatarSave}
            procrastinationAlert={procrastinationAlert}
            onClearProcrastinationAlert={() => setProcrastinationAlert(null)}
            userValues={userValues}
            onSetUserValues={setUserValues} 
            onDeleteItem={handleDeleteInboxItem}
            onPromoteToQuest={handlePromoteToQuest}
            onAddQuest={handleAddQuest}
            onBulkAddItems={handleBulkAddItems}
            onCompleteQuest={handleCompleteQuest}
            onPostponeQuest={handlePostponeQuest}
            onStartBossBattle={setBossBattleQuest}
            ideaNodes={ideaNodes}
            setIdeaNodes={setIdeaNodes}
            onStartHuddle={() => setIsTeamHuddleActive(true)}
          />
        ) : (
          <Lounge 
            characters={allCharacters}
            onSelectHub={setActiveHub}
            isSanctuary={isSanctuaryMode}
            procrastinationAlertQuestId={procrastinationAlert?.id || null}
          />
        )}

        {/* Loom and Global Voice Control */}
        {!activeHub && (
          <div className="fixed bottom-0 w-full z-10">
            <div className="fixed bottom-4 left-0 right-0 w-full px-4 z-30 pointer-events-none">
                <div className="pointer-events-auto">
                    <DayProgressBar />
                </div>
            </div>
            
            <div className="flex justify-center mb-8">
              <div
                className="fixed bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 transform cursor-pointer group pointer-events-auto z-30"
                onClick={() => setIsLoomOpen(true)}
                title="Open Time-Weaving Loom"
              >
                  <div className="w-full h-full bg-slate-800 rounded-full shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      {/* Loom Icon Placeholder */}
                  </div>
              </div>
            </div>
            
            
            {isLoomOpen && (
              <div className="fixed inset-0 bg-slate-900/40 z-40 flex items-center justify-center p-4 backdrop-blur-lg animate-fade-in" onClick={() => setIsLoomOpen(false)}>
                <div className="relative bg-white/80 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] p-8 transform transition-all animate-fade-in-up" onClick={e => e.stopPropagation()}>
                  <TimeWeavingLoom 
                    blocks={timeBlocks}
                    setBlocks={setTimeBlocks}
                    questItems={questItems}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
        <CaptureButton 
          isOpen={isCaptureModalOpen} 
          onToggle={() => setCaptureModalOpen(o => !o)} 
          onCapture={handleCapture} 
          showButton={!isOnboarding}
        />
        
        {/* THIS IS THE BROKEN COMPONENT. I HAVE COMMENTED IT OUT 
        TO PREVENT THE APP FROM CRASHING.
        
        {!activeHub && <GlobalVoiceControl 
          ref={globalVoiceControlRef}
          onCapture={handleCapture}
          onOpenHub={setActiveHub}
          onCloseHub={() => setActiveHub(null)}
          onAddQuest={handleAddQuest}
          onSparkJoy={() => showPraise("✨")}
          onToggleSanctuaryMode={() => setSanctuaryMode(s => !s)}
          onStartHuddle={() => setIsTeamHuddleActive(true)}
        />}
        
        */}

        {praiseMessage && <PraiseToast message={praiseMessage} onClose={() => setPraiseMessage(null)} />}
        {bossBattleQuest && <BossBattle quest={bossBattleQuest} onClose={() => setBossBattleQuest(null)} onComplete={handleBossBattleComplete} />}
        {isSanctuaryMode && <AffirmationMessage />}
        {transitionInfo && <TransitionRitual onComplete={handleTransitionComplete} />}
        {isTeamHuddleActive && (
          <TeamHuddle
            onClose={() => setIsTeamHuddleActive(false)}
            questItems={questItems}
            inboxItems={inboxItems}
            characters={allCharacters}
          />
        )}
      </div>
    </HubContainer>
  );
};

export default App;