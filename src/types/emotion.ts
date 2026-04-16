export type EmotionType =
  | "feliz"
  | "triste"
  | "ansioso"
  | "enfadado"
  | "neutral"
  | "agradecido"
  | "cansado"
  | "motivado";

export interface EmotionRecord {
  date: string; // YYYY-MM-DD — also used as Firestore document ID
  emotion: EmotionType;
  intensity: number; // 1–10
  reflection: string;
  createdAt: unknown | null; // Firestore Timestamp — typed as unknown to avoid Firebase dep here
  updatedAt: unknown | null;
}

export type NewEmotionRecord = Omit<EmotionRecord, "createdAt" | "updatedAt" | "date">;

interface EmotionMeta {
  label: string;
  emoji: string;
  colorToken: string; // Tamagui token name, e.g. "$emotionHappy"
  colorValue: string; // raw hex for non-Tamagui usage
  placeholder: string;
}

export const EMOTION_CONFIG: Record<EmotionType, EmotionMeta> = {
  feliz: {
    label: "Feliz",
    emoji: "😊",
    colorToken: "$emotionHappy",
    colorValue: "#FFD700",
    placeholder: "¿Qué te ha hecho sentir tan bien hoy? Describe ese momento especial...",
  },
  triste: {
    label: "Triste",
    emoji: "😢",
    colorToken: "$emotionSad",
    colorValue: "#4A90D9",
    placeholder: "¿Qué ha pasado hoy? Exprésate con total libertad, aquí estás seguro...",
  },
  ansioso: {
    label: "Ansioso",
    emoji: "😰",
    colorToken: "$emotionAnxious",
    colorValue: "#FF6B6B",
    placeholder: "¿Qué pensamientos o situaciones te generan inquietud ahora mismo?...",
  },
  enfadado: {
    label: "Enfadado",
    emoji: "😠",
    colorToken: "$emotionAngry",
    colorValue: "#E74C3C",
    placeholder: "¿Qué ha desencadenado este enfado? Describe la situación con detalle...",
  },
  neutral: {
    label: "Neutral",
    emoji: "😐",
    colorToken: "$emotionNeutral",
    colorValue: "#95A5A6",
    placeholder: "¿Cómo ha sido tu día? Cuéntanos sin filtros lo que ha ocurrido...",
  },
  agradecido: {
    label: "Agradecido",
    emoji: "🙏",
    colorToken: "$emotionGrateful",
    colorValue: "#2ECC71",
    placeholder: "¿Por qué cosas o personas te sientes agradecido/a hoy?...",
  },
  cansado: {
    label: "Cansado",
    emoji: "😴",
    colorToken: "$emotionTired",
    colorValue: "#8E44AD",
    placeholder: "¿Qué te ha agotado más hoy? Descríbelo para entender mejor tus límites...",
  },
  motivado: {
    label: "Motivado",
    emoji: "🚀",
    colorToken: "$emotionMotivated",
    colorValue: "#F39C12",
    placeholder: "¿Qué te tiene tan motivado/a? ¿Qué quieres conseguir?...",
  },
};
