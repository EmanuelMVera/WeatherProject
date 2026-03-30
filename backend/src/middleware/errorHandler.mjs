/**
 * Global error handler middleware
 * Handles all uncaught errors and returns appropriate responses
 */
const errorHandler = (err, req, res, next) => {
  // Log error with context
  console.error({
    timestamp: new Date().toISOString(),
    message: err.message,
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: err.stack,
  });

  // Determine status code
  const statusCode = err.status || err.statusCode || 500;

  // Rate limit errors
  if (statusCode === 429) {
    return res.status(429).json({
      error: "Too Many Requests",
      message: err.message || "Demasiadas solicitudes. Por favor, intenta más tarde.",
      retryAfter: res.get("Retry-After"),
    });
  }

  // Validation errors
  if (statusCode === 400) {
    return res.status(400).json({
      error: "Bad Request",
      message: err.message || "La solicitud no es válida.",
    });
  }

  // Not found errors
  if (statusCode === 404) {
    return res.status(404).json({
      error: "Not Found",
      message: err.message || "Recurso no encontrado.",
    });
  }

  // Generic server error
  res.status(statusCode).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Ocurrió un error interno del servidor.",
  });
};

export default errorHandler;
