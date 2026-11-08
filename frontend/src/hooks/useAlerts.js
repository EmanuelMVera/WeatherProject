import { useEffect, useState } from "react";
import { fetchAlerts } from "../services/weatherClient.js";

/** Las alertas integradas son las del SMN: sólo cubren Argentina. */
export function isCoveredBySmn(timeZone) {
  return typeof timeZone === "string" && timeZone.startsWith("America/Argentina/");
}

/**
 * @param {import("../domain/location.js").Place | null} place
 * @param {string|undefined} timeZone  zona IANA devuelta por el pronóstico
 * @param {number} refreshKey          cambia cuando se actualiza el pronóstico
 * @returns {{ status: "idle"|"loading"|"success"|"error"|"not-covered", data: object|null, error: Error|null }}
 */
export function useAlerts(place, timeZone, refreshKey) {
  const [state, setState] = useState({ key: null, status: "idle", data: null, error: null });
  const placeId = place?.id ?? null;
  const latitude = place?.latitude;
  const longitude = place?.longitude;
  const covered = isCoveredBySmn(timeZone);
  const key = placeId && timeZone ? `${placeId}|${refreshKey}` : null;

  useEffect(() => {
    if (!key || !covered) return undefined;
    const controller = new AbortController();
    setState((prev) => ({ key, status: "loading", data: prev.key?.split("|")[0] === placeId ? prev.data : null, error: null }));
    fetchAlerts({ latitude, longitude }, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setState({ key, status: "success", data, error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted && error?.name !== "AbortError") {
          setState({ key, status: "error", data: null, error });
        }
      });
    return () => controller.abort();
  }, [key, covered, placeId, latitude, longitude]);

  if (!key) return { status: "idle", data: null, error: null };
  if (!covered) return { status: "not-covered", data: null, error: null };
  if (state.key !== key) return { status: "loading", data: null, error: null };
  return { status: state.status, data: state.data, error: state.error };
}
