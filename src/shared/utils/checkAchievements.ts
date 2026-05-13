import type { EmotionRecord } from "../../types/emotion";

export type AchievementType =
  | "racha_7"
  | "racha_30"
  | "registros_30"
  | "recomendaciones_5";

export interface AchievementMeta {
  type: AchievementType;
  titulo: string;
  descripcion: string;
  emoji: string;
}

export const ACHIEVEMENT_CONFIG: Record<AchievementType, AchievementMeta> = {
  racha_7: {
    type: "racha_7",
    titulo: "7 días seguidos 🔥",
    descripcion: "Has registrado tus emociones 7 días consecutivos",
    emoji: "🔥",
  },
  racha_30: {
    type: "racha_30",
    titulo: "Un mes de constancia 🌟",
    descripcion: "Has registrado tus emociones 30 días consecutivos",
    emoji: "🌟",
  },
  registros_30: {
    type: "registros_30",
    titulo: "30 registros 📝",
    descripcion: "Has completado 30 registros emocionales",
    emoji: "📝",
  },
  recomendaciones_5: {
    type: "recomendaciones_5",
    titulo: "5 recomendaciones ✅",
    descripcion: "Has completado 5 recomendaciones de bienestar",
    emoji: "✅",
  },
};

function currentStreak(records: EmotionRecord[], today?: string): number {
  const todayStr = today ?? new Date().toISOString().slice(0, 10);
  const sortedDates = [...new Set(records.map((r) => r.date))].sort().reverse();
  if (!sortedDates.includes(todayStr)) return 0;
  let streak = 0;
  let expected = todayStr;
  for (const date of sortedDates) {
    if (date === expected) {
      streak++;
      const d = new Date(expected);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().slice(0, 10);
    } else if (date < expected) {
      break;
    }
  }
  return streak;
}

interface CheckInput {
  records: EmotionRecord[];
  completedRecommendations: number;
  existingTypes: AchievementType[];
}

export function checkAchievements({
  records,
  completedRecommendations,
  existingTypes,
}: CheckInput): AchievementType[] {
  const newAchievements: AchievementType[] = [];
  const streak = currentStreak(records);

  const check = (type: AchievementType, condition: boolean) => {
    if (condition && !existingTypes.includes(type)) {
      newAchievements.push(type);
    }
  };

  check("racha_7", streak >= 7);
  check("racha_30", streak >= 30);
  check("registros_30", records.length >= 30);
  check("recomendaciones_5", completedRecommendations >= 5);

  return newAchievements;
}
