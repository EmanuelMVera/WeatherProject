import { getCurrentWeatherData } from "../services/weatherService.mjs";
import { validateCity } from "../utils/validators.mjs";

export const getCurrentWeather = async (req, res) => {
  const { city } = req.query;

  const validation = validateCity(city);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const currentWeatherData = await getCurrentWeatherData(validation.city);
    res.json(currentWeatherData);
  } catch (error) {
    console.error(`Error fetching current weather for ${validation.city}:`, error.message);
    res.status(404).json({ error: "Ciudad no encontrada" });
  }
};