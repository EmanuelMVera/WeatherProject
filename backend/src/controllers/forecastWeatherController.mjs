import { getForecastData } from "../services/weatherService.mjs";
import { validateCity } from "../utils/validators.mjs";

export const getForecastWeather = async (req, res) => {
  const { city } = req.query;

  const validation = validateCity(city);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const forecastData = await getForecastData(validation.city);
    res.json(forecastData);
  } catch (error) {
    console.error(`Error fetching forecast for ${validation.city}:`, error.message);
    res.status(404).json({ error: "Ciudad no encontrada" });
  }
};