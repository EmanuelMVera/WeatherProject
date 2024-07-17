import express, { urlencoded, json } from "express";
import morgan from "morgan";
import cors from "cors";
import routes from "./routes/index.mjs";
import errorHandler from "./middleware/errorHandler.mjs";

const app = express();

app.use(urlencoded({ extended: true, limit: "10mb" }));
app.use(json({ limit: "10mb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use("/", routes);

app.use(errorHandler);

export default app;
