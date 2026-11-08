import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom no implementa matchMedia: por defecto simulamos un celular (sin coincidencias).
// Función común (no vi.fn) para que `restoreMocks` no la vacíe entre tests.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
}

if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};
if (!Element.prototype.scrollBy) Element.prototype.scrollBy = () => {};

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.useRealTimers();
});
