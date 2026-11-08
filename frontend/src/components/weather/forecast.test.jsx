import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HourlyForecast from "./HourlyForecast";
import DailyForecast from "./DailyForecast";
import AlertsCard from "./AlertsCard";
import CurrentWeatherCard from "./CurrentWeatherCard";
import { weatherFixture, FIXTURE_NOW } from "../../test/fixtures";

const TZ = "America/Argentina/Buenos_Aires";
const TODAY = "2026-11-07";

describe("HourlyForecast", () => {
  it("muestra 48 horas en hora local, con probabilidad y cantidad de lluvia", () => {
    const data = weatherFixture();
    render(<HourlyForecast hours={data.hourly} timeZone={TZ} todayStr={TODAY} />);
    const list = screen.getByRole("list", { name: /pronóstico por hora/i });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(48);
    expect(items[0]).toHaveTextContent("Ahora");
    expect(items[1]).toHaveTextContent("02:00");
    // La probabilidad se anuncia como tal y no se confunde con milímetros.
    expect(items[0]).toHaveTextContent(/Probabilidad de lluvia\s*\d+%/);
    // Separador de día al pasar la medianoche local.
    const midnight = items.find((li) => li.textContent.includes("00:00"));
    expect(midnight).toHaveTextContent(/dom 8\/11/i);
  });

  it("estado vacío", () => {
    render(<HourlyForecast hours={[]} timeZone={TZ} todayStr={TODAY} />);
    expect(screen.getByText(/No hay pronóstico por hora/)).toBeInTheDocument();
  });
});

describe("DailyForecast", () => {
  const data = weatherFixture();

  it("lista 7 días con nombres correctos y mín/máx del proveedor", () => {
    render(<DailyForecast days={data.daily} hours={data.hourly} timeZone={TZ} todayStr={TODAY} isWide={false} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(7);
    expect(buttons[0]).toHaveTextContent("Hoy");
    expect(buttons[1]).toHaveTextContent("Mañana");
    expect(buttons[2]).toHaveTextContent("Lunes");
    expect(buttons[0]).toHaveTextContent(/Mínima\s*12°/);
    expect(buttons[0]).toHaveTextContent(/Máxima\s*19°/);
  });

  it("en el celular se expande y contrae dentro de la lista", async () => {
    const user = userEvent.setup();
    render(<DailyForecast days={data.daily} hours={data.hourly} timeZone={TZ} todayStr={TODAY} isWide={false} />);
    const monday = screen.getAllByRole("button")[2];
    expect(monday).toHaveAttribute("aria-expanded", "false");

    await user.click(monday);
    expect(monday).toHaveAttribute("aria-expanded", "true");
    const detail = document.getElementById(monday.getAttribute("aria-controls"));
    expect(detail).toHaveTextContent("Lunes 9 de noviembre");
    expect(detail).toHaveTextContent("Lluvia acumulada");

    await user.click(monday);
    expect(monday).toHaveAttribute("aria-expanded", "false");
  });

  it("en escritorio muestra el detalle en un panel lateral", async () => {
    const user = userEvent.setup();
    render(<DailyForecast days={data.daily} hours={data.hourly} timeZone={TZ} todayStr={TODAY} isWide />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    await user.click(buttons[3]);
    expect(buttons[3]).toHaveAttribute("aria-pressed", "true");
    const panel = document.getElementById(buttons[3].getAttribute("aria-controls"));
    expect(panel).toHaveTextContent("Martes 10 de noviembre");
  });
});

describe("AlertsCard", () => {
  it("no afirma ausencia de alertas si la consulta falló", () => {
    render(<AlertsCard state={{ status: "error", data: null }} timeZone={TZ} now={FIXTURE_NOW} />);
    expect(screen.queryByText(/no tiene alertas vigentes/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /smn\.gob\.ar/i })).toHaveAttribute("href", "https://www.smn.gob.ar/alertas");
  });

  it("no afirma ausencia de alertas si la consulta fue parcial", () => {
    render(
      <AlertsCard
        state={{ status: "success", data: { alerts: [], partial: true, checkedAt: new Date(FIXTURE_NOW).toISOString() } }}
        timeZone={TZ}
        now={FIXTURE_NOW}
      />
    );
    expect(screen.queryByText(/no tiene alertas vigentes/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Confirmalo en el sitio oficial/)).toBeInTheDocument();
  });

  it("fuera de Argentina explica la cobertura", () => {
    render(<AlertsCard state={{ status: "not-covered", data: null }} timeZone="Europe/Madrid" now={FIXTURE_NOW} />);
    expect(screen.getByText(/servicio meteorológico oficial de su país/)).toBeInTheDocument();
  });

  it("muestra alertas vigentes con su vigencia en hora local", () => {
    const alert = {
      id: "1",
      event: "Viento",
      severity: "Moderate",
      severityLabel: "Moderada",
      description: "Ráfagas de hasta 70 km/h.",
      instruction: "Asegurá objetos sueltos.",
      onset: "2026-11-07T12:00:00Z",
      expires: "2026-11-07T17:59:59Z",
    };
    render(
      <AlertsCard
        state={{ status: "success", data: { alerts: [alert], partial: false, checkedAt: "2026-11-07T04:00:00Z" } }}
        timeZone={TZ}
        now={FIXTURE_NOW}
      />
    );
    expect(screen.getByText("Viento")).toBeInTheDocument();
    expect(screen.getByText(/Desde 7\/11 09:00 · Hasta 7\/11 14:59/)).toBeInTheDocument();
  });
});

describe("CurrentWeatherCard", () => {
  const place = { id: "x", name: "Buenos Aires", region: "CABA", country: "Argentina", source: "search" };
  const status = { fetchedAt: FIXTURE_NOW, stale: false, loading: false, onRefresh: vi.fn(), now: FIXTURE_NOW };

  it("muestra datos faltantes con guion y no como cero", () => {
    const data = weatherFixture();
    data.current.temperature = null;
    data.current.apparentTemperature = null;
    render(
      <CurrentWeatherCard place={place} data={data} today={data.daily[0]} isFavorite={false} onToggleFavorite={vi.fn()} status={status} />
    );
    expect(screen.getByText(/Temperatura actual/).parentElement).toHaveTextContent("—");
    expect(screen.queryByText(/^0°/)).not.toBeInTheDocument();
  });

  it("indica fuente, hora de los datos y estado desactualizado", () => {
    const data = weatherFixture();
    render(
      <CurrentWeatherCard
        place={place}
        data={data}
        today={data.daily[0]}
        isFavorite
        canFavorite
        onToggleFavorite={vi.fn()}
        status={{ ...status, stale: true }}
      />
    );
    expect(screen.getByRole("link", { name: "Open-Meteo" })).toBeInTheDocument();
    expect(screen.getByText(/Datos de las 01:30 \(hora local, GMT-3\)/)).toBeInTheDocument();
    expect(screen.getByText(/Datos desactualizados/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quitar de favoritos" })).toHaveAttribute("aria-pressed", "true");
  });
});
