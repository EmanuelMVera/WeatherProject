// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");
// const dotenv = require("dotenv");
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
// const IP_API_KEY = process.env.IP_API_KEY;

// app.get("/api/weather/current", async (req, res) => {
//   const { city } = req.query;
//   try {
//     const response = await axios.get(
//       `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${city}&lang=es&current_fields=temp_c,condition:text,icon`
//     );
//     res.json(response.data);
//   } catch (error) {
//     res.status(error.response?.status || 500).json({ error: error.message });
//   }
// });

// app.get("/api/weather/forecast", async (req, res) => {
//   const { city } = req.query;
//   try {
//     const response = await axios.get(
//       `http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${city}&lang=es&days=14&hour_fields=time,temp_c`
//     );
//     res.json(response.data);
//   } catch (error) {
//     res.status(error.response?.status || 500).json({ error: error.message });
//   }
// });

// app.get("/api/ip-geolocation", async (req, res) => {
//   try {
//     const response = await axios.get(
//       `https://ipinfo.io/json?token=${IP_API_KEY}`
//     );
//     res.json(response.data);
//   } catch (error) {
//     res.status(error.response?.status || 500).json({ error: error.message });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
