function getUserLocation() {
  return new Promise((resolve) => {
    // Verificar si el navegador soporta la API de geolocalización
    if (navigator.geolocation) {
      // Intentar obtener la ubicación
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Si se concede el permiso, devolver las coordenadas
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        () => {
          // Si no se concede el permiso o hay algún error, devolver null
          resolve(null);
        }
      );
    } else {
      // Si el navegador no soporta geolocalización, devolver null
      resolve(null);
    }
  });
}

export default getUserLocation;
