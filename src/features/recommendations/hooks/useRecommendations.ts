import { useEffect, useCallback } from "react";
import { useAuthStore } from "../../auth/store/authStore";
import { useEmotionStore } from "../../emotion/store/emotionStore";
import { useRecommendationStore } from "../store/recommendationStore";
import type { Recommendation } from "../../../types/recommendation";

export interface UseRecommendationsReturn {
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
  hasStaticOnly: boolean;
  hasEnoughRecords: boolean;
  refresh: () => Promise<void>;
  toggle: (recId: string) => Promise<void>;
}

export function useRecommendations(): UseRecommendationsReturn {
  const user = useAuthStore((s) => s.user);
  const records = useEmotionStore((s) => s.records);

  const recommendations = useRecommendationStore((s) => s.recommendations);
  const loading = useRecommendationStore((s) => s.loading);
  const error = useRecommendationStore((s) => s.error);
  const generateAndSave = useRecommendationStore((s) => s.generateAndSave);
  const toggleCompleted = useRecommendationStore((s) => s.toggleCompleted);

  const hasEnoughRecords = records.length >= 7;
  const hasStaticOnly = recommendations.some((r) => r.isStatic);

  // On mount: generate if no recommendations yet (or cache is stale)
  useEffect(() => {
    if (!user?.uid) return;
    if (recommendations.length === 0) {
      generateAndSave(user.uid, records, false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const refresh = useCallback(async () => {
    if (!user?.uid) return;
    await generateAndSave(user.uid, records, true);
  }, [user?.uid, records, generateAndSave]);

  const toggle = useCallback(
    async (recId: string) => {
      if (!user?.uid) return;
      await toggleCompleted(user.uid, recId);
    },
    [user?.uid, toggleCompleted],
  );

  return {
    recommendations,
    loading,
    error,
    hasStaticOnly,
    hasEnoughRecords,
    refresh,
    toggle,
  };
}
