import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import { fetchWeatherWithLocation, hideErrorModal } from "./redux/actions";
import { selectCurrentWeather, selectForecastWeather } from "./redux/selectors";
import CurrentWeather from "./components/CurrentWeather";
import HourlyForecast from "./components/HourlyForecast";
import DailyForecast from "./components/DailyForecast";
import WeatherDetail from "./components/WeatherDetail";
import ErrorModal from "./components/ErrorModal";
import NavBar from "./components/Navbar";

function App() {
  const dispatch = useDispatch();
  const currentWeather = useSelector(selectCurrentWeather);
  const forecastWeather = useSelector(selectForecastWeather);
  const error = useSelector((state) => state.error);
  const showErrorModal = useSelector((state) => state.showErrorModal);

  useEffect(() => {
    const fetchWeather = () => {
      dispatch(fetchWeatherWithLocation());
    };

    fetchWeather();
  }, [dispatch]);

  const handleCloseModal = () => {
    dispatch(hideErrorModal());
  };

  return (
    <div className="app-container">
      <NavBar />
      {currentWeather || forecastWeather ? (
        <>
          <div className="block block2">
            <HourlyForecast />
          </div>
          <div className="block block3">
            <CurrentWeather />
          </div>
          <div className="block block4">
            <DailyForecast />
          </div>
          <div className="block block5">
            <WeatherDetail />
          </div>
        </>
      ) : (
        <>
          <div className="block block2"></div>
          <div className="block block3"></div>
          <div className="block block4"></div>
          <div className="block block5"></div>
        </>
      )}
      <ErrorModal show={showErrorModal} onClose={handleCloseModal}>
        <p>{error}</p>
      </ErrorModal>
    </div>
  );
}

export default App;
