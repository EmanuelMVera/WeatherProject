import { config } from "dotenv";

// Intenta cargar .env si existe, pero no rompe si no está
config();

// Validar variables de entorno requeridas
const requiredVars = [
  "PORT",
  "ALLOWED_ORIGINS",
  "OPENWEATHER_API_KEY",
  "WEATHER_API_KEY",
  "IP_API_KEY",
  "DEFAULT_CITY",
];

const missingVars = requiredVars.filter((varName) => {
  const value = process.env[varName];
  return !value || value.trim() === "";
});

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}. Please check your environment configuration.`
  );
}

export default process.env;