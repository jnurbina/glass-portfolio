"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface Achievement {
  id: string;
  title: string;
  description: string;
}

interface AchievementContextState {
  unlockedAchievements: string[];
  unlockAchievement: (achievementId: string) => void;
  achievementCount: number;
  totalAchievements: number;
}

export const achievements: Achievement[] = [
  {
    id: 'intrigued-adventurist',
    title: 'Intrigued Adventurist',
    description: 'Navigated past the first screen',
  },
  {
    id: 'stalker',
    title: 'Stalker',
    description: 'Read the bio.',
  },
  {
    id: 'resume-reader',
    title: 'Resume Reader',
    description: 'Checked out the For You section.',
  },
  {
    id: 'dj',
    title: 'The DJ',
    description: 'Explored the audio section.',
  },
  {
    id: 'mad-scientist',
    title: 'Mad Scientist',
    description: 'Ran a simulation experiment.',
  },
  {
    id: 'noisy-neighbor',
    title: 'Noisy Neighbor',
    description: 'You are hitting the glass walls too hard!',
  },
  {
    id: 'afk',
    title: 'AFK',
    description: 'Are you still there?',
  },
  {
    id: 'konami-code',
    title: 'Konami Code',
    description: 'You know the code!',
  },
  {
    id: 'hacker',
    title: 'Hacker',
    description: 'Discovered the hidden system configuration menu.',
  },
  {
    id: 'audiophile',
    title: 'Audiophile',
    description: 'Fine-tuned the audio settings.',
  },
  {
    id: 'power-user',
    title: 'Power User',
    description: 'Customized the graphics settings.',
  },
];

const AchievementContext = createContext<AchievementContextState | undefined>(undefined);

export const AchievementProvider = ({ children }: { children: React.ReactNode }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('unlockedAchievements');
    if (saved) {
      setUnlockedAchievements(JSON.parse(saved));
    }
  }, []);

  const unlockAchievement = useCallback((achievementId: string) => {
    setUnlockedAchievements((prev) => {
      if (!prev.includes(achievementId)) {
        const achievement = achievements.find((a) => a.id === achievementId);
        if (achievement) {
          toast.success(`Achievement Unlocked: ${achievement.title}`);
          const newValue = [...prev, achievementId];
          localStorage.setItem('unlockedAchievements', JSON.stringify(newValue));
          return newValue;
        }
      }
      return prev;
    });
  }, []);

  const value = {
    unlockedAchievements,
    unlockAchievement,
    achievementCount: unlockedAchievements.length,
    totalAchievements: achievements.length,
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievementState = () => {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievementState must be used within an AchievementProvider');
  }
  return context;
};
