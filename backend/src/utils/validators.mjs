export const validateCity = (city) => {
  if (!city || typeof city !== 'string') {
    return { valid: false, error: 'Ciudad no proporcionada o inválida' };
  }
  const trimmed = city.trim();
  if (trimmed.length === 0 || trimmed.length > 100) {
    return { valid: false, error: 'Nombre de ciudad demasiado largo o vacío' };
  }
  // Basic sanitization: allow only letters, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(trimmed)) {
    return { valid: false, error: 'Nombre de ciudad contiene caracteres inválidos' };
  }
  return { valid: true, city: trimmed };
};