import { AppError } from "../errors.mjs";

/**
 * Manejador global de errores. Responde siempre con
 * `{ error: { code, message } }` y nunca expone detalles internos
 * (stack, URLs de proveedores) en producción.
 *
 * @param {{ isProduction: boolean, logger?: Console }} opts
 */
export function createErrorHandler({ isProduction, logger = console }) {
  // eslint-disable-next-line no-unused-vars -- Express identifica el handler por su aridad (4).
  return function errorHandler(err, req, res, next) {
    const known = err instanceof AppError;
    const status = known ? err.status : 500;

    const logPayload = {
      level: status >= 500 ? "error" : "warn",
      code: known ? err.code : "INTERNAL_ERROR",
      status,
      method: req.method,
      path: req.originalUrl.split("?")[0], // sin query string: no registramos coordenadas del usuario
      provider: err.provider,
      upstreamStatus: err.upstreamStatus,
      detail: err.detail,
      message: err.message,
    };
    if (!isProduction && !known) logPayload.stack = err.stack;
    (status >= 500 ? logger.error : logger.warn).call(logger, JSON.stringify(logPayload));

    if (res.headersSent) return;

    res.status(status).json({
      error: {
        code: known ? err.code : "INTERNAL_ERROR",
        message: known
          ? err.message
          : isProduction
            ? "Ocurrió un error inesperado en el servidor."
            : err.message,
      },
    });
  };
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Recurso no encontrado." } });
}
