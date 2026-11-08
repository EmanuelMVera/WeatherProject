import { act, renderHook } from "@testing-library/react";
import { useFavorites, MAX_FAVORITES } from "./useFavorites";
import { STORAGE_KEYS } from "../lib/storage";

const place = (name, lat, lon) => ({ id: `${lat.toFixed(3)},${lon.toFixed(3)}`, name, latitude: lat, longitude: lon });

describe("useFavorites", () => {
  it("agrega, evita duplicados, elimina y persiste", () => {
    const { result } = renderHook(() => useFavorites());
    const rosario = place("Rosario", -32.95, -60.65);

    act(() => result.current.addFavorite(rosario));
    act(() => result.current.addFavorite(rosario));
    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.isFavorite(rosario.id)).toBe(true);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites));
    expect(saved[0]).toMatchObject({ name: "Rosario", latitude: -32.95, longitude: -60.65 });

    act(() => result.current.toggleFavorite(rosario));
    expect(result.current.favorites).toHaveLength(0);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites))).toEqual([]);
  });

  it("se recupera de datos corruptos en localStorage", () => {
    localStorage.setItem(STORAGE_KEYS.favorites, "{no es json");
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
  });

  it("descarta entradas inválidas y duplicadas al leer", () => {
    localStorage.setItem(
      STORAGE_KEYS.favorites,
      JSON.stringify([
        { name: "Salta", latitude: -24.78, longitude: -65.41 },
        { name: "Salta", latitude: -24.78, longitude: -65.41 },
        { name: "Mal", latitude: 500, longitude: 0 },
        "texto",
        null,
      ])
    );
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites.map((f) => f.name)).toEqual(["Salta"]);
  });

  it("respeta el máximo de favoritos", () => {
    const { result } = renderHook(() => useFavorites());
    for (let i = 0; i < MAX_FAVORITES + 3; i += 1) {
      act(() => result.current.addFavorite(place(`Lugar ${i}`, i, i)));
    }
    expect(result.current.favorites).toHaveLength(MAX_FAVORITES);
    expect(result.current.isFull).toBe(true);
  });

  it("funciona aunque localStorage falle al guardar", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceeded");
    });
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.addFavorite(place("Mendoza", -32.89, -68.83)));
    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.storageError).toBe(true);
    spy.mockRestore();
  });
});
