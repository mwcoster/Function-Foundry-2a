import React, { useState, useRef, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { IdeaNode } from '../hooks/types';

interface IdeaGreenhouseProps {
  nodes: IdeaNode[];
  setNodes: React.Dispatch<React.SetStateAction<IdeaNode[]>>;
  onBack: () => void;
}

export const IdeaGreenhouse: React.FC<IdeaGreenhouseProps> = ({ nodes, setNodes, onBack }) => {
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<{ id: string; offsetX: number; offsetY: number; } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (editingNode) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const newNode: IdeaNode = {
      id: uuidv4(),
      text: 'New Idea',
      x: e.clientX - rect.left - 50, // Center roughly
      y: e.clientY - rect.top - 20,
    };
    setNodes(prev => [...prev, newNode]);
    setEditingNode(newNode.id);
  };

  const handleMouseDown = (e: React.MouseEvent, node: IdeaNode) => {
    e.stopPropagation();
    setEditingNode(null);
    setDraggingNode({
      id: node.id,
      offsetX: e.clientX - node.x,
      offsetY: e.clientY - node.y,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingNode) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    
    setNodes(prev => prev.map(node => {
      if (node.id === draggingNode.id) {
        let newX = e.clientX - draggingNode.offsetX;
        let newY = e.clientY - draggingNode.offsetY;
        
        // Keep node within canvas boundaries
        newX = Math.max(0, Math.min(newX, rect.width - 150));
        newY = Math.max(0, Math.min(newY, rect.height - 80));

        return { ...node, x: newX, y: newY };
      }
      return node;
    }));
  }, [draggingNode, setNodes]);

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
  }, []);

  useEffect(() => {
    if (draggingNode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingNode, handleMouseMove, handleMouseUp]);

  return (
    <div className="w-full max-w-4xl h-[70vh] bg-stone-100/70 backdrop-blur-sm rounded-2xl shadow-lg border border-stone-200/50 font-sans flex flex-col animate-fade-in-up">
      <div className="flex items-center justify-between p-4 border-b border-stone-200/50">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">🌱</span>
          <h2 className="text-2xl font-bold text-slate-700 font-serif">Idea Greenhouse</h2>
        </div>
        <button onClick={onBack} className="px-4 py-2 bg-slate-200/70 text-slate-800 font-semibold rounded-lg hover:bg-slate-300/80 transition-colors shadow-sm text-sm">Back to Hub</button>
      </div>
      <p className="text-slate-600 text-sm px-4 pt-2">A place for unstructured, visual brainstorming. Double-click to plant a new idea.</p>
      <div 
        ref={canvasRef}
        onDoubleClick={handleDoubleClick}
        className="flex-grow relative overflow-auto custom-scrollbar m-4 border-2 border-dashed border-stone-300/50 rounded-lg bg-stone-50/50"
      >
        {nodes.map(node => (
          <div 
            key={node.id}
            className={`absolute p-2 bg-white/90 rounded-xl shadow-md cursor-grab transition-shadow duration-100 ${draggingNode?.id === node.id ? 'shadow-xl ring-2 ring-purple-400' : 'hover:shadow-lg'}`}
            style={{ left: `${node.x}px`, top: `${node.y}px` }}
            onMouseDown={(e) => handleMouseDown(e, node)}
            onDoubleClick={(e) => { e.stopPropagation(); setEditingNode(node.id); }}
          >
            {editingNode === node.id ? (
              <textarea
                value={node.text}
                onChange={(e) => setNodes(prev => prev.map(n => n.id === node.id ? {...n, text: e.target.value} : n))}
                onBlur={() => setEditingNode(null)}
                autoFocus
                rows={Math.max(1, Math.ceil(node.text.length / 20))}
                style={{ width: '140px', minHeight: '40px' }}
                className="resize-none bg-transparent outline-none border-b border-purple-400 text-slate-800 font-serif"
              />
            ) : (
              <p className="w-full h-full font-serif whitespace-pre-wrap max-w-[140px] text-sm text-slate-800">
                {node.text}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};