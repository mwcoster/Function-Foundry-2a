import React from 'react';

export type TimeOfDay = 'day' | 'dusk' | 'night';

export enum HubId {
  Sonia = 'sonia',
  Pep = 'pep',
  SisterMary = 'sister-mary',
  FiNancy = 'fi-nancy',
  Jake = 'jake',
  Bea = 'bea', // CRITICAL: The Sixth immutable hub
}

export interface CharacterData {
  id: HubId;
  name: string;
  title: string;
  avatar: React.FC<{className?: string}> | string;
  color: string;
  basePrompt: string;
  introDialogue: string;
}

export interface CapturedItem {
  id: string;
  text: string;
  postponedCount?: number;
}

export interface OnboardingStep {
  dialogue: string;
  action?: 'capture' | 'sanctuary' | 'finish';
  actionText?: string;
}

export type Recurrence = 'none' | 'daily' | 'weekly';

export interface TimeBlock {
  id: string;
  title: string;
  startHour: number; // 0-23.5 in 0.5 increments
  duration: number; // in hours, 0.5 increments
  color: string; // The name of the color, e.g., 'Default', 'Work'
  recurring: Recurrence;
  questId?: string;
}

export interface IdeaNode {
  id: string;
  text: string;
  x: number;
  y: number;
}

export interface ExtractedItem {
  text: string;
  type: 'inbox' | 'quest';
}