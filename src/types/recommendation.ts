export type RecommendationCategory = "mindfulness" | "actividad" | "lectura";

export interface Recommendation {
  id: string;
  userId: string;
  categoria: RecommendationCategory;
  titulo: string;
  descripcion: string;
  completada: boolean;
  fechaGenerada: string; // ISO date string
  isStatic?: boolean; // true when using fallback — not persisted to Firestore
}
