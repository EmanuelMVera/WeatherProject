export const selectUserLocation = (state) => state.userLocation;
export const selectWeatherData = (state) => state.weatherData;
export const selectCurrentWeather = (state) => state.weatherData.currentWeather;
export const selectForecastWeather = (state) =>
  state.weatherData.forecastWeather;
export const selectHourlyForecast = (state) =>
  state.weatherData.forecastWeather.hourlyForecast;
export const selectDailyForecast = (state) =>
  state.weatherData.forecastWeather.dailyForecast;
export const selectError = (state) => state.error;
export const selectShowErrorModal = (state) => state.showErrorModal;
