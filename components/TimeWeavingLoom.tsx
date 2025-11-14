import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TimeBlock, Recurrence, CapturedItem } from '../hooks/types';
import { TIME_BLOCK_COLORS } from '../constants';

interface TimeWeavingLoomProps {
  blocks: TimeBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<TimeBlock[]>>;
  questItems: CapturedItem[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 50; // pixels
const SNAP_INCREMENT = 0.5; // Snap to half-hour

export const TimeWeavingLoom: React.FC<TimeWeavingLoomProps> = ({ blocks, setBlocks, questItems }) => {
  const [now, setNow] = useState(new Date());
  const [editingBlock, setEditingBlock] = useState<Partial<TimeBlock> | null>(null);
  const [interaction, setInteraction] = useState<{ type: 'move' | 'resize'; blockId: string; initialY: number; initialStart: number; initialDuration: number; } | null>(null);
  const loomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timerId = setInterval(() => setNow(new Date()), 60000); // Update every minute
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (editingBlock) {
      inputRef.current?.focus();
    }
  }, [editingBlock]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!interaction || !loomRef.current) return;

    const loomRect = loomRef.current.getBoundingClientRect();
    const deltaY = e.clientY - interaction.initialY;
    const deltaHours = deltaY / HOUR_HEIGHT;

    setBlocks(prevBlocks => prevBlocks.map(block => {
      if (block.id !== interaction.blockId) return block;

      let newStart = block.startHour;
      let newDuration = block.duration;

      if (interaction.type === 'move') {
        newStart = interaction.initialStart + deltaHours;
      } else { // resize
        newDuration = interaction.initialDuration + deltaHours;
      }

      // Snap to grid and apply constraints
      newStart = Math.max(0, Math.round(newStart / SNAP_INCREMENT) * SNAP_INCREMENT);
      newDuration = Math.max(SNAP_INCREMENT, Math.round(newDuration / SNAP_INCREMENT) * SNAP_INCREMENT);
      if (newStart + newDuration > 24) {
        if (interaction.type === 'move') {
          newStart = 24 - newDuration;
        } else {
          newDuration = 24 - newStart;
        }
      }

      return { ...block, startHour: newStart, duration: newDuration };
    }));

  }, [interaction, setBlocks]);

  const handleMouseUp = useCallback(() => {
    if (!interaction) return;
    setInteraction(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [interaction, handleMouseMove]);

  const handleBlockMouseDown = (e: React.MouseEvent, block: TimeBlock, type: 'move' | 'resize') => {
    e.stopPropagation();
    setInteraction({
      type,
      blockId: block.id,
      initialY: e.clientY,
      initialStart: block.startHour,
      initialDuration: block.duration,
    });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleLoomClick = (e: React.MouseEvent) => {
    if (!loomRef.current || editingBlock) return;
    const rect = loomRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hour = Math.floor(y / HOUR_HEIGHT / SNAP_INCREMENT) * SNAP_INCREMENT;
    setEditingBlock({ startHour: hour, duration: 1, title: '', color: 'Default', recurring: 'none' });
  };

  const handleSaveBlock = () => {
    if (!editingBlock || !editingBlock.title) {
      setEditingBlock(null);
      return;
    }

    const newBlock: TimeBlock = {
      id: editingBlock.id || uuidv4(),
      title: editingBlock.title,
      startHour: editingBlock.startHour!,
      duration: editingBlock.duration!,
      color: editingBlock.color || 'Default',
      recurring: editingBlock.recurring || 'none',
      questId: editingBlock.questId,
    };

    if (editingBlock.id) {
      setBlocks(blocks.map(b => b.id === newBlock.id ? newBlock : b));
    } else {
      setBlocks([...blocks, newBlock]);
    }
    setEditingBlock(null);
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    setEditingBlock(null);
  };

  const currentTimePosition = (now.getHours() + now.getMinutes() / 60) * HOUR_HEIGHT;

const getBlockColorClasses = (colorName: string) => {
  const color = TIME_BLOCK_COLORS.find(c => c.name === colorName) || TIME_BLOCK_COLORS[0];
  return { bg: color.bg, border: color.border };
};

  const scheduledQuestIds = new Set(blocks.map(b => b.questId).filter(Boolean));
  const availableQuests = questItems.filter(q => !scheduledQuestIds.has(q.id) || q.id === editingBlock?.questId);

  return (
    <div className="w-full h-full bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-2xl p-4 flex flex-col font-sans overflow-hidden">
      <h2 className="text-2xl font-bold text-white font-serif text-center mb-2">Time-Weaving Loom</h2>
      
      {/* ✅ Action 1: Restored Master Scroll */}
      <div className="flex-grow w-full flex gap-4 overflow-y-auto custom-scrollbar">

        {/* ✅ Action 3: Integrated Hour Labels into Loom Timeline */}
        <div 
          ref={loomRef} 
          className="relative flex-grow h-full bg-slate-900/50 rounded-lg"
          onClick={handleLoomClick}
        >

          {/* Integrated Fixed Hour Labels */}
          <div className="absolute top-0 left-0 w-16 h-full z-10">
            {HOURS.map(hour => (
              <div key={`label-${hour}`} className="text-right h-[50px] text-xs text-slate-400 pr-2 pt-1">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
            ))}
          </div>

          {HOURS.map(hour => (
            <div key={hour} className="h-[50px] border-b border-slate-700/50"></div>
          ))}

          {/* Current Time Indicator */}
          <div 
            className="absolute top-0 left-0 w-full h-px bg-yellow-300 shadow-[0_0_10px_theme(colors.yellow.300)]"
            style={{ transform: `translateY(${currentTimePosition}px)`}}
          >
            <div className="absolute -left-2 -top-1.5 w-2 h-2 rounded-full bg-yellow-300"></div>
          </div>

          {/* Render Time Blocks */}
          {blocks.map(block => {
            const { bg, border } = getBlockColorClasses(block.color);
            return (
              <div 
                key={block.id}
                title={block.title}
                className={`absolute w-[calc(100%-8px)] left-1 p-2 ${bg} ${border} rounded-md cursor-grab text-white flex flex-col justify-between`}
                style={{
                  top: `${block.startHour * HOUR_HEIGHT}px`,
                  height: `${block.duration * HOUR_HEIGHT}px`,
                  minHeight: `${SNAP_INCREMENT * HOUR_HEIGHT}px`,
                }}
                onMouseDown={(e) => handleBlockMouseDown(e, block, 'move')}
                onClick={(e) => { e.stopPropagation(); setEditingBlock(block); }}
              >
                <div className="flex justify-between items-start">
                  <p className="text-sm font-semibold truncate pr-2">{block.title}</p>
                  <div className="flex-shrink-0 flex items-center gap-1">
                    {block.questId && <span className="text-base" title="This is a scheduled Quest">🗺️</span>}
                    {block.recurring !== 'none' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/70 animate-[spin-slow_5s_linear_infinite]" viewBox="0 0 20 20" fill="currentColor">
                        <title>{`Repeats ${block.recurring}`}</title>
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <div 
                  className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize"
                  onMouseDown={(e) => handleBlockMouseDown(e, block, 'resize')}
                />
              </div>
            );
          })}

          {/* Block Editing Form */}
          {editingBlock && (
            <div 
              className="absolute w-[calc(100%-8px)] left-1 p-3 bg-white/95 rounded-lg shadow-2xl animate-fade-in"
              style={{
                top: `${editingBlock.startHour! * HOUR_HEIGHT}px`,
                zIndex: 10,
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="mb-3">
                <label className="text-sm font-medium text-slate-600">Link to Quest</label>
                <select
                  value={editingBlock.questId || ''}
                  onChange={(e) => {
                    const selectedQuestId = e.target.value;
                    const selectedQuest = questItems.find(q => q.id === selectedQuestId);
                    setEditingBlock(b => ({
                      ...b!,
                      questId: selectedQuest ? selectedQuest.id : undefined,
                      title: selectedQuest ? selectedQuest.text : '',
                    }));
                  }}
                  className="w-full p-2 mt-1 border rounded text-slate-800 bg-white"
                >
                  <option value="">-- No linked quest --</option>
                  {availableQuests.map(q => (
                    <option key={q.id} value={q.id}>{q.text}</option>
                  ))}
                </select>
              </div>

              <input 
                ref={inputRef}
                type="text" 
                value={editingBlock.title}
                onChange={e => setEditingBlock(b => ({...b!, title: e.target.value}))}
                placeholder="Or enter a custom title"
                className="w-full p-2 mb-3 border rounded text-slate-800 disabled:bg-slate-200/50"
                disabled={!!editingBlock.questId}
              />

              <div className="mb-3">
                <label className="text-sm font-medium text-slate-600">Color</label>
                <div className="flex gap-2 mt-1">
                  {TIME_BLOCK_COLORS.map(color => (
                    <button 
                      key={color.name} 
                      title={color.name}
                      onClick={() => setEditingBlock(b => ({...b!, color: color.name}))}
                      className={`w-6 h-6 rounded-full ${color.bg.replace('/80', '')} ${editingBlock.color === color.name ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}`}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="text-sm font-medium text-slate-600">Repeats</label>
                <div className="flex gap-4 mt-1 text-sm text-slate-700">
                  {(['none', 'daily', 'weekly'] as Recurrence[]).map(r => (
                    <label key={r} className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="recurrence" value={r} checked={editingBlock.recurring === r} onChange={() => setEditingBlock(b => ({...b!, recurring: r}))} className="text-indigo-500 focus:ring-indigo-400"/>
                      <span className="capitalize">{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center mb-2">
                <label className="text-sm mr-2 text-slate-600">Duration (hrs):</label>
                <input 
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={editingBlock.duration}
                  onChange={e => setEditingBlock(b => ({...b!, duration: parseFloat(e.target.value)}))}
                  className="w-20 p-1 border rounded text-slate-800"
                />
              </div>
              <div className="flex justify-between mt-4 border-t pt-3">
                <button onClick={() => handleDeleteBlock(editingBlock.id!)} className="text-sm text-red-600 hover:text-red-800 disabled:text-slate-400" disabled={!editingBlock.id} title="Delete this block">
                  Delete
                </button>
                <div>
                  <button onClick={() => setEditingBlock(null)} className="text-sm px-3 py-1 mr-2 bg-slate-200 rounded">Cancel</button>
                  <button onClick={handleSaveBlock} className="text-sm px-3 py-1 bg-indigo-500 text-white rounded">Save</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
