import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface CommitmentContractProps {
  // We don't need quest items here for the prototype, but the component exists
}

export const CommitmentContract: React.FC<CommitmentContractProps> = () => {
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [stake, setStake] = useState(''); // Financial or other consequence
  // NEW: Symbolic Wager for Loss Aversion
  const [symbolicWager, setSymbolicWager] = useState('');
  const [referee, setReferee] = useState('');
  const [contractText, setContractText] = useState('');

  const generateContract = () => {
    if (!goal || !deadline || !stake || !referee || !symbolicWager) {
      setContractText("Please fill out all fields to generate the contract.");
      return;
    }

    // NOTE: Integrated Loss Aversion Frame (Phase 2, Sprint 3)
    const text = `**Commitment Contract: The Loss Aversion Wager**

I, the undersigned, do hereby commit to the following goal:

**Goal:** ${goal}

I will achieve this goal by the following date:

**Deadline:** ${deadline}

**THE WAGER (Loss Aversion Frame):**
If I fail to complete this goal by the deadline, I agree to sacrifice the following symbolic reward from my Trophy Shelf:
**Symbolic Stake:** ${symbolicWager}

I will also honor the following consequence:
**Consequence Stake:** ${stake}

My chosen accountability partner and referee for this contract is:

**Referee:** ${referee}

I will provide my referee with proof of completion by the deadline. The referee's judgment is final.

Signed,

The Captain`;

    setContractText(text);
  };

  return (
    <div className="p-4 sm:p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg w-full max-w-2xl animate-fade-in-up border border-white/30 font-sans">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl" aria-hidden="true">📜</span>
        <h2 className="text-2xl font-bold text-slate-700 font-serif">Commitment Contract</h2>
      </div>
      <p className="text-slate-600 mb-6 text-sm">Formalize your intentions. A commitment made public is harder to break. Define your goal and the symbolic stake for the Loss Aversion Wager.</p>

      <div className="space-y-4">
        <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="What is your ambitious goal?" className="w-full p-2 bg-white/60 border-2 border-slate-300/40 rounded-md shadow-inner" />
        <input type="text" value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="What is the deadline? (e.g., End of quarter)" className="w-full p-2 bg-white/60 border-2 border-slate-300/40 rounded-md shadow-inner" />
        
        {/* NEW INPUT: Symbolic Wager */}
        <input type="text" value={symbolicWager} onChange={(e) => setSymbolicWager(e.target.value)} placeholder="Symbolic stake (e.g., The 'Initiator of the Mundane' badge)" className="w-full p-2 bg-white/60 border-2 border-slate-300/40 rounded-md shadow-inner" />
        
        {/* Existing Stake */}
        <input type="text" value={stake} onChange={(e) => setStake(e.target.value)} placeholder="Consequence stake (e.g., Donate $50, Buy Pep a sad sandwich)" className="w-full p-2 bg-white/60 border-2 border-slate-300/40 rounded-md shadow-inner" />
        
        <input type="text" value={referee} onChange={(e) => setReferee(e.target.value)} placeholder="Who is your accountability partner (referee)?" className="w-full p-2 bg-white/60 border-2 border-slate-300/40 rounded-md shadow-inner" />
        
        <button onClick={generateContract} className="w-full px-6 py-3 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 transition-colors">
          Generate Contract
        </button>
      </div>

      {contractText && (
        <div className="mt-6 pt-4 border-t border-slate-300">
          <h3 className="text-xl font-bold text-slate-700 font-serif mb-2">The Wager</h3>
          <textarea 
            readOnly
            value={contractText}
            rows={15}
            className="w-full p-4 bg-white/80 border border-slate-300/40 rounded-md text-sm font-mono whitespace-pre-wrap shadow-inner"
          />
        </div>
      )}
    </div>
  );
};