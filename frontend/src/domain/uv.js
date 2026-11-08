/**
 * Categorías del índice UV según la escala de la OMS.
 * https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index
 */
const UV_LEVELS = [
  { max: 3, key: "low", label: "Bajo", advice: "No hace falta protección especial." },
  { max: 6, key: "moderate", label: "Moderado", advice: "Usá protector solar si vas a estar afuera un rato." },
  { max: 8, key: "high", label: "Alto", advice: "Protector, gorra y anteojos. Buscá sombra al mediodía." },
  { max: 11, key: "very-high", label: "Muy alto", advice: "Evitá el sol entre las 11 y las 16. Protección completa." },
  { max: Infinity, key: "extreme", label: "Extremo", advice: "Evitá exponerte al sol. Protección máxima." },
];

/**
 * @param {number|null} uv
 * @returns {{ key: string, label: string, advice: string } | null}
 */
export function uvCategory(uv) {
  if (typeof uv !== "number" || !Number.isFinite(uv)) return null;
  // La escala se aplica sobre el valor redondeado (2,6 cuenta como 3: moderado).
  const rounded = Math.round(uv);
  const level = UV_LEVELS.find((l) => rounded < l.max);
  return { key: level.key, label: level.label, advice: level.advice };
}
