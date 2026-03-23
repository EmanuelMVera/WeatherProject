import "./App.css";
import CitySearch from "./components/weather/CitySearch";
import WeatherInfo from "./components/weather/WeatherInfo";
import ErrorModal from "./components/ErrorModal";
import { useWeather } from "./hooks/useWeather";

const apiUrl = import.meta.env.VITE_API_URL;

function App() {
  const {
    weatherData,
    error,
    showErrorModal,
    loading,
    fetchWeatherData,
    handleCloseModal,
  } = useWeather(apiUrl);

  return (
    <div className="app-container">
      <div className="backdrop" />
      <div className="app-shell">
        <header className="app-header">
          <p className="eyebrow">Pronostico en tiempo real</p>
          <h1>WeatherProject</h1>
          <p className="subtext">
            Consulta clima actual, pronostico por horas y proximos dias con una
            vista simple y clara.
          </p>
        </header>

        <CitySearch fetchWeatherData={fetchWeatherData} />

        {loading && (
          <p className="status-message">Cargando datos meteorologicos...</p>
        )}

        {!loading && weatherData && (
          <WeatherInfo
            currentWeather={weatherData.current}
            hourlyForecast={weatherData.forecast.hourlyForecast}
            dailyForecast={weatherData.forecast.dailyForecast}
          />
        )}

        {!loading && !weatherData && (
          <p className="status-message">Busca una ciudad para ver el clima.</p>
        )}
      </div>

      <ErrorModal show={showErrorModal} onClose={handleCloseModal}>
        <p>{error}</p>
      </ErrorModal>
    </div>
  );
}

export default App;
