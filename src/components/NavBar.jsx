import React, { useState } from "react";
import CitySearch from "./CitySearch";
import styles from "./styles/navBar.module.css";

const Navbar = ({ currentWeather, setDatos, location }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.menuToggle} onClick={handleMenuToggle}>
        +
      </div>
      {currentWeather ? (
        <div className={styles.currentCity}>{currentWeather.location.name}</div>
      ) : (
        <div></div>
      )}
      <div className={`${styles.searchForm} ${isMenuOpen ? styles.open : ""}`}>
        <CitySearch setDatos={setDatos} location={location} />
      </div>
    </nav>
  );
};

export default Navbar;
