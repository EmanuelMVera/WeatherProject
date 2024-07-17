import express from "express";
import currentWeather from "./currentWeather.mjs";
import forecastWeather from "./forecastWeather.mjs";
import ipGeolocation from "./ipGeolocation.mjs";

const router = express.Router();

router.get("/currentWeather", currentWeather);
router.get("/forecastWeather", forecastWeather);
router.get("/ipGeolocation", ipGeolocation);

export default router;
