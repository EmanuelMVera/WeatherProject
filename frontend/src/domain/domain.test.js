import { uvCategory } from "./uv";
import { windDirection } from "./wind";
import { describeDayRain, rainIntensity, summarizeUpcomingRain } from "./precipitation";
import { evaluateConditions, recommendActivities, summarizeOutlook } from "./activities";
import { isValidPlace, toPlace } from "./location";

const hour = (localHour, precipitationProbability, precipitation = 0) => ({
  localHour,
  time: `2026-11-07T${String(localHour).padStart(2, "0")}:00:00Z`,
  precipitationProbability,
  precipitation,
});

describe("índice UV (escala OMS)", () => {
  it.each([
    [0, "Bajo"],
    [2.4, "Bajo"],
    [2.6, "Moderado"],
    [5, "Moderado"],
    [6, "Alto"],
    [7.4, "Alto"],
    [8, "Muy alto"],
    [10.4, "Muy alto"],
    [11, "Extremo"],
  ])("UV %s -> %s", (value, label) => {
    expect(uvCategory(value).label).toBe(label);
  });

  it("sin dato devuelve null", () => {
    expect(uvCategory(null)).toBeNull();
  });
});

describe("viento", () => {
  it("dirección en 8 rumbos en español", () => {
    expect(windDirection(0).short).toBe("N");
    expect(windDirection(171).name).toBe("sur");
    expect(windDirection(225).short).toBe("SO");
    expect(windDirection(359).short).toBe("N");
    expect(windDirection(null)).toBeNull();
  });
});

describe("precipitaciones", () => {
  it("intensidad según mm/h", () => {
    expect(rainIntensity(0)).toBeNull();
    expect(rainIntensity(1).label).toBe("débil");
    expect(rainIntensity(5).label).toBe("moderada");
    expect(rainIntensity(10).label).toBe("fuerte");
  });

  it("describe la franja con lluvia sólo si los datos la respaldan", () => {
    const hours = [hour(9, 10), hour(10, 5), hour(15, 70, 1.2), hour(16, 60, 0.4), hour(20, 20)];
    expect(describeDayRain(hours)).toBe("Se prevé lluvia durante la tarde.");
  });

  it("no confunde probabilidad alta sin milímetros con lluvia prevista", () => {
    const hours = [hour(15, 60, 0), hour(16, 55, 0)];
    expect(describeDayRain(hours)).toBe("Chances bajas de lluvia (hasta 60 %).");
  });

  it("sin probabilidades no inventa una frase", () => {
    expect(describeDayRain([hour(10, null), hour(11, null)])).toBeNull();
  });

  it("resumen de próximas horas", () => {
    const hours = [hour(1, 0), hour(2, 10), hour(3, 80, 3), hour(4, 40, 0.5)];
    const summary = summarizeUpcomingRain(hours, (iso) => iso.slice(11, 16));
    expect(summary.sentence).toBe("Se prevé lluvia desde las 03:00.");
    expect(summary.totalMm).toBeCloseTo(3.5);
    expect(summary.peakIntensity.label).toBe("moderada");

    const dry = summarizeUpcomingRain([hour(1, 0), hour(2, 5)], () => "");
    expect(dry.sentence).toBe("No se prevé lluvia en las próximas 2 horas.");
  });
});

describe("recomendaciones de actividades", () => {
  const base = {
    current: { apparentTemperature: 20, windSpeed: 10, windGusts: 20, uvIndex: 3, isDay: true, weatherCode: 1 },
    hourly: [
      { precipitationProbability: 0, precipitation: 0, windSpeed: 10, windGusts: 20, weatherCode: 1 },
    ],
  };

  it("condiciones agradables -> buenas para todo", () => {
    const recs = recommendActivities(evaluateConditions(base));
    expect(recs.every((r) => r.level === "good")).toBe(true);
  });

  it("tormenta -> no recomendado para ninguna actividad", () => {
    const stormy = structuredClone(base);
    stormy.hourly[0].weatherCode = 95;
    const recs = recommendActivities(evaluateConditions(stormy));
    expect(recs.every((r) => r.level === "bad")).toBe(true);
  });

  it("viento fuerte afecta más a la bicicleta", () => {
    const windy = structuredClone(base);
    windy.current.windGusts = 55;
    const recs = Object.fromEntries(recommendActivities(evaluateConditions(windy)).map((r) => [r.key, r.level]));
    expect(recs).toEqual({ walk: "caution", run: "caution", bike: "bad" });
  });

  it("calor extremo: no recomendado correr, precaución al caminar", () => {
    const hot = structuredClone(base);
    hot.current.apparentTemperature = 37;
    const recs = Object.fromEntries(recommendActivities(evaluateConditions(hot)).map((r) => [r.key, r.level]));
    expect(recs.run).toBe("bad");
    expect(recs.walk).toBe("caution");
  });

  it("resumen general: avisa lluvia más tarde sólo si los datos la respaldan", () => {
    const recs = recommendActivities(evaluateConditions(base));
    const hours = Array.from({ length: 12 }, (_, i) => ({
      time: `2026-11-07T${String(12 + i).padStart(2, "0")}:00:00Z`,
      precipitationProbability: i === 6 ? 80 : 5,
      precipitation: i === 6 ? 2 : 0,
    }));
    const outlook = summarizeOutlook(recs, hours, "America/Argentina/Buenos_Aires");
    expect(outlook.title).toBe("Buen momento para salir");
    expect(outlook.tips[0]).toMatch(/Se prevé lluvia desde las 15:00/);

    const dry = summarizeOutlook(recs, hours.map((h) => ({ ...h, precipitationProbability: 5 })), "UTC");
    expect(dry.tips).toEqual([]);
  });

  it("sin datos esenciales no recomienda", () => {
    expect(recommendActivities(evaluateConditions({ current: null, hourly: [] }))).toBeNull();
  });
});

describe("localidades", () => {
  it("valida y normaliza", () => {
    expect(isValidPlace({ name: "X", latitude: 91, longitude: 0 })).toBe(false);
    expect(isValidPlace({ name: "", latitude: 0, longitude: 0 })).toBe(false);
    const place = toPlace({ name: "  Córdoba  ", latitude: -31.4142, longitude: -64.18105 }, "search");
    expect(place).toMatchObject({ id: "-31.414,-64.181", name: "Córdoba", source: "search" });
  });
});
