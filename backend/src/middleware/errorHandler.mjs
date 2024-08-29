const errorHandler = (err, req, res, next) => {
  // Registro de errores
  console.error(err.message);

  // Responder con un mensaje genérico para producción
  res.status(err.status || 500).json({
    message: "Internal Server Error",
  });
};

export default errorHandler;
