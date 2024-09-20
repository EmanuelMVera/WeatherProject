import { useState, useCallback } from "react";
import Autosuggest from "react-autosuggest";
import styles from "./styles/citySearch.module.css";
import allDivisiones from "../utils/getDivisiones";
import { useDispatch } from "react-redux";
import { fetchWeatherData } from "../redux/actions";

const CitySearch = () => {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const dispatch = useDispatch();

  const handleSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : allDivisiones.filter(
          (city) => city.toLowerCase().slice(0, inputLength) === inputValue
        );
  };

  const getSuggestionValue = (suggestion) => suggestion;

  const renderSuggestion = (suggestion, { isHighlighted }) => (
    <div
      className={`${styles.suggestion} ${
        isHighlighted ? styles["suggestion--highlighted"] : ""
      }`}
    >
      {suggestion}
    </div>
  );

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (city.trim()) {
        dispatch(fetchWeatherData(null, null, city)); // Despacha la acción para buscar el clima
        setCity("");
      }
    },
    [city, dispatch]
  );

  return (
    <form onSubmit={handleSubmit} className={styles["city-search-container"]}>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
        onSuggestionsClearRequested={handleSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={{
          value: city,
          onChange: (e, { newValue }) => setCity(newValue),
          placeholder: "Ciudad...",
          className: styles.input, // Usa tus propios estilos de input
        }}
        theme={{
          suggestionsContainer: styles["suggestions-container"],
          suggestionsContainerOpen: styles["suggestions-container--open"],
          suggestion: styles.suggestion,
          suggestionHighlighted: styles["suggestion--highlighted"],
        }}
      />
    </form>
  );
};

export default CitySearch;
