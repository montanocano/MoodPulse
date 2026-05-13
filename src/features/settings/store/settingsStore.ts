import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SettingsState {
  theme: "light" | "dark";
  reminderEnabled: boolean;
  reminderTime: string; // "HH:MM"
}

interface SettingsActions {
  setTheme: (theme: "light" | "dark") => void;
  setReminderEnabled: (enabled: boolean) => void;
  setReminderTime: (time: string) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    immer((set) => ({
      theme: "light",
      reminderEnabled: false,
      reminderTime: "20:00",

      setTheme: (theme) => {
        set((state) => {
          state.theme = theme;
        });
      },

      setReminderEnabled: (enabled) => {
        set((state) => {
          state.reminderEnabled = enabled;
        });
      },

      setReminderTime: (time) => {
        set((state) => {
          state.reminderTime = time;
        });
      },
    })),
    {
      name: "settings-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
