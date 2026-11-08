/**
 * Log de acceso compacto. Registra sólo método, ruta (sin query string),
 * estado y duración: ni IPs ni coordenadas del usuario.
 */
export function requestLogger({ logger = console } = {}) {
  return (req, res, next) => {
    const start = process.hrtime.bigint();
    res.on("finish", () => {
      const ms = Number(process.hrtime.bigint() - start) / 1e6;
      logger.info?.(`${req.method} ${req.originalUrl.split("?")[0]} ${res.statusCode} ${ms.toFixed(0)}ms`);
    });
    next();
  };
}
