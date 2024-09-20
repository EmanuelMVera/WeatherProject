import dotenv from "dotenv";
dotenv.config();

async function getLocationByIP(req, res) {
  const clientIP = req.headers["x-forwarded-for"] || req.ip;

  // Definir una ubicación por defecto
  const defaultLocation = { latitude: "-34.6037", longitude: "-58.3816" }; // Ubicación de Buenos Aires

  // Verificamos si se pudo obtener la IP del cliente
  if (!clientIP) {
    return res.json(defaultLocation); // Devolver ubicación por defecto
  }

  const token = process.env.IP_API_KEY;
  const url = `https://ipinfo.io/${clientIP}/json?token=${token}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.json(defaultLocation); // Devolver ubicación por defecto si hay un error en la respuesta
    }

    const data = await response.json();
    if (data && data.loc) {
      const [latitude, longitude] = data.loc.split(",");
      return res.json({ latitude, longitude }); // Devolver ubicación obtenida
    }

    return res.json(defaultLocation); // Devolver ubicación por defecto si no se puede obtener una válida
  } catch (error) {
    console.error("Error obteniendo la ubicación por IP:", error);
    return res.json(defaultLocation); // Devolver ubicación por defecto en caso de error
  }
}

export default getLocationByIP;
