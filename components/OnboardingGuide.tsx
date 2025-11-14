import React, { useState, useEffect } from 'react';
import { ONBOARDING_STEPS } from '../constants';
import { SoniaAvatar } from './CharacterAvatars';

interface OnboardingGuideProps {
    onFinish: () => void;
    onOpenCaptureModal: () => void;
    isCaptureModalOpen: boolean;
    inboxItemCount: number;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onFinish, onOpenCaptureModal, isCaptureModalOpen, inboxItemCount }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [initialInboxCount, setInitialInboxCount] = useState(inboxItemCount);
    
    const currentStep = ONBOARDING_STEPS[stepIndex];
    const isCaptureQuest = currentStep.action === 'capture';

    // Auto-advance after capture quest is completed
    useEffect(() => {
        if (isCaptureQuest && !isCaptureModalOpen && inboxItemCount > initialInboxCount) {
            handleNext();
        }
    }, [isCaptureQuest, isCaptureModalOpen, inboxItemCount]);

    const handleNext = () => {
        if (stepIndex < ONBOARDING_STEPS.length - 1) {
            setStepIndex(stepIndex + 1);
        }
    };
    
    const handleActionClick = () => {
        switch(currentStep.action) {
            case 'capture':
                setInitialInboxCount(inboxItemCount);
                onOpenCaptureModal();
                break;
            case 'finish':
                onFinish();
                break;
            default:
                handleNext();
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-lg animate-fade-in">
            <div className="relative bg-white/80 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl w-full max-w-2xl p-8 transform transition-all animate-fade-in-up">
                <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-6">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-sky-400 p-2 flex-shrink-0 shadow-lg">
                        <SoniaAvatar />
                    </div>
                    <div>
                        <p className="text-xl text-slate-700 leading-relaxed transition-opacity duration-500" key={stepIndex}>
                            {currentStep.dialogue}
                        </p>
                        <button 
                            onClick={handleActionClick}
                            className="mt-6 px-8 py-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-md transition-colors"
                        >
                            {currentStep.actionText}
                        </button>
                    </div>
                </div>
                 <button 
                    onClick={onFinish}
                    className="absolute bottom-4 right-6 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                    Skip Introduction
                </button>
            </div>
        </div>
    );
};