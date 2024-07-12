const apiToken = import.meta.env.VITE_API_KEY_IP;

const fetchIPGeolocation = async () => {
  const url = `https://ipinfo.io/json?token=${apiToken}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error obteniendo la ubicación");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export default fetchIPGeolocation;
