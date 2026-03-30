import express, { urlencoded, json } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import routes from "./routes/index.mjs";
import errorHandler from "./middleware/errorHandler.mjs";
import { RATE_LIMIT_GLOBAL, RATE_LIMIT_WEATHER, RATE_LIMIT_IP } from "./config/constants.mjs";

const app = express();
app.set("trust proxy", 1);
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0) || [];

// Middleware de seguridad
app.use(helmet());

// Logging middleware
app.use(morgan("combined"));

// Compresión de respuestas
app.use(compression());

// Middleware de parseo
app.use(urlencoded({ extended: true, limit: "10mb" }));
app.use(json({ limit: "10mb" }));

// Configuración de CORS
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without origin header (local tools, curl, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in the allowed list
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      // Log rejected origins for debugging
      console.warn(`CORS blocked for origin: ${origin}. Allowed: ${ALLOWED_ORIGINS.join(", ")}`);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Length", "X-Kuma-Revision"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Rate limiting configuration
const globalLimiter = rateLimit({
  ...RATE_LIMIT_GLOBAL,
  message: "Demasiadas solicitudes desde esta IP, por favor intenta más tarde.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const weatherLimiter = rateLimit({
  ...RATE_LIMIT_WEATHER,
  message: "Demasiadas solicitudes de clima, por favor intenta más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

const ipLimiter = rateLimit({
  ...RATE_LIMIT_IP,
  message: "Demasiadas solicitudes de ubicación, por favor intenta más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

//Apply global rate limiter
app.use(globalLimiter);

//Apply specific rate limiters to weather routes
app.use("/currentWeather", weatherLimiter);
app.use("/forecastWeather", weatherLimiter);
app.use("/ipGeolocation", ipLimiter);


// Rutas de la aplicación
app.use("/", routes);

// Rutas no encontradas (404) antes del manejador global de errores
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Manejo de errores (debe ir al final)
app.use(errorHandler);

export default app;
