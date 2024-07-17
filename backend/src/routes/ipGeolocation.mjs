async function ipGeolocation(req, res) {
  const url = `https://ipinfo.io/json?token=${process.env.IP_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error obteniendo la ubicación");
    }
    const data = await response.json();

    res.json({ cityName: data.city });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default ipGeolocation;
