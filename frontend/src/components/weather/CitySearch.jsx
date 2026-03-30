import React, { useState, useCallback } from "react";
import styles from "./CitySearch.module.css";
import { getFilteredCitySuggestions } from "../../data/citySuggestions";

const CitySearch = ({ fetchWeatherData }) => {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = useCallback((event) => {
    const value = event.target.value;
    setCity(value);

    if (value.trim().length > 0) {
      const filtered = getFilteredCitySuggestions(value, 6);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  const handleSuggestionClick = useCallback(
    (suggestion) => {
      setCity(suggestion);
      setShowSuggestions(false);
      setSuggestions([]);
      fetchWeatherData(suggestion);
    },
    [fetchWeatherData]
  );

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (city.trim()) {
        fetchWeatherData(city);
        setCity("");
        setSuggestions([]);
        setShowSuggestions(false);
      }
    },
    [city, fetchWeatherData]
  );

  return (
    <section className={styles.citySearchContainer}>
      <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={city}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Buscar ciudad (ej: Madrid, Córdoba, Lima)"
            className={styles.input}
            aria-label="Buscar ciudad"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className={styles.suggestionsList} role="listbox">
              {suggestions.map((suggestion, index) => (
                <li
                  key={`${suggestion}-${index}`}
                  className={styles.suggestionItem}
                  onMouseDown={() => handleSuggestionClick(suggestion)}
                  role="option"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" className={styles.button}>
          Buscar
        </button>
      </form>
    </section>
  );
};

export default React.memo(CitySearch);
