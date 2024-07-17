import "dotenv/config"; // Asegúrate de que dotenv cargue las variables de entorno
import app from "./src/app.mjs";

const PORT = process.env.PORT || 3001; // Usa el valor de PORT de las variables de entorno o un valor por defecto
const NODE_ENV = process.env.NODE_ENV || "development"; // Define un valor por defecto

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
});
