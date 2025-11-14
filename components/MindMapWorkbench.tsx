import React, { useState, useEffect } from 'react';

// Define the structure for a visual node
interface IdeaNode {
  id: string;
  text: string;
}

// Define the expected data input: the raw text dump.
interface MindMapWorkbenchProps {
  brainDumpText: string;
}

// This component performs real-time parsing and will eventually render the visual map.
// This implements the mandated logic to externalize working memory by parsing text into nodes. [3, 5, 6]
export const MindMapWorkbench: React.FC<MindMapWorkbenchProps> = ({ brainDumpText }) => {
  const [ideaNodes, setIdeaNodes] = useState<IdeaNode[]>([]);

  // This hook executes the parsing logic whenever the text input changes.
  useEffect(() => {
    // Break the text dump by line breaks to get distinct ideas
    // We filter out empty lines caused by extra spaces.
    const lines = brainDumpText.split('\n').filter(line => line.trim().length > 0);
    
    // Convert lines into IdeaNode objects
    const newNodes = lines.map((text, index) => ({
      id: `node-${index}`, 
      text: text.trim(),
      // In a later phase, x and y coordinates would be calculated for visualization
    }));
    
    setIdeaNodes(newNodes);
  }, [brainDumpText]);


  // Current view: displays the parsed nodes as separate visual blocks (the first stage of mapping)
  return (
    <div className="p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-inner flex-grow overflow-auto">
      <h4 className="font-semibold text-slate-700 mb-2">Parsed Idea Nodes (Pre-Visualization)</h4>
      
      {ideaNodes.length > 0 ? (
        <div className="space-y-3">
          {ideaNodes.map(node => (
            <p key={node.id} className="text-sm text-slate-800 p-2 bg-slate-100 rounded-md shadow-sm border border-slate-200">
              {node.text}
            </p>
          ))}
        </div>
      ) : (
        <pre className="text-sm text-slate-600 whitespace-pre-wrap p-2 bg-slate-50 rounded-md overflow-x-auto">
          {"Start typing or speaking your thoughts to see them map out here!"}
        </pre>
      )}
    </div>
  );
};