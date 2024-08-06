import express, { urlencoded, json } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import routes from "./routes/index.mjs";
import errorHandler from "./middleware/errorHandler.mjs";

const app = express();

// Middleware de seguridad
app.use(helmet());

// Compresión de respuestas
app.use(compression());

// Middleware de parseo
app.use(urlencoded({ extended: true, limit: "10mb" }));
app.use(json({ limit: "10mb" }));

// Configuración de CORS
app.use(
  cors({
    origin: "https://weatherproject-yfkx.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Length", "X-Kuma-Revision"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Rutas de la aplicación
app.use("/", routes);

// Manejo de errores
app.use(errorHandler);

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
