import express, { urlencoded, json } from "express";
import morgan from "morgan";
import cors from "cors";
import routes from "./routes/index.mjs";
import errorHandler from "./middleware/errorHandler.mjs"; // Optional

const app = express();

app.use(urlencoded({ extended: true, limit: "100mb" }));
app.use(json({ limit: "100mb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
); // Adjust as needed
app.use("/", routes);

app.use(errorHandler); // Optional

export default app;
