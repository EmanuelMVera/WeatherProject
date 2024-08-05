import express, { urlencoded, json } from "express";
import cors from "cors";
import routes from "./routes/index.mjs";
import errorHandler from "./middleware/errorHandler.mjs";

const app = express();

app.use(urlencoded({ extended: true, limit: "10mb" }));
app.use(json({ limit: "10mb" }));

app.use(
  cors({
    origin: "https://weatherproject-yfkx.onrender.com",
    credentials: true,
  })
);

app.use("/", routes);
app.use(errorHandler);

export default app;
