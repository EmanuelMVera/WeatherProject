import React from "react";
import styles from "./header.module.css";

const Header = ({ location, date }) => {
  return (
    <div className={styles.header}>
      <div className={styles.location}>{location}</div>
      <div className={styles.date}>{date}</div>
    </div>
  );
};

export default Header;
