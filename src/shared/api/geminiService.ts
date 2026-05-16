import { EmotionType, EmotionRecord } from "../../types/emotion";
import { Recommendation, RecommendationCategory } from "../../types/recommendation";
import { STATIC_RECOMMENDATIONS } from "../../features/recommendations/staticRecommendations";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const STATIC_FALLBACKS: Record<EmotionType, string> = {
  feliz:
    "Hoy me siento especialmente bien. Ha sido un día en el que las pequeñas cosas han brillado un poco más y me ha dado cuenta de lo importante que es disfrutar los momentos positivos cuando llegan.",
  triste:
    "Hay días en los que la tristeza aparece sin avisar. Estoy aprendiendo a reconocerla sin juzgarme, a darme el espacio que necesito para sentirla y seguir adelante a mi ritmo.",
  ansioso:
    "La ansiedad de hoy me recuerda que hay cosas que escapa de mi control. Quiero trabajar en respirar profundo, identificar qué está en mis manos y soltar el resto.",
  enfadado:
    "El enfado que siento hoy es una señal de que algo importante para mí se ha visto afectado. Quiero entender qué lo provocó y cómo puedo expresarlo de manera constructiva.",
  neutral:
    "Ha sido un día sin grandes altibajos. A veces la calma y la neutralidad son exactamente lo que el cuerpo y la mente necesitan para recuperar fuerzas.",
  agradecido:
    "Hoy me detengo a reconocer las cosas buenas de mi vida. La gratitud no significa ignorar las dificultades, sino elegir también ver lo positivo que me rodea.",
  cansado:
    "El cansancio de hoy me dice que he dado mucho de mí. Quiero descansar sin culpa y recordarme que cuidarme también es una responsabilidad importante.",
  motivado:
    "Me siento lleno/a de energía y con ganas de avanzar. Quiero aprovechar este impulso para dar pasos concretos hacia mis metas y disfrutar del proceso.",
};

export async function generateReflection(
  emotion: EmotionType,
  intensity: number,
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    return STATIC_FALLBACKS[emotion];
  }

  const prompt = `Eres un asistente de bienestar emocional. El usuario se siente "${emotion}" con una intensidad de ${intensity}/10.
Genera una reflexión guiada de 3 a 4 frases completas en primera persona, en español, que ayude al usuario a explorar y articular cómo se siente hoy.
La reflexión debe ser empática, no clínica, y usar un tono cercano y cálido.
Es muy importante que todas las frases estén completas y que el texto no se corte a mitad de una frase.
Devuelve únicamente el texto de la reflexión, sin introducciones ni explicaciones.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (!response.ok) {
      return STATIC_FALLBACKS[emotion];
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    console.log(
      "[Gemini] finishReason:",
      candidate?.finishReason,
      "| chars:",
      candidate?.content?.parts?.[0]?.text?.length,
    );
    const text: string | undefined = candidate?.content?.parts?.[0]?.text;

    return text?.trim() || STATIC_FALLBACKS[emotion];
  } catch {
    return STATIC_FALLBACKS[emotion];
  }
}

// ── Recommendations ──────────────────────────────────────────────────────────

const DAYS_ES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const NEGATIVE_EMOTIONS: EmotionType[] = ["triste", "ansioso", "enfadado", "cansado"];

function buildEmotionalSummary(records: EmotionRecord[]): string {
  if (records.length === 0) return "No hay registros disponibles.";

  // Records arrive sorted newest-first; take up to 30
  const last30 = records.slice(0, 30);

  // ── Overall stats ────────────────────────────────────────────────────────
  const counts: Partial<Record<EmotionType, number>> = {};
  let totalIntensity = 0;
  for (const r of last30) {
    counts[r.emotion] = (counts[r.emotion] ?? 0) + 1;
    totalIntensity += r.intensity;
  }
  const avgIntensity = (totalIntensity / last30.length).toFixed(1);
  const predominant =
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "neutral";
  const distribution = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([emotion, count]) => `${emotion}: ${count} día(s)`)
    .join(", ");

  // ── Day-of-week patterns ─────────────────────────────────────────────────
  const byDow: Record<number, { emotions: EmotionType[]; intensities: number[] }> = {};
  for (const r of last30) {
    // date is YYYY-MM-DD; append T12:00 to avoid timezone shifts
    const dow = new Date(`${r.date}T12:00:00`).getDay();
    if (!byDow[dow]) byDow[dow] = { emotions: [], intensities: [] };
    byDow[dow].emotions.push(r.emotion);
    byDow[dow].intensities.push(r.intensity);
  }

  const dowPatterns: string[] = [];
  for (const [dowStr, data] of Object.entries(byDow)) {
    if (data.emotions.length < 2) continue; // need at least 2 occurrences
    const dow = Number(dowStr);
    const negCount = data.emotions.filter((e) => NEGATIVE_EMOTIONS.includes(e)).length;
    const avgInt = (
      data.intensities.reduce((a, b) => a + b, 0) / data.intensities.length
    ).toFixed(1);
    const dominantEmotion = Object.entries(
      data.emotions.reduce(
        (acc, e) => { acc[e] = (acc[e] ?? 0) + 1; return acc; },
        {} as Record<string, number>,
      ),
    ).sort((a, b) => b[1] - a[1])[0]?.[0];

    const negRatio = negCount / data.emotions.length;
    if (negRatio >= 0.6) {
      dowPatterns.push(
        `Los ${DAYS_ES[dow]} tienden a ser negativos (${dominantEmotion} en ${negCount}/${data.emotions.length} semanas, intensidad media ${avgInt}/10)`,
      );
    } else if (negRatio <= 0.2) {
      dowPatterns.push(
        `Los ${DAYS_ES[dow]} suelen ser positivos (emoción predominante: ${dominantEmotion}, intensidad media ${avgInt}/10)`,
      );
    }
  }

  // ── Recent-week vs previous-week trend ───────────────────────────────────
  const recent7 = last30.slice(0, 7);
  const prev7 = last30.slice(7, 14);
  let trendText = "";
  if (prev7.length >= 3) {
    const recentNeg = recent7.filter((r) => NEGATIVE_EMOTIONS.includes(r.emotion)).length;
    const prevNeg = prev7.filter((r) => NEGATIVE_EMOTIONS.includes(r.emotion)).length;
    const recentAvg = (recent7.reduce((a, r) => a + r.intensity, 0) / recent7.length).toFixed(1);
    const prevAvg = (prev7.reduce((a, r) => a + r.intensity, 0) / prev7.length).toFixed(1);

    if (recentNeg > prevNeg + 1) {
      trendText = `Tendencia reciente: la última semana ha sido emocionalmente más difícil que la anterior (${recentNeg} días negativos frente a ${prevNeg}).`;
    } else if (prevNeg > recentNeg + 1) {
      trendText = `Tendencia reciente: la última semana ha mejorado respecto a la anterior (${recentNeg} días negativos frente a ${prevNeg}).`;
    } else {
      trendText = `Tendencia reciente: estable, intensidad media ${recentAvg}/10 esta semana frente a ${prevAvg}/10 la semana anterior.`;
    }
  }

  // ── Compose ──────────────────────────────────────────────────────────────
  let summary = `En los últimos ${last30.length} días el usuario ha registrado: ${distribution}. Emoción predominante: "${predominant}" con intensidad media de ${avgIntensity}/10.`;
  if (dowPatterns.length > 0) {
    summary += ` Patrones por día de la semana: ${dowPatterns.join("; ")}.`;
  }
  if (trendText) {
    summary += ` ${trendText}`;
  }
  return summary;
}

function makeStaticRecommendations(userId: string): Recommendation[] {
  const now = new Date().toISOString();
  return STATIC_RECOMMENDATIONS.map((r, i) => ({
    id: `static_${i}`,
    userId,
    categoria: r.categoria,
    titulo: r.titulo,
    descripcion: r.descripcion,
    completada: false,
    fechaGenerada: now,
    isStatic: true,
  }));
}

export async function generateRecommendations(
  records: EmotionRecord[],
  userId: string,
): Promise<Recommendation[]> {
  if (records.length < 7) {
    return makeStaticRecommendations(userId);
  }

  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return makeStaticRecommendations(userId);
  }

  const summary = buildEmotionalSummary(records);
  const prompt = `Eres un asistente de bienestar emocional. ${summary}

Basándote en este análisis emocional (incluyendo los patrones por día de la semana y la tendencia reciente), genera exactamente 5 recomendaciones personalizadas y accionables. Si hay días concretos que tienden a ser difíciles, al menos una recomendación debe abordar específicamente esos días. Devuelve ÚNICAMENTE un array JSON válido con esta estructura exacta (sin texto adicional, sin markdown, sin bloques de código):
[
  {"categoria": "mindfulness", "titulo": "Título breve", "descripcion": "Descripción de 2-3 frases completas y prácticas en español"},
  {"categoria": "actividad", "titulo": "Título breve", "descripcion": "Descripción de 2-3 frases completas y prácticas en español"},
  {"categoria": "lectura", "titulo": "Título breve", "descripcion": "Descripción de 2-3 frases completas y prácticas en español"},
  {"categoria": "mindfulness", "titulo": "Título breve", "descripcion": "Descripción de 2-3 frases completas y prácticas en español"},
  {"categoria": "actividad", "titulo": "Título breve", "descripcion": "Descripción de 2-3 frases completas y prácticas en español"}
]
Reglas importantes:
- Las categorías deben ser exactamente una de: "mindfulness", "actividad" o "lectura".
- Todas las frases deben estar completas, nunca cortadas.
- El JSON debe estar bien formado y cerrado correctamente.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (!response.ok) {
      return makeStaticRecommendations(userId);
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    console.log(
      "[Gemini Recs] finishReason:",
      candidate?.finishReason,
      "| chars:",
      candidate?.content?.parts?.[0]?.text?.length,
    );
    const rawText: string | undefined = candidate?.content?.parts?.[0]?.text;

    if (!rawText) {
      return makeStaticRecommendations(userId);
    }

    // Strip optional markdown code fences before parsing
    const cleaned = rawText.trim().replace(/^```json?\s*/i, "").replace(/```\s*$/, "");

    let parsed: { categoria: string; titulo: string; descripcion: string }[];
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return makeStaticRecommendations(userId);
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return makeStaticRecommendations(userId);
    }

    const now = new Date().toISOString();
    const validCategories: RecommendationCategory[] = ["mindfulness", "actividad", "lectura"];

    return parsed.map((item, i) => ({
      id: `gemini_${Date.now()}_${i}`,
      userId,
      categoria: validCategories.includes(item.categoria as RecommendationCategory)
        ? (item.categoria as RecommendationCategory)
        : "mindfulness",
      titulo: item.titulo ?? "Recomendación",
      descripcion: item.descripcion ?? "",
      completada: false,
      fechaGenerada: now,
      isStatic: false,
    }));
  } catch {
    return makeStaticRecommendations(userId);
  }
}
