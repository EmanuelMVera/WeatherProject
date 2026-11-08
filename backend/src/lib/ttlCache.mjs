/**
 * Caché en memoria con TTL, límite de entradas (LRU), deduplicación de cargas
 * concurrentes y "stale-if-error".
 *
 * - Sólo se guardan valores que el loader devolvió con éxito: un error nunca
 *   queda cacheado.
 * - Si el loader falla y existe un valor vencido dentro de la ventana
 *   `staleTtlMs`, se devuelve marcado como `stale: true`.
 * - Varias peticiones simultáneas para la misma clave comparten una sola carga.
 *
 * Los datos cacheados son públicos (pronóstico por coordenadas): no se guarda
 * nada que identifique a quién los pidió.
 */
export class TtlCache {
  /**
   * @param {{ ttlMs: number, staleTtlMs?: number, maxEntries?: number, now?: () => number }} opts
   */
  constructor({ ttlMs, staleTtlMs = 0, maxEntries = 500, now = Date.now }) {
    if (!(ttlMs > 0)) throw new Error("ttlMs debe ser mayor a 0");
    this.ttlMs = ttlMs;
    this.staleTtlMs = staleTtlMs;
    this.maxEntries = maxEntries;
    this.now = now;
    /** @type {Map<string, { value: unknown, storedAt: number }>} */
    this.entries = new Map();
    /** @type {Map<string, Promise<unknown>>} */
    this.inflight = new Map();
  }

  get size() {
    return this.entries.size;
  }

  /** Devuelve la entrada si todavía es utilizable (fresca o stale). */
  #peek(key) {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    const age = this.now() - entry.storedAt;
    if (age > this.ttlMs + this.staleTtlMs) {
      this.entries.delete(key);
      return undefined;
    }
    return { ...entry, fresh: age <= this.ttlMs };
  }

  /** Valor fresco o `undefined`. */
  get(key) {
    const entry = this.#peek(key);
    if (!entry || !entry.fresh) return undefined;
    // Re-insertar para mantener orden LRU.
    this.entries.delete(key);
    this.entries.set(key, { value: entry.value, storedAt: entry.storedAt });
    return entry.value;
  }

  set(key, value) {
    this.entries.delete(key);
    this.entries.set(key, { value, storedAt: this.now() });
    while (this.entries.size > this.maxEntries) {
      const oldestKey = this.entries.keys().next().value;
      this.entries.delete(oldestKey);
    }
  }

  clear() {
    this.entries.clear();
    this.inflight.clear();
  }

  /**
   * @template T
   * @param {string} key
   * @param {() => Promise<T>} loader
   * @returns {Promise<{ value: T, storedAt: number, status: "HIT"|"MISS"|"STALE" }>}
   */
  async getOrLoad(key, loader) {
    const cached = this.#peek(key);
    if (cached?.fresh) {
      this.get(key); // refresca LRU
      return { value: cached.value, storedAt: cached.storedAt, status: "HIT" };
    }

    let pending = this.inflight.get(key);
    if (!pending) {
      pending = (async () => {
        const value = await loader();
        this.set(key, value);
        return value;
      })();
      this.inflight.set(key, pending);
      // Limpieza tanto en éxito como en error.
      pending.then(
        () => this.inflight.delete(key),
        () => this.inflight.delete(key)
      );
    }

    try {
      const value = await pending;
      const stored = this.entries.get(key);
      return { value, storedAt: stored?.storedAt ?? this.now(), status: "MISS" };
    } catch (err) {
      const stale = this.#peek(key);
      if (stale) {
        return { value: stale.value, storedAt: stale.storedAt, status: "STALE" };
      }
      throw err;
    }
  }
}
