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

function isLoopback(ip) {
  if (!ip) return true;
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "::ffff:127.0.0.1" ||
    ip.startsWith("127.")
  );
}

async function ipGeolocation(req, res) {
  const clientIp = getClientIp(req);
  const defaultCity = process.env.DEFAULT_CITY || "Buenos Aires";

  if (isLoopback(clientIp)) {
    return res.json({ cityName: defaultCity });
  }

  const token = process.env.IP_API_KEY;
  const path = `https://ipinfo.io/${encodeURIComponent(clientIp)}/json`;
  const url = token ? `${path}?token=${token}` : path;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("ipinfo status:", response.status, await response.text());
      return res.status(502).json({ error: "Error obteniendo la ubicación" });
    }
    const data = await response.json();

    if (!data.city) {
      return res.json({ cityName: defaultCity });
    }

    res.json({ cityName: data.city });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default ipGeolocation;
