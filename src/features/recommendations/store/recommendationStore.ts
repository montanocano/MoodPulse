import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import type { Recommendation } from "../../../types/recommendation";
import type { EmotionRecord } from "../../../types/emotion";
import * as repo from "../repositories/DefaultRecommendationRepository";
import { generateRecommendations } from "../../../shared/api/geminiService";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface RecommendationState {
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
  lastGeneratedAt: string | null;
}

interface RecommendationActions {
  loadRecommendations: (uid: string) => Promise<void>;
  generateAndSave: (uid: string, records: EmotionRecord[], force?: boolean) => Promise<void>;
  toggleCompleted: (uid: string, recId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const INITIAL_STATE: RecommendationState = {
  recommendations: [],
  loading: false,
  error: null,
  lastGeneratedAt: null,
};

export const useRecommendationStore = create<
  RecommendationState & RecommendationActions
>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // ── Load from Firestore ─────────────────────────────────────────
      loadRecommendations: async (uid: string) => {
        set((s) => ({ ...s, loading: true }));
        try {
          const recs = await repo.loadRecommendations(uid);
          const lastGeneratedAt =
            recs.length > 0 ? recs[0].fechaGenerada : null;
          set((s) => ({
            ...s,
            recommendations: recs,
            lastGeneratedAt,
            loading: false,
          }));
        } catch (err) {
          console.error("loadRecommendations error:", err);
          set((s) => ({ ...s, loading: false }));
        }
      },

      // ── Generate via Gemini and persist ────────────────────────────
      generateAndSave: async (uid, records, force = false) => {
        const { lastGeneratedAt } = get();

        // Skip if cache is fresh and not a forced refresh
        if (!force && lastGeneratedAt) {
          const age = Date.now() - new Date(lastGeneratedAt).getTime();
          if (age < CACHE_TTL_MS) return;
        }

        set((s) => ({ ...s, loading: true, error: null }));
        try {
          const recs = await generateRecommendations(records, uid);
          const isStatic = recs.some((r) => r.isStatic);

          // Only persist Gemini-generated recommendations
          if (!isStatic) {
            await repo.saveRecommendations(uid, recs);
          }

          set((s) => ({
            ...s,
            recommendations: recs,
            lastGeneratedAt: recs[0]?.fechaGenerada ?? new Date().toISOString(),
            loading: false,
          }));
        } catch (err) {
          console.error("generateAndSave error:", err);
          set((s) => ({
            ...s,
            loading: false,
            error: "No se pudieron obtener recomendaciones. Inténtalo de nuevo.",
          }));
        }
      },

      // ── Toggle completion with optimistic update ───────────────────
      toggleCompleted: async (uid: string, recId: string) => {
        const prev = get().recommendations;
        const target = prev.find((r) => r.id === recId);
        if (!target) return;

        const newValue = !target.completada;

        // Optimistic update
        set((s) => ({
          ...s,
          recommendations: s.recommendations.map((r) =>
            r.id === recId ? { ...r, completada: newValue } : r,
          ),
        }));

        // Static recommendations have no Firestore doc — skip write
        if (target.isStatic) return;

        try {
          await repo.toggleCompleted(uid, recId, newValue);
        } catch (err) {
          console.error("toggleCompleted error:", err);
          // Revert optimistic update
          set((s) => ({ ...s, recommendations: prev }));
          Alert.alert("Error", "No se pudo actualizar la recomendación.");
        }
      },

      clearError: () => set((s) => ({ ...s, error: null })),

      reset: () => set(() => ({ ...INITIAL_STATE })),
    }),
    {
      name: "recommendation-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        recommendations: state.recommendations,
        lastGeneratedAt: state.lastGeneratedAt,
      }),
    },
  ),
);
