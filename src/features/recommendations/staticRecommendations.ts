import type { Recommendation } from "../../types/recommendation";

export const STATIC_RECOMMENDATIONS: Omit<
  Recommendation,
  "id" | "userId" | "completada" | "fechaGenerada"
>[] = [
  {
    categoria: "mindfulness",
    titulo: "Respiración 4-7-8",
    descripcion:
      "Inhala durante 4 segundos, retén el aire 7 segundos y exhala lentamente durante 8. Repítelo 3 veces para calmar el sistema nervioso.",
    isStatic: true,
  },
  {
    categoria: "mindfulness",
    titulo: "Escaneo corporal de 5 minutos",
    descripcion:
      "Túmbate o siéntate cómodamente y recorre mentalmente tu cuerpo de pies a cabeza, notando sin juzgar las sensaciones que encuentres.",
    isStatic: true,
  },
  {
    categoria: "actividad",
    titulo: "Paseo de 10 minutos al aire libre",
    descripcion:
      "Sal a caminar sin auriculares. Observa los colores, los sonidos y el movimiento a tu alrededor. El contacto con la naturaleza reduce el cortisol.",
    isStatic: true,
  },
  {
    categoria: "actividad",
    titulo: "Escribe 3 cosas por las que agradeces hoy",
    descripcion:
      "Dedica dos minutos a apuntar tres cosas concretas que hayan ido bien hoy, por pequeñas que sean. La gratitud activa el circuito de recompensa cerebral.",
    isStatic: true,
  },
  {
    categoria: "lectura",
    titulo: "El poder del ahora — Eckhart Tolle",
    descripcion:
      "Una guía práctica para vivir en el presente y reducir el sufrimiento causado por pensamientos sobre el pasado o el futuro.",
    isStatic: true,
  },
  {
    categoria: "lectura",
    titulo: "Hábitos Atómicos — James Clear",
    descripcion:
      "Explica cómo pequeños cambios consistentes generan resultados notables. Ideal si quieres construir rutinas de bienestar sostenibles.",
    isStatic: true,
  },
];
