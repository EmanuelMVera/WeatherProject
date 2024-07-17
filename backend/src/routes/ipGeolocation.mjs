import fetch from "node-fetch";

const ipGeolocation = (req, res) => {
  const url = `https://ipinfo.io/json?token=${process.env.IP_API_KEY}`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error obteniendo la ubicación");
      }
      return response.json();
    })
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    });
};

export default ipGeolocation;
