const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const currentWeather = async (req, res) => {
  const { city } = req.query;

  try {
    const url = `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}&lang=es&current_fields=temp_c,condition:text,icon,feelslike_c,uv,wind_kph,humidity,pressure_in,localtime`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Error obteniendo la ubicación");
    }

    const data = await response.json();
    console.log(data);

    const dateOptions = { weekday: "long", day: "numeric", month: "long" };
    const formattedDate = new Date(
      data.location.localtime_epoch * 1000
    ).toLocaleDateString("es-ES", dateOptions);
    const capitalizedDate = formattedDate.split(" ").map(capitalize).join(" ");

    const currentWeather = {
      name: data.location.name,
      temperature: data.current.temp_c,
      feels_like: data.current.feelslike_c,
      precip_mm: data.current.precip_mm,
      wind_speed: data.current.wind_kph,
      humidity: data.current.humidity,
      uv: data.current.uv,
      date: capitalizedDate,
      time: new Date(data.location.localtime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      description: data.current.condition.text,
      icon: data.current.condition.icon,
    };

    res.json(currentWeather);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el pronóstico del clima" });
  }
};

export default currentWeather;
