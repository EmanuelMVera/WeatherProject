/**
 * Parse error response body and extract meaningful error message
 */
export async function parseErrorBody(response) {
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    return data.error || data.message || "Error al obtener datos";
  } catch {
    return text || "Error al obtener datos";
  }
}

/**
 * Fetch with timeout support
 * @param {string} url
 * @param {number} timeoutMs - Timeout in milliseconds (default 10000)
 * @param {RequestInit} [options] - Extra fetch options (headers, method, etc.)
 * @returns {Promise<Response>}
 */
export async function fetchWithTimeout(url, timeoutMs = 10000, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error(`Timeout esperando respuesta de ${url} (${timeoutMs}ms)`);
    }
    throw err;
  }
}