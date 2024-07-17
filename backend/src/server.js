// const express = require("express");
// const cors = require("cors");
// const fetch = require("node-fetch");
// require("dotenv").config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// app.get("/api/currentWeather", async (req, res) => {
//   const { city } = req.query;
//   const apiKey = process.env.WEATHER_API_KEY;

//   try {
//     const response = await fetch(
//       `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&lang=es`
//     );
//     const data = await response.json();
//     res.json(data);
//   } catch (error) {
//     console.error("Error fetching weather data:", error);
//     res.status(500).json({ error: "Error fetching weather data" });
//   }
// });

// app.get("/api/weatherForecasts", async (req, res) => {
//   const { city } = req.query;
//   const apiKey = process.env.WEATHER_API_KEY;

//   try {
//     const response = await fetch(
//       `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&lang=es&days=14`
//     );
//     const data = await response.json();
//     res.json(data);
//   } catch (error) {
//     console.error("Error fetching weather data:", error);
//     res.status(500).json({ error: "Error fetching weather data" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
