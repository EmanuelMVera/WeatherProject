import {
  ensureOk,
  fetchWithTimeout,
  friendlyMessage,
  HttpError,
  withRetry,
} from "../utils/http.js";

/**
 * Cliente de la API CountryStateCity (https://countrystatecity.in/).
 * Documentacion: https://documenter.getpostman.com/view/1134062/T1LJjU52
 *
 * NOTA DE SEGURIDAD: la API Key viaja al cliente y queda visible en el bundle.
 * Si necesitas ocultarla, mové estas llamadas a un proxy en el backend Express.
 */

const CSC_BASE_URL = "https://api.countrystatecity.in/v1";

// Poné tu API Key en frontend/.env -> VITE_CSC_API_KEY=tu_api_key
const CSC_API_KEY = import.meta.env.VITE_CSC_API_KEY;

const REQUEST_TIMEOUT_MS = 12000;

/**
 * @returns {boolean} true si hay una API Key configurada.
 */
export function isLocationApiConfigured() {
  return Boolean(CSC_API_KEY);
}

/**
 * Fetch interno: agrega el header X-CSCAPI-KEY, valida la respuesta
 * y devuelve el JSON parseado.
 * @param {string} path - Ruta relativa a CSC_BASE_URL (ej: "/countries").
 * @returns {Promise<any>}
 */
async function cscFetch(path) {
  if (!CSC_API_KEY) {
    throw new Error(
      "Falta configurar la API Key. Definí VITE_CSC_API_KEY en frontend/.env"
    );
  }

  try {
    return await withRetry(
      async () => {
        const response = await fetchWithTimeout(
          `${CSC_BASE_URL}${path}`,
          REQUEST_TIMEOUT_MS,
          { headers: { "X-CSCAPI-KEY": CSC_API_KEY } }
        );

        if (response.status === 401) {
          throw new HttpError("API Key de ubicaciones inválida o sin permisos.", {
            status: 401,
          });
        }
        if (response.status === 429) {
          throw new HttpError(
            "Demasiadas solicitudes a la API de ubicaciones. Esperá un momento.",
            { status: 429, retryable: false }
          );
        }
        await ensureOk(response);
        return response.json();
      },
      { retries: 2, baseDelayMs: 1000 }
    );
  } catch (err) {
    throw new Error(friendlyMessage(err));
  }
}

/**
 * Ordena una lista de objetos por su propiedad `name` (locale-aware).
 * @template {{ name: string }} T
 * @param {T[]} list
 * @returns {T[]}
 */
function sortByName(list) {
  return [...list].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Carga todos los países.
 * @returns {Promise<Array<{ id: number, name: string, iso2: string }>>}
 */
export async function fetchCountries() {
  const data = await cscFetch("/countries");
  return sortByName(
    data.map(({ id, name, iso2 }) => ({ id, name, iso2 }))
  );
}

/**
 * Carga los estados/provincias de un país.
 * @param {string} countryIso2 - Código ISO2 del país (ej: "AR").
 * @returns {Promise<Array<{ id: number, name: string, iso2: string }>>}
 */
export async function fetchStates(countryIso2) {
  const data = await cscFetch(`/countries/${countryIso2}/states`);
  return sortByName(
    data.map(({ id, name, iso2 }) => ({ id, name, iso2 }))
  );
}

/**
 * Carga las ciudades de un estado/provincia, conservando lat/lon.
 * @param {string} countryIso2 - Código ISO2 del país.
 * @param {string} stateIso2 - Código ISO2 del estado.
 * @returns {Promise<Array<{ id: number, name: string, latitude: string, longitude: string }>>}
 */
export async function fetchCities(countryIso2, stateIso2) {
  const data = await cscFetch(
    `/countries/${countryIso2}/states/${stateIso2}/cities`
  );
  return sortByName(
    data.map(({ id, name, latitude, longitude }) => ({
      id,
      name,
      latitude,
      longitude,
    }))
  );
}
