import { config } from "dotenv";

const result = config();
if (result.error) {
  throw result.error;
}

// Validar variables de entorno requeridas
const requiredVars = ["PORT", "ALLOWED_ORIGINS", "OPENWEATHER_API_KEY", "WEATHER_API_KEY"];
const missingVars = requiredVars.filter((varName) => {
  const value = process.env[varName];
  return !value || value.trim() === "";
});

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}. Please check your .env file.`
  );
}

export default result.parsed;
