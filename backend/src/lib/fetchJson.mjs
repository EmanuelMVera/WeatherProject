/**
 * GET request that throws if !response.ok, then parses JSON.
 */
export async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Error obteniendo la ubicación");
  }
  return response.json();
}
