import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CapturedItem, CharacterData } from '../hooks/types';

interface ProjectBriefsProps {
    questItems: CapturedItem[];
    inboxItems: CapturedItem[];
    completedQuests: CapturedItem[];
    characters: CharacterData[];
}

export const ProjectBriefs: React.FC<ProjectBriefsProps> = ({ questItems, inboxItems, completedQuests, characters }) => {
    const [selectedQuestId, setSelectedQuestId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [brief, setBrief] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateBrief = async () => {
        const selectedQuest = questItems.find(q => q.id === selectedQuestId);
        if (!selectedQuest) return;

        setIsLoading(true);
        setBrief(null);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `You are Sonia, a hyper-competent Chief of Staff. Your task is to generate a project brief for a specific quest.
Analyze the user's entire digital ecosystem to find relevant context.

**SELECTED QUEST:**
"${selectedQuest.text}"

**DIGITAL ECOSYSTEM (All user notes, tasks, and completed items):**
Inbox Items:
${inboxItems.map(i => `- ${i.text}`).join('\n') || 'None'}

Active Quests:
${questItems.map(q => `- ${q.text}`).join('\n') || 'None'}

Completed Trophies:
${completedQuests.map(c => `- ${c.text}`).join('\n') || 'None'}

**YOUR TEAM (Potential Collaborators):**
${characters.map(c => `- ${c.name}, ${c.title}`).join('\n')}

**INSTRUCTIONS:**
Based on all the information above, create a concise project brief for the selected quest. The brief should include:
1.  **Summary:** A one-sentence summary of the objective.
2.  **Related Notes:** Pull out 1-3 relevant notes or tasks from the ecosystem that might be related. If none, state that.
3.  **Suggested Collaborators:** Suggest 1-2 team members who could help and briefly explain why.
4.  **Proposed Next Steps:** Suggest 2-3 immediate, actionable next steps to get started.

Format the output in clean Markdown using headings (e.g., "### Summary").`;
            
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setBrief(response.text);

        } catch (e) {
            console.error(e);
            setError("I had trouble generating the brief. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="p-4 sm:p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg w-full animate-fade-in-up border border-white/30 font-sans">
            <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl" aria-hidden="true">📄</span>
                <h2 className="text-2xl font-bold text-slate-700 font-serif">Project Briefs</h2>
            </div>
            <p className="text-slate-600 mb-4 text-sm">Let Sonia analyze a quest and prepare a strategic brief for you.</p>

            {questItems.length > 0 ? (
                <div className="flex flex-col sm:flex-row gap-2">
                    <select
                        value={selectedQuestId}
                        onChange={e => setSelectedQuestId(e.target.value)}
                        className="w-full p-2 bg-white/60 border-2 border-slate-300/40 rounded-md shadow-inner"
                    >
                        <option value="" disabled>Select a quest to analyze...</option>
                        {questItems.map(quest => (
                            <option key={quest.id} value={quest.id}>{quest.text}</option>
                        ))}
                    </select>
                    <button 
                        onClick={handleGenerateBrief} 
                        disabled={!selectedQuestId || isLoading}
                        className="px-6 py-2 bg-gradient-to-br from-sky-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-sky-500/30 hover:from-sky-600 hover:to-blue-600 transition-all disabled:from-sky-400 disabled:to-blue-400 disabled:shadow-none disabled:cursor-not-allowed flex-shrink-0"
                    >
                        {isLoading ? "Analyzing..." : "Generate Brief"}
                    </button>
                </div>
            ) : (
                <p className="text-center text-slate-500 text-sm py-4">You need active quests to generate a brief.</p>
            )}

            {error && <p className="text-red-500 text-center font-medium mt-4">{error}</p>}
            
            {brief && (
                <div className="mt-4 p-4 bg-sky-50/50 rounded-lg border border-sky-200/50 animate-fade-in prose prose-slate max-w-none prose-h3:font-serif prose-h3:text-slate-700">
                    {brief.split('\n').map((line, i) => {
                        if (line.startsWith('### ')) return <h3 key={i} className="font-bold mt-4 mb-1">{line.replace('### ', '')}</h3>
                        if (line.startsWith('- ')) return <p key={i} className="my-1">{line}</p>
                        return <p key={i} className="my-1">{line}</p>
                    })}
                </div>
            )}
        </div>
    );
};