/**
 * Errores de dominio con un código estable que el frontend puede interpretar.
 * `message` está pensado para mostrarse al usuario (en español).
 */
export class AppError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {number} status
   * @param {{ cause?: unknown }} [opts]
   */
  constructor(code, message, status, { cause } = {}) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    if (cause) this.cause = cause;
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super("INVALID_REQUEST", message, 400);
    this.name = "ValidationError";
  }
}

/** El proveedor respondió con un error o no se pudo contactar. */
export class UpstreamError extends AppError {
  constructor(provider, { status, cause } = {}) {
    super(
      "UPSTREAM_UNAVAILABLE",
      "El servicio meteorológico no está disponible en este momento. Probá de nuevo en unos minutos.",
      502,
      { cause }
    );
    this.name = "UpstreamError";
    this.provider = provider;
    this.upstreamStatus = status;
  }
}

export class UpstreamTimeoutError extends AppError {
  constructor(provider) {
    super(
      "UPSTREAM_TIMEOUT",
      "El servicio meteorológico tardó demasiado en responder. Probá de nuevo en unos segundos.",
      504
    );
    this.name = "UpstreamTimeoutError";
    this.provider = provider;
  }
}

/** El proveedor respondió, pero los datos no tienen el formato esperado. */
export class UpstreamDataError extends AppError {
  constructor(provider, detail) {
    super(
      "UPSTREAM_INVALID_DATA",
      "Recibimos datos meteorológicos incompletos. Probá de nuevo en unos minutos.",
      502
    );
    this.name = "UpstreamDataError";
    this.provider = provider;
    this.detail = detail;
  }
}
