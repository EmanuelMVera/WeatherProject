import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { clearWeatherSessionCache } from "./hooks/useWeather";
import { STORAGE_KEYS } from "./lib/storage";
import { FIXTURE_NOW, jsonResponse, weatherFixture } from "./test/fixtures";

const GEO_RESULTS = {
  results: [
    {
      id: 3860259,
      name: "Córdoba",
      latitude: -31.4135,
      longitude: -64.18105,
      country_code: "AR",
      country: "Argentina",
      admin1: "Córdoba",
    },
  ],
};

/** fetch simulado: enruta por URL y registra las llamadas. */
function mockFetch({ weather = () => jsonResponse(weatherFixture()), alerts } = {}) {
  const calls = [];
  vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
    const u = String(url);
    calls.push(u);
    if (u.includes("geocoding-api.open-meteo.com")) return jsonResponse(GEO_RESULTS);
    if (u.includes("/api/weather")) return weather(u);
    if (u.includes("/api/alerts")) {
      return alerts ? alerts(u) : jsonResponse({ alerts: [], partial: false, checkedAt: new Date(FIXTURE_NOW).toISOString() });
    }
    throw new TypeError("Failed to fetch");
  });
  return calls;
}

describe("App", () => {
  beforeEach(() => {
    clearWeatherSessionCache();
    vi.useFakeTimers({ toFake: ["Date"], now: FIXTURE_NOW });
  });

  it("primera visita: muestra Buenos Aires, explica la ubicación y carga el clima", async () => {
    mockFetch();
    render(<App />);
    expect(screen.getByText(/Cargando el pronóstico de Buenos Aires/)).toBeInTheDocument();
    expect(screen.getByText(/te va a pedir permiso/)).toBeInTheDocument();

    expect(await screen.findByRole("heading", { name: "Buenos Aires" })).toBeInTheDocument();
    expect(screen.getByText("Parcialmente nublado", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pronóstico de 7 días" })).toBeInTheDocument();
    expect(await screen.findByText(/El SMN no tiene alertas vigentes/)).toBeInTheDocument();
    expect(document.title).toMatch(/Buenos Aires · Buen Clima/);
  });

  it("buscar y cambiar de ciudad consulta por coordenadas y recuerda la elección", async () => {
    const calls = mockFetch();
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: "Buenos Aires" });

    await user.type(screen.getByRole("combobox"), "Córdoba");
    await user.click(await screen.findByRole("option", { name: /Córdoba/ }));

    expect(await screen.findByRole("heading", { name: "Córdoba" })).toBeInTheDocument();
    expect(calls.some((u) => /\/api\/weather\?lat=-31\.4135&lon=-64\.181\d/.test(u))).toBe(true);
    const last = JSON.parse(localStorage.getItem(STORAGE_KEYS.lastLocation));
    expect(last).toMatchObject({ name: "Córdoba", latitude: -31.4135 });
  });

  it("guarda favoritos y permite volver a ellos", async () => {
    mockFetch();
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: "Buenos Aires" });

    const favBar = screen.getByRole("region", { name: "Localidades favoritas" });
    // Desde la estrella de la tarjeta…
    await user.click(screen.getByRole("button", { name: "Guardar en favoritos" }));
    expect(within(favBar).getByRole("button", { name: "Buenos Aires" })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites))).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "Agregar Buenos Aires a favoritos" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Quitar Buenos Aires de favoritos" }));
    expect(within(favBar).queryByRole("button", { name: "Buenos Aires" })).not.toBeInTheDocument();

    // …o desde el chip "Agregar" de la barra.
    await user.click(screen.getByRole("button", { name: "Agregar Buenos Aires a favoritos" }));
    expect(screen.getByRole("button", { name: "Quitar de favoritos" })).toHaveAttribute("aria-pressed", "true");
  });

  it("sin conexión avisa y mantiene los datos", async () => {
    mockFetch();
    render(<App />);
    await screen.findByRole("heading", { name: "Buenos Aires" });
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
    window.dispatchEvent(new Event("offline"));
    expect(await screen.findByText("Sin conexión a Internet")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Buenos Aires" })).toBeInTheDocument();
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
    window.dispatchEvent(new Event("online"));
    await waitFor(() => expect(screen.queryByText("Sin conexión a Internet")).not.toBeInTheDocument());
  });

  it("error de API: mensaje contextual (sin modal) y reintento", async () => {
    let fail = true;
    mockFetch({
      weather: () =>
        fail
          ? jsonResponse({ error: { code: "INVALID_REQUEST", message: "La ubicación no es válida." } }, 400)
          : jsonResponse(weatherFixture()),
    });
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos cargar el pronóstico");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fail = false;
    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByRole("heading", { name: "Buenos Aires" })).toBeInTheDocument();
  });

  it("si falla una actualización, conserva los datos y lo avisa", async () => {
    let fail = false;
    mockFetch({
      weather: () =>
        fail
          ? jsonResponse({ error: { code: "RATE_LIMITED", message: "Hiciste demasiadas consultas seguidas." } }, 429)
          : jsonResponse(weatherFixture()),
    });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: "Buenos Aires" });

    fail = true;
    await user.click(screen.getByRole("button", { name: "Actualizar" }));
    expect(await screen.findByText("No pudimos actualizar los datos")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Buenos Aires" })).toBeInTheDocument();
  });

  it("geolocalización denegada: explica y deja buscar manualmente", async () => {
    mockFetch();
    const getCurrentPosition = vi.fn((_ok, err) => err({ code: 1 }));
    Object.defineProperty(navigator, "geolocation", { value: { getCurrentPosition }, configurable: true });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: "Buenos Aires" });

    await user.click(screen.getByRole("button", { name: "Usar mi ubicación" }));
    expect(await screen.findByText(/No tenemos permiso para usar tu ubicación/)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeEnabled();
  });

  it("geolocalización concedida: consulta con coordenadas redondeadas", async () => {
    const calls = mockFetch();
    const getCurrentPosition = vi.fn((ok) => ok({ coords: { latitude: -34.921456, longitude: -57.954321 } }));
    Object.defineProperty(navigator, "geolocation", { value: { getCurrentPosition }, configurable: true });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: "Buenos Aires" });

    await user.click(screen.getByRole("button", { name: "Usar mi ubicación" }));
    expect(await screen.findByRole("heading", { name: "Mi ubicación" })).toBeInTheDocument();
    await waitFor(() => expect(calls.some((u) => u.includes("lat=-34.9200&lon=-57.9500"))).toBe(true));
  });
});
