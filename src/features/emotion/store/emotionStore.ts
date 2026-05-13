import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../../shared/api/firebase";
import { emotionRepository } from "../repositories/DefaultEmotionRepository";
import { EmotionRecord, NewEmotionRecord } from "../../../types/emotion";
import {
  checkAchievements,
  type AchievementType,
  ACHIEVEMENT_CONFIG,
} from "../../../shared/utils/checkAchievements";
import { grantAchievements } from "../../achievements/repositories/DefaultAchievementRepository";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function ninetyDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d.toISOString().slice(0, 10);
}

interface EmotionState {
  todayRecord: EmotionRecord | null;
  records: EmotionRecord[];
  loading: boolean;
  error: string | null;
}

interface EmotionActions {
  loadRecords: (uid: string) => Promise<void>;
  saveRecord: (uid: string, data: NewEmotionRecord) => Promise<void>;
  updateRecord: (
    uid: string,
    date: string,
    data: Partial<NewEmotionRecord>,
  ) => Promise<void>;
  clearError: () => void;
}

export const useEmotionStore = create<EmotionState & EmotionActions>()(
  persist(
    (set) => ({
      todayRecord: null,
      records: [],
      loading: false,
      error: null,

      // ── Load records (last 90 days) ─────────────────────────────────
      loadRecords: async (uid: string) => {
        set((s) => ({ ...s, loading: true }));
        try {
          const records = await emotionRepository.loadRecords(
            uid,
            ninetyDaysAgo(),
          );
          const today = todayISO();
          set((s) => ({
            ...s,
            records,
            todayRecord: records.find((r) => r.date === today) ?? null,
            loading: false,
          }));
        } catch (err: unknown) {
          set((s) => ({
            ...s,
            loading: false,
            error: "No se pudieron cargar los registros. Inténtalo de nuevo.",
          }));
          console.error("loadRecords error:", err);
        }
      },

      // ── Save a new record ───────────────────────────────────────────
      saveRecord: async (uid: string, data: NewEmotionRecord) => {
        set((s) => ({ ...s, loading: true }));
        const date = todayISO();
        const optimistic: EmotionRecord = {
          ...data,
          date,
          createdAt: null,
          updatedAt: null,
        };
        set((s) => ({
          ...s,
          todayRecord: optimistic,
          records: [
            optimistic,
            ...s.records.filter((r) => r.date !== date),
          ].slice(0, 90),
        }));
        try {
          await emotionRepository.saveRecord(uid, date, data);
          set((s) => ({ ...s, loading: false }));

          // Check and grant achievements after save
          try {
            const allRecords = useEmotionStore.getState().records;
            const existingSnap = await getDocs(
              collection(db, "users", uid, "achievements"),
            );
            const existingTypes = existingSnap.docs.map(
              (d) => d.id as AchievementType,
            );
            const newTypes = checkAchievements({
              records: allRecords,
              completedRecommendations: 0,
              existingTypes,
            });
            if (newTypes.length > 0) {
              await grantAchievements(uid, newTypes);
              for (const t of newTypes) {
                const meta = ACHIEVEMENT_CONFIG[t];
                Alert.alert("🏆 Nuevo logro", meta.titulo);
              }
            }
          } catch {
            // Achievement errors should not fail the main save
          }
        } catch (err: unknown) {
          set((s) => ({
            ...s,
            loading: false,
            error: "No se pudo guardar el registro. Inténtalo de nuevo.",
          }));
          console.error("saveRecord error:", err);
        }
      },

      // ── Update an existing record ───────────────────────────────────
      updateRecord: async (
        uid: string,
        date: string,
        data: Partial<NewEmotionRecord>,
      ) => {
        set((s) => ({ ...s, loading: true }));
        set((s) => ({
          ...s,
          records: s.records.map((r) =>
            r.date === date ? { ...r, ...data } : r,
          ),
          todayRecord:
            s.todayRecord?.date === date
              ? { ...s.todayRecord, ...data }
              : s.todayRecord,
        }));
        try {
          await emotionRepository.updateRecord(uid, date, data);
          set((s) => ({ ...s, loading: false }));
        } catch (err: unknown) {
          set((s) => ({
            ...s,
            loading: false,
            error: "No se pudo actualizar el registro. Inténtalo de nuevo.",
          }));
          console.error("updateRecord error:", err);
        }
      },

      clearError: () => set((s) => ({ ...s, error: null })),
    }),
    {
      name: "emotion-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        records: (state.records ?? []).slice(0, 90),
        todayRecord: state.todayRecord,
      }),
    },
  ),
);
