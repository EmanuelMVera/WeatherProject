import {
  GET_USER_LOCATION,
  SET_WEATHER_DATA,
  SET_ERROR,
  HIDE_ERROR_MODAL,
} from "../actions/actionTypes";

const initialState = {
  userLocation: null,
  cityName: "",
  weatherData: {
    currentWeather: null,
    forecastWeather: null,
  },
  error: null,
  showErrorModal: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_USER_LOCATION:
      return {
        ...state,
        userLocation: action.payload,
      };
    case SET_WEATHER_DATA:
      return {
        ...state,
        weatherData: action.payload,
      };
    case SET_ERROR:
      return {
        ...state,
        error: action.payload,
        showErrorModal: !!action.payload, // Muestra el modal si hay un error
      };
    case HIDE_ERROR_MODAL:
      return {
        ...state,
        showErrorModal: false,
        error: null,
      };
    default:
      return state;
  }
};

export default reducer;
