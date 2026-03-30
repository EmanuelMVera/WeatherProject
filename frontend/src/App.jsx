import "./App.css";
import { Suspense, lazy } from "react";
import CitySearch from "./components/weather/CitySearch";
import WeatherInfo from "./components/weather/WeatherInfo";
import { useWeather } from "./hooks/useWeather";

const ErrorModal = lazy(() => import("./components/ErrorModal"));

const apiUrl = import.meta.env.VITE_API_URL;

function App() {
  const {
    weatherData,
    error,
    showErrorModal,
    loading,
    fetchWeatherData,
    handleCloseModal,
    handleRetry,
  } = useWeather(apiUrl);

  return (
    <div className="app-container">
      <div className="backdrop" />
      <div className="app-shell">
        <header className="app-header">
          <p className="eyebrow">Pronostico en tiempo real</p>
          <h1>Lugia</h1>
          <p className="subtext">
            Consulta clima actual, pronostico por horas y proximos dias con una
            vista simple y clara.
          </p>
        </header>

        <div className="citySearchWrapper">
          <CitySearch fetchWeatherData={fetchWeatherData} />
        </div>

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

      <Suspense fallback={null}>
        <ErrorModal show={showErrorModal} onClose={handleCloseModal}>
          <div style={{ textAlign: "center" }}>
            <p>{error}</p>
            <button
              onClick={handleRetry}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1.5rem",
                backgroundColor: "#ff8c00",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Reintentar
            </button>
          </div>
        </ErrorModal>
      </Suspense>
    </div>
  );
}

export default App;
