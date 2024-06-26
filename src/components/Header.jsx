import React from "react";
import styles from "./styles/header.module.css";

const Header = ({ location, date }) => {
  return (
    <div className={styles.header}>
      <div>{location}</div>
      <div>{date}</div>
    </div>
  );
};

export default Header;
