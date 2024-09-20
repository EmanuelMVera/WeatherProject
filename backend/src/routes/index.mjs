import express from "express";
import currentWeather from "./currentWeather.mjs";
import forecastWeather from "./forecastWeather.mjs";
import getLocationByIP from "./getLocationByIP.mjs";

const router = express.Router();

router.get("/currentWeather", currentWeather);
router.get("/forecastWeather", forecastWeather);
router.get("/getLocationByIP", getLocationByIP);

export default router;
