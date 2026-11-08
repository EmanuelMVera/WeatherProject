import {
  formatTemp,
  formatMm,
  formatTime,
  localDateOf,
  relativeDayLabel,
  formatLongDate,
  formatRelativeTime,
  formatDuration,
} from "./format";

describe("formateadores", () => {
  it("temperaturas redondeadas y guion si falta el dato (nunca 0)", () => {
    expect(formatTemp(15.6)).toBe("16°");
    expect(formatTemp(0)).toBe("0°");
    expect(formatTemp(null)).toBe("—");
    expect(formatTemp(undefined)).toBe("—");
  });

  it("milímetros con coma decimal", () => {
    expect(formatMm(1.25)).toMatch(/^1,3\smm$/);
    expect(formatMm(null)).toBe("—");
  });

  it("formatea horas en la zona de la ciudad, no la del navegador", () => {
    const iso = "2026-11-07T04:30:00Z";
    expect(formatTime(iso, "America/Argentina/Buenos_Aires")).toBe("01:30");
    expect(formatTime(iso, "Asia/Tokyo")).toBe("13:30");
    expect(formatTime(iso, "Europe/Madrid")).toBe("05:30");
  });

  it("fecha local según zona (cambio de día)", () => {
    const instant = Date.parse("2026-01-01T02:00:00Z");
    expect(localDateOf(instant, "America/Argentina/Buenos_Aires")).toBe("2025-12-31");
    expect(localDateOf(instant, "Asia/Tokyo")).toBe("2026-01-01");
  });

  it("etiquetas relativas de día", () => {
    expect(relativeDayLabel("2026-11-07", "2026-11-07")).toBe("Hoy");
    expect(relativeDayLabel("2026-11-08", "2026-11-07")).toBe("Mañana");
    expect(relativeDayLabel("2026-11-09", "2026-11-07")).toBe("Lunes");
    expect(formatLongDate("2026-11-07")).toBe("Sábado 7 de noviembre");
  });

  it("tiempo relativo y duración", () => {
    const now = 10 * 60 * 60 * 1000;
    expect(formatRelativeTime(now - 10_000, now)).toBe("recién");
    expect(formatRelativeTime(now - 5 * 60_000, now)).toBe("hace 5 min");
    expect(formatRelativeTime(now - 3 * 3600_000, now)).toBe("hace 3 h");
    expect(formatDuration(49344)).toBe("13 h 42 min");
  });
});
