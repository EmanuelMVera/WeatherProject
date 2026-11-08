/**
 * Punto dentro de polígono (ray casting). Coordenadas en [lat, lon].
 * Suficiente para áreas de alerta (no cruzan el antimeridiano).
 * @param {number} lat
 * @param {number} lon
 * @param {number[][]} polygon
 */
export function isPointInPolygon(lat, lon, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [latI, lonI] = polygon[i];
    const [latJ, lonJ] = polygon[j];
    const crosses =
      lonI > lon !== lonJ > lon &&
      lat < ((latJ - latI) * (lon - lonI)) / (lonJ - lonI) + latI;
    if (crosses) inside = !inside;
  }
  return inside;
}
