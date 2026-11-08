import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Node 22+ expone un `localStorage` experimental (inutilizable sin
// --localstorage-file) que en Vitest 4 tapa al de jsdom. Usamos el de jsdom.
if (globalThis.jsdom?.window) {
  for (const key of ["localStorage", "sessionStorage", "Storage"]) {
    Object.defineProperty(globalThis, key, {
      value: globalThis.jsdom.window[key],
      configurable: true,
      writable: true,
    });
  }
}

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
