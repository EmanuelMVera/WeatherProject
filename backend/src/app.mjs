import express, { urlencoded, json } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import routes from "./routes/index.mjs";
import errorHandler from "./middleware/errorHandler.mjs";

const app = express();
app.set("trust proxy", 1);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;

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
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Length", "X-Kuma-Revision"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Rutas de la aplicación
app.use("/", routes);

// Rutas no encontradas (404) antes del manejador global de errores
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Manejo de errores (debe ir al final)
app.use(errorHandler);

export default app;
