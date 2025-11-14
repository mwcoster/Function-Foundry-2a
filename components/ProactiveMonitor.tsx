import React, { useState, useEffect, useCallback } from 'react';
import { CapturedItem, TimeBlock } from '../hooks/types';
import { CHARACTERS } from '../constants';

interface ProactiveMonitorProps {
    questItems: CapturedItem[];
    timeBlocks: TimeBlock[];
    isFocusing: boolean; // Placeholder for future deep work detection
    onProcrastinationNudge: (quest: CapturedItem) => void;
    onTransitionNudge: (type: 'context' | 'time') => void;
    onSilenceAlarm: () => void;
}

// Internal monitoring interval (runs every minute to check time-based triggers)
const MONITOR_INTERVAL_MS = 60000;

// Hardcoded timing variables for triggers
const TIME_FOR_PRE_NUDGE = 30; // 30 minutes before a task is due
const FOCUS_BLOCK_DURATION = 120; // 120 minutes (2 hours) for Silence Alarm

export const ProactiveMonitor: React.FC<ProactiveMonitorProps> = ({
    questItems,
    timeBlocks,
    isFocusing,
    onProcrastinationNudge,
    onTransitionNudge,
    onSilenceAlarm,
}) => {
    const [lastScanTime, setLastScanTime] = useState(Date.now());
    const [lastSilenceAlarmTrigger, setLastSilenceAlarmTrigger] = useState(0);

    // --- TRIGGER 1: The 'Procrastination Dragon' Pre-Nudge (Dr. Maria Flores) ---
    // Triggered when a high-friction task is due soon and has been postponed repeatedly. [6]
    const checkProcrastinationNudge = useCallback(() => {
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        
        // Find a task that is high friction (postponed >= 2 times)
        const imminentDragon = questItems.find(q => 
            (q.postponedCount || 0) >= 2 
        );
        
        if (imminentDragon) {
            // Find if this task is scheduled within the next TIME_FOR_PRE_NUDGE minutes
            const scheduledBlock = timeBlocks.find(b => b.questId === imminentDragon.id);
            
            if (scheduledBlock) {
                const scheduledMinutes = scheduledBlock.startHour * 60;
                
                // Check if the task starts within the pre-nudge window
                if (scheduledMinutes > nowMinutes && scheduledMinutes - nowMinutes <= TIME_FOR_PRE_NUDGE) {
                    onProcrastinationNudge(imminentDragon);
                }
            }
        }
    }, [questItems, timeBlocks, onProcrastinationNudge]);

    // --- TRIGGER 2: The 'Executive Suite' Silence Alarm (Sarah Chen) ---
    // Triggered when app state indicates prolonged inactivity during a focus block. [5]
    const checkSilenceAlarm = useCallback(() => {
        // We simulate the accelerometer/screen data check using the isFocusing prop
        const timeSinceLastAlarm = Date.now() - lastSilenceAlarmTrigger;

        if (isFocusing && timeSinceLastAlarm > FOCUS_BLOCK_DURATION * MONITOR_INTERVAL_MS) { // 2 hours of simulated inactivity
            onSilenceAlarm();
            setLastSilenceAlarmTrigger(Date.now()); // Reset timer
        }
    }, [isFocusing, lastSilenceAlarmTrigger, onSilenceAlarm]);

    // --- TRIGGER 3: The 'Context Switch Buffer' (Dex Dexter) ---
    // Triggered before a stressed context switch (simulated via time blocks). [7]
    const checkTransitionNudge = useCallback(() => {
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        
        // Look for a scheduled task ending within the next few minutes that typically requires a context shift (e.g., Finance, Review, Meeting keywords)
        const imminentTransition = timeBlocks.find(b => {
            const endHour = b.startHour + b.duration;
            const endMinutes = endHour * 60;
            
            // Check if the task is ending within 5 minutes AND is a 'stressful' keyword
            const isFinishingSoon = endMinutes > nowMinutes && endMinutes - nowMinutes <= 5;
            const isStressful = b.title.toLowerCase().includes('review') || b.title.toLowerCase().includes('financial') || b.title.toLowerCase().includes('meeting');
            
            return isFinishingSoon && isStressful;
        });

        if (imminentTransition) {
            onTransitionNudge('context');
        }
    }, [timeBlocks, onTransitionNudge]);


    // Master Effect Loop
    useEffect(() => {
        const intervalId = setInterval(() => {
            checkProcrastinationNudge();
            checkSilenceAlarm();
            checkTransitionNudge();
            setLastScanTime(Date.now());
        }, MONITOR_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, [checkProcrastinationNudge, checkSilenceAlarm, checkTransitionNudge]);
    
    // The monitor component renders nothing visible
    return null;
};