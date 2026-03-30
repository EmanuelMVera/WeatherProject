/**
 * GET request with retry logic and exponential backoff
 * Throws if !response.ok after all retries, then parses JSON.
 * @param {string} url
 * @param {number} maxRetries - Maximum number of retries (default 3)
 * @param {number} baseDelay - Base delay in milliseconds (default 1000)
 * @returns {Promise<any>}
 */
export async function fetchJson(url, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      
      if (response.ok) {
        return response.json();
      }

      // Don't retry 4xx errors unless it's a timeout/server error
      if (response.status >= 400 && response.status < 500) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      lastError = new Error(`HTTP ${response.status}`);
    } catch (err) {
      lastError = err;

      // If it's the last attempt, throw immediately
      if (attempt === maxRetries) {
        throw new Error(`Error obteniendo datos (${url}): ${lastError.message}`);
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(
        `Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`,
        lastError.message
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
