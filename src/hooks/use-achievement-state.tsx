"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  title: string;
  description: string;
}

interface AchievementContextState {
  unlockedAchievements: string[];
  unlockAchievement: (achievementId: string) => void;
}

const achievements: Achievement[] = [
  {
    id: 'intrigued-adventurist',
    title: 'Intrigued Adventurist',
    description: 'Navigated past the first screen',
  },
  {
    id: 'drawer-puller',
    title: 'Drawer Puller',
    description: 'Found the back button',
  },
];

const AchievementContext = createContext<AchievementContextState | undefined>(undefined);

export const AchievementProvider = ({ children }: { children: React.ReactNode }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

  const unlockAchievement = useCallback((achievementId: string) => {
    if (!unlockedAchievements.includes(achievementId)) {
      const achievement = achievements.find((a) => a.id === achievementId);
      if (achievement) {
        setUnlockedAchievements((prev) => [...prev, achievementId]);
        toast.success(`Achievement Unlocked: ${achievement.title}`);
      }
    }
  }, [unlockedAchievements]);

  const value = {
    unlockedAchievements,
    unlockAchievement,
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
