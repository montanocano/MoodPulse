import { EmotionType } from "../../types/emotion";

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
  intensity: number
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    return STATIC_FALLBACKS[emotion];
  }

  const prompt = `Eres un asistente de bienestar emocional. El usuario se siente "${emotion}" con una intensidad de ${intensity}/10.
Genera una reflexión guiada breve (2-3 frases) en primera persona, en español, que ayude al usuario a explorar y articular cómo se siente hoy.
La reflexión debe ser empática, no clínica, y usar un tono cercano y cálido.
Devuelve únicamente el texto de la reflexión, sin introducciones ni explicaciones.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!response.ok) {
      return STATIC_FALLBACKS[emotion];
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    console.log("[Gemini] finishReason:", candidate?.finishReason, "| chars:", candidate?.content?.parts?.[0]?.text?.length);
    const text: string | undefined = candidate?.content?.parts?.[0]?.text;

    return text?.trim() || STATIC_FALLBACKS[emotion];
  } catch {
    return STATIC_FALLBACKS[emotion];
  }
}
