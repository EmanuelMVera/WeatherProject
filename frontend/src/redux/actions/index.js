import {
  GET_USER_LOCATION,
  SET_WEATHER_DATA,
  SET_ERROR,
  HIDE_ERROR_MODAL,
} from "./actionTypes";
import getUserLocation from "../../utils/getUserLocation";

export function getLocation() {
  return async function (dispatch) {
    const userLocation = await getUserLocation();
    dispatch({
      type: GET_USER_LOCATION,
      payload: userLocation,
    });
  };
}

export const setWeatherData = (currentWeather, forecastWeather) => ({
  type: SET_WEATHER_DATA,
  payload: { currentWeather, forecastWeather },
});

export const setError = (error) => ({
  type: SET_ERROR,
  payload: error,
});

export const hideErrorModal = () => ({
  type: HIDE_ERROR_MODAL,
});

export const fetchWeatherData = (lat, lon, cityName) => async (dispatch) => {
  try {
    const urls = cityName
      ? [
          `http://localhost:3001/currentWeather?city=${cityName}`,
          `http://localhost:3001/forecastWeather?city=${cityName}`,
        ]
      : [
          `http://localhost:3001/currentWeather?lat=${lat}&lon=${lon}`,
          `http://localhost:3001/forecastWeather?lat=${lat}&lon=${lon}`,
        ];

    const responses = await Promise.all(urls.map((url) => fetch(url)));

    for (const response of responses) {
      if (!response.ok) {
        const errorText = await response.text();
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || "Error al obtener datos");
      }
    }

    const [currentWeatherData, forecastWeatherData] = await Promise.all(
      responses.map((response) => response.json())
    );

    dispatch(setWeatherData(currentWeatherData, forecastWeatherData));
    dispatch(setError(null)); // Limpiar el error en caso de éxito
  } catch (error) {
    dispatch(setError(error.message));
  }
};

// Nueva acción para obtener la ubicación por IP
export const fetchLocationByIP = () => async (dispatch) => {
  try {
    const response = await fetch(`http://localhost:3001/getLocationByIP`);
    if (!response.ok) {
      throw new Error("Failed to fetch location data");
    }

    const location = await response.json();
    return location; // Devuelve la ubicación para usarla en fetchWeatherData
  } catch (error) {
    dispatch(setError(error.message));
  }
};

// Acción modificada para obtener datos del clima con manejo de ubicación por IP
export const fetchWeatherWithLocation = (cityName) => async (dispatch) => {
  const userLocation = await dispatch(getLocation());

  if (!userLocation) {
    const location = await dispatch(fetchLocationByIP());
    const { latitude, longitude } = location;
    await dispatch(fetchWeatherData(latitude, longitude, null)); // Sin nombre de ciudad
  } else {
    await dispatch(
      fetchWeatherData(userLocation.latitude, userLocation.longitude, cityName)
    );
  }
};
