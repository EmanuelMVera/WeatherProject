import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LocationSearch from "./LocationSearch";
import { searchPlaces } from "../../services/geoClient";

vi.mock("../../services/geoClient", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, searchPlaces: vi.fn() };
});

const place = (id, name, region, country) => ({
  id,
  name,
  region,
  country,
  latitude: 1,
  longitude: 2,
  label: [name, region, country].join(", "),
});

const CORDOBA_AR = place("a", "Córdoba", "Córdoba", "Argentina");
const CORDOBA_ES = place("b", "Córdoba", "Andalucía", "España");

describe("LocationSearch", () => {
  beforeEach(() => {
    searchPlaces.mockReset();
  });

  it("muestra sugerencias y diferencia localidades homónimas", async () => {
    searchPlaces.mockResolvedValue([CORDOBA_AR, CORDOBA_ES]);
    const user = userEvent.setup();
    render(<LocationSearch onSelectPlace={vi.fn()} />);

    await user.type(screen.getByRole("combobox", { name: /buscar una ciudad/i }), "Córdoba");
    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent("Córdoba · Argentina");
    expect(options[1]).toHaveTextContent("Andalucía · España");
    // Debounce: una sola consulta por todo lo tipeado.
    expect(searchPlaces).toHaveBeenCalledTimes(1);
  });

  it("permite elegir con el teclado", async () => {
    searchPlaces.mockResolvedValue([CORDOBA_AR, CORDOBA_ES]);
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<LocationSearch onSelectPlace={onSelect} />);

    const input = screen.getByRole("combobox");
    await user.type(input, "Cór");
    await screen.findAllByRole("option");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith(CORDOBA_ES);
    expect(input).toHaveValue("");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("permite elegir tocando una opción", async () => {
    searchPlaces.mockResolvedValue([CORDOBA_AR]);
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<LocationSearch onSelectPlace={onSelect} />);
    await user.type(screen.getByRole("combobox"), "Cór");
    await user.click(await screen.findByRole("option"));
    expect(onSelect).toHaveBeenCalledWith(CORDOBA_AR);
  });

  it("informa cuando no hay resultados", async () => {
    searchPlaces.mockResolvedValue([]);
    const user = userEvent.setup();
    render(<LocationSearch onSelectPlace={vi.fn()} />);
    await user.type(screen.getByRole("combobox"), "Xyzzy");
    expect(await screen.findByText(/No encontramos «Xyzzy»/)).toBeInTheDocument();
  });

  it("muestra errores del buscador", async () => {
    searchPlaces.mockRejectedValue(new Error("La búsqueda de localidades no está disponible."));
    const user = userEvent.setup();
    render(<LocationSearch onSelectPlace={vi.fn()} />);
    await user.type(screen.getByRole("combobox"), "Paris");
    const list = screen.getByRole("listbox", { hidden: true });
    await waitFor(() => expect(list).toHaveTextContent(/no está disponible/));
    expect(list).toBeVisible();
  });

  it("una respuesta vieja no pisa una búsqueda más reciente", async () => {
    let resolveFirst;
    searchPlaces
      .mockImplementationOnce(() => new Promise((resolve) => (resolveFirst = resolve)))
      .mockResolvedValueOnce([CORDOBA_ES]);
    const user = userEvent.setup();
    render(<LocationSearch onSelectPlace={vi.fn()} />);
    const input = screen.getByRole("combobox");

    await user.type(input, "Ro");
    await waitFor(() => expect(searchPlaces).toHaveBeenCalledTimes(1));
    await user.type(input, "ma");
    await waitFor(() => expect(searchPlaces).toHaveBeenCalledTimes(2));
    expect(await screen.findByRole("option")).toHaveTextContent("España");

    resolveFirst([CORDOBA_AR]); // llega tarde
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option")).toHaveTextContent("España");
  });
});
