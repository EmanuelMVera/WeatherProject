import cacheManager from "../lib/cacheManager.mjs";

export const cacheMiddleware = (cacheKeyFn, ttl) => (handler) => async (req, res, next) => {
  try {
    const cacheKey = cacheKeyFn(req);
    const cachedData = cacheManager.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = (data) => {
      cacheManager.set(cacheKey, data, ttl);
      return originalJson.call(res, data);
    };

    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};