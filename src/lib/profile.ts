// Local progress store — keyed by wallet address (or "guest" before connection).
// Persisted to localStorage so progress survives reload.
// Phase 2B will add Supabase sync + SIWE for cross-device + leaderboard.

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CompletionRecord = {
  slug: string;
  score: number;        // 0-100
  xp: number;           // xp earned (capped at mission.xp)
  passed: boolean;
  badge?: string;       // badge name unlocked
  badgeEmoji?: string;
  completedAt: number;  // unix ms
};

type ProfileState = {
  // Current "scope" — wallet address lowercase, or "guest"
  scope: string;
  setScope: (s: string) => void;

  // Per-scope data
  data: Record<string, ScopeData>;

  // Mutations
  recordCompletion: (rec: Omit<CompletionRecord, "completedAt">) => void;
  resetScope: (scope?: string) => void;
};

export type ScopeData = {
  history: CompletionRecord[];
  totalXp: number;
  badges: { name: string; emoji: string; missionSlug: string; unlockedAt: number }[];
  streak: { current: number; longest: number; lastDay: string | null };
};

const emptyScope = (): ScopeData => ({
  history: [],
  totalXp: 0,
  badges: [],
  streak: { current: 0, longest: 0, lastDay: null },
});

const dayKey = (d = new Date()) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

const daysBetween = (a: string, b: string) => {
  const ad = new Date(a + "T00:00:00Z").getTime();
  const bd = new Date(b + "T00:00:00Z").getTime();
  return Math.round((bd - ad) / 86_400_000);
};

export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      scope: "guest",
      setScope: (s) => set({ scope: s.toLowerCase() }),
      data: { guest: emptyScope() },

      recordCompletion: (rec) => {
        const { scope, data } = get();
        const cur = data[scope] ?? emptyScope();

        // Replace prior record for same slug with the better one
        const prior = cur.history.find((h) => h.slug === rec.slug);
        const isImprovement = !prior || rec.score > prior.score;

        const newHistory = isImprovement
          ? [
              { ...rec, completedAt: Date.now() },
              ...cur.history.filter((h) => h.slug !== rec.slug),
            ]
          : cur.history;

        // XP: only count delta over previous best
        const xpDelta = isImprovement ? rec.xp - (prior?.xp ?? 0) : 0;

        // Badges: append if new pass and not already collected
        const newBadges =
          rec.passed && rec.badge && !cur.badges.find((b) => b.missionSlug === rec.slug)
            ? [
                ...cur.badges,
                {
                  name: rec.badge,
                  emoji: rec.badgeEmoji ?? "🛡️",
                  missionSlug: rec.slug,
                  unlockedAt: Date.now(),
                },
              ]
            : cur.badges;

        // Streak
        const today = dayKey();
        let { current, longest, lastDay } = cur.streak;
        if (lastDay !== today) {
          if (lastDay && daysBetween(lastDay, today) === 1) current += 1;
          else current = 1;
          if (current > longest) longest = current;
          lastDay = today;
        }

        set({
          data: {
            ...data,
            [scope]: {
              history: newHistory,
              totalXp: cur.totalXp + Math.max(0, xpDelta),
              badges: newBadges,
              streak: { current, longest, lastDay },
            },
          },
        });
      },

      resetScope: (scope) => {
        const target = scope ?? get().scope;
        set({ data: { ...get().data, [target]: emptyScope() } });
      },
    }),
    {
      name: "scam-detective.profile.v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Convenience selectors
export function useScopeData(): ScopeData {
  return useProfile((s) => s.data[s.scope] ?? emptyScope());
}

export function useCompletion(slug: string): CompletionRecord | undefined {
  return useProfile((s) => (s.data[s.scope] ?? emptyScope()).history.find((h) => h.slug === slug));
}
