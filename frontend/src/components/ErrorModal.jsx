import React from "react";
import PropTypes from "prop-types";
import styles from "./styles/modal.module.css";

const ErrorModal = ({ show, onClose, children }) => {
  if (!show) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <div className={styles.modalContent}>{children}</div>
      </div>
    </div>
  );
};

ErrorModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default ErrorModal;
