import "./App.css";
import { Suspense, lazy } from "react";
import LocationSearch from "./components/weather/LocationSearch";
import WeatherInfo from "./components/weather/WeatherInfo";
import ErrorBoundary from "./components/ErrorBoundary";
import { useWeather } from "./hooks/useWeather";

const ErrorModal = lazy(() => import("./components/ErrorModal"));

const apiUrl = import.meta.env.VITE_API_URL;

const weatherInfoFallback = (
  <p className="status-message" role="alert">
    No pudimos mostrar este pronóstico. Probá con otra búsqueda.
  </p>
);

function App() {
  const {
    weatherData,
    error,
    showErrorModal,
    loading,
    wakingUp,
    fetchWeatherData,
    handleCloseModal,
    handleRetry,
  } = useWeather(apiUrl);

  const current = weatherData?.current ?? null;
  const hourlyForecast = weatherData?.forecast?.hourlyForecast ?? [];
  const dailyForecast = weatherData?.forecast?.dailyForecast ?? [];
  const hasWeather = Boolean(current);

  return (
    <div className="app-container">
      <div className="backdrop" />
      <div className="app-shell">
        <header className="app-header">
          <p className="eyebrow">Pronostico en tiempo real</p>
          <h1>Buen Clima</h1>
          <p className="subtext">
            Consulta clima actual, pronostico por horas y proximos dias con una
            vista simple y clara.
          </p>
        </header>

        <div className="citySearchWrapper">
          <LocationSearch onSelectPlace={fetchWeatherData} />
        </div>

        {loading && (
          <p
            className={
              wakingUp
                ? "status-message status-message--waking"
                : "status-message"
            }
            role="status"
            aria-live="polite"
          >
            {wakingUp
              ? "El servidor gratuito esta despertando, esto puede tomar hasta un minuto..."
              : "Cargando datos meteorologicos..."}
          </p>
        )}

        {!loading && hasWeather && (
          <ErrorBoundary
            fallback={weatherInfoFallback}
            resetKeys={[weatherData]}
          >
            <WeatherInfo
              currentWeather={current}
              hourlyForecast={hourlyForecast}
              dailyForecast={dailyForecast}
            />
          </ErrorBoundary>
        )}

        {!loading && !hasWeather && (
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
