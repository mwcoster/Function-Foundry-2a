import React, { useState } from 'react';

interface WeeklyReviewProps {
    onFinish: () => void;
}

const reviewSteps = [
    {
        title: "Clear Your Head",
        emoji: "🧠",
        prompt: "First, let's get everything out of your head. What's been on your mind? Any new ideas, worries, or to-dos? Don't filter, just capture.",
        action: "I've captured everything"
    },
    {
        title: "Process Your Inboxes",
        emoji: "📥",
        prompt: "Now, look at your inboxes (email, physical mail, voicemails, and your Omni-Inbox here). Process each item to empty. Does it require action? Can it be delegated, deferred, or deleted?",
        action: "Inboxes are clear"
    },
    {
        title: "Review Your Quests",
        emoji: "🗺️",
        prompt: "Take a look at your current Quest Log. Are these still the right things to be working on? Do any need to be broken down further or rescheduled?",
        action: "Quests reviewed"
    },
    {
        title: "Look Ahead",
        emoji: "🗓️",
        prompt: "Finally, check your calendar for the upcoming week. Are there any appointments or events you need to prepare for? Block out time for your important quests.",
        action: "I'm ready for the week"
    }
];

export const WeeklyReview: React.FC<WeeklyReviewProps> = ({ onFinish }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const step = reviewSteps[currentStep];

    const handleNext = () => {
        if (currentStep < reviewSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onFinish();
        }
    };

    return (
        <div className="p-4 sm:p-8 bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg w-full max-w-2xl animate-fade-in-up border border-white/30 font-sans text-center">
            <div className="mb-6">
                <span className="text-5xl">{step.emoji}</span>
                <h2 className="text-3xl font-bold text-slate-800 font-serif mt-2">{step.title}</h2>
                <div className="w-24 h-1 bg-sky-300 mx-auto mt-3 rounded-full" />
            </div>
            <p className="text-slate-700 text-lg leading-relaxed max-w-lg mx-auto mb-8">
                {step.prompt}
            </p>
            <button
                onClick={handleNext}
                className="px-8 py-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
                {step.action}
            </button>
        </div>
    );
};