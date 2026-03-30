import { getIpGeolocation } from "../controllers/ipGeolocationController.mjs";
import { cacheMiddleware } from "../middleware/cacheMiddleware.mjs";
import { CACHE_TTL_IP } from "../config/constants.mjs";

/**
 * IP del cliente (requiere trust proxy en Express si hay balanceador / Vite).
 */
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const raw = req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || "";
  return String(raw).replace(/^::ffff:/, "");
}

const ipGeolocation = cacheMiddleware(
  (req) => `geolocation_${getClientIp(req)}`,
  CACHE_TTL_IP
)(getIpGeolocation);

export default ipGeolocation;
