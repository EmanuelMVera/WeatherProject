import "dotenv/config";
import app from "./src/app.mjs";

// const PORT = process.env.PORT || 3001;
const PORT = 3001;
const NODE_ENV = process.env.NODE_ENV || "development"; // valor por defecto

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
});
