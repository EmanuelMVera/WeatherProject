import React from "react";
import styles from "./ErrorBoundary.module.css";

/**
 * Captura errores de renderizado de su árbol de hijos y muestra un fallback
 * amigable en lugar de dejar la pantalla en blanco.
 *
 * Props:
 * - children
 * - fallback?: ReactNode | ({ error, reset }) => ReactNode
 * - onReset?: () => void
 * - resetKeys?: any[]  Si cambia alguno de estos valores, el error se limpia solo.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Punto único para enchufar logging/telemetría más adelante.
    console.error("[ErrorBoundary]", error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (!this.state.error) return;

    const { resetKeys } = this.props;
    const prevKeys = prevProps.resetKeys;
    if (!Array.isArray(resetKeys) || !Array.isArray(prevKeys)) return;

    const changed =
      resetKeys.length !== prevKeys.length ||
      resetKeys.some((key, i) => !Object.is(key, prevKeys[i]));

    if (changed) this.reset();
  }

  reset() {
    this.props.onReset?.();
    this.setState({ error: null });
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const { fallback } = this.props;

    if (typeof fallback === "function") {
      return fallback({ error, reset: this.reset });
    }
    if (fallback !== undefined) {
      return fallback;
    }

    return (
      <div className={styles.card} role="alert">
        <p className={styles.title}>Algo salió mal al mostrar esta sección</p>
        <p className={styles.detail}>
          {error?.message || "Ocurrió un error inesperado."}
        </p>
        <button type="button" className={styles.button} onClick={this.reset}>
          Reintentar
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
