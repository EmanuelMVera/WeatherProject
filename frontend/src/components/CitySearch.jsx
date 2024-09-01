import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import Autosuggest from "react-autosuggest";
import styles from "./styles/citySearch.module.css";
import allDivisiones from "../utils/getDivisiones";

const CitySearch = ({ fetchWeatherData }) => {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);

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
        fetchWeatherData(city);
        setCity("");
      }
    },
    [city, fetchWeatherData]
  );

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
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
          className: styles.input,
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

CitySearch.propTypes = {
  fetchWeatherData: PropTypes.func.isRequired,
};

export default CitySearch;
