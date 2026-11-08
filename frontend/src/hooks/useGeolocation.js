import { useCallback, useRef, useState } from "react";

export const GEO_MESSAGES = {
  unsupported: "Tu navegador no permite obtener la ubicación. Buscá tu ciudad por nombre.",
  denied:
    "No tenemos permiso para usar tu ubicación. Podés habilitarlo en la configuración del navegador o buscar tu ciudad.",
  unavailable: "No pudimos determinar tu ubicación. Probá de nuevo o buscá tu ciudad.",
  timeout: "La ubicación tardó demasiado. Probá de nuevo o buscá tu ciudad.",
  insecure: "La ubicación sólo funciona en conexiones seguras (HTTPS).",
};

/**
 * Pide la ubicación del navegador sólo cuando el usuario lo solicita.
 * Las coordenadas se redondean a 2 decimales (~1 km): alcanza para el
 * pronóstico y no expone la ubicación exacta.
 */
export function useGeolocation() {
  const [status, setStatus] = useState("idle"); // idle | locating | success | error
  const [errorKey, setErrorKey] = useState(null);
  const pendingRef = useRef(false);

  const locate = useCallback(() => {
    return new Promise((resolve) => {
      if (pendingRef.current) return resolve(null);
      if (typeof window !== "undefined" && window.isSecureContext === false) {
        setStatus("error");
        setErrorKey("insecure");
        return resolve(null);
      }
      if (!("geolocation" in navigator)) {
        setStatus("error");
        setErrorKey("unsupported");
        return resolve(null);
      }

      pendingRef.current = true;
      setStatus("locating");
      setErrorKey(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          pendingRef.current = false;
          setStatus("success");
          resolve({
            latitude: Math.round(position.coords.latitude * 100) / 100,
            longitude: Math.round(position.coords.longitude * 100) / 100,
          });
        },
        (error) => {
          pendingRef.current = false;
          setStatus("error");
          setErrorKey(
            error.code === 1 ? "denied" : error.code === 3 ? "timeout" : "unavailable"
          );
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 12000, maximumAge: 10 * 60 * 1000 }
      );
    });
  }, []);

  const dismissError = useCallback(() => {
    setErrorKey(null);
    setStatus("idle");
  }, []);

  return {
    status,
    errorKey,
    errorMessage: errorKey ? GEO_MESSAGES[errorKey] : null,
    locate,
    dismissError,
  };
}
