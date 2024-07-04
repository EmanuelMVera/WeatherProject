const apiKey = import.meta.env.VITE_API_KEY;
const apiKey2 = import.meta.env.VITE_API_KEY2;

export const fetchHourlyForecast = async (city) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    const response2 = await fetch(
      `http://api.weatherapi.com/v1/forecast.json?key=${apiKey2}&q=${city}&days=1&hour_fields=time,temp_c`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error fetching weather data: ${errorData.message} (status: ${response.status})`
      );
    }

    const data2 = await response2.json();
    return data2;

    const data = await response.json();
    // const now = new Date();

    // return data.list
    //   .filter((item) => new Date(item.dt_txt) > now)
    //   .slice(0, 6)
    //   .map((item) => ({
    //     time: item.dt_txt.split(" ")[1].slice(0, 5),
    //     temperature: item.main.temp,
    //     icon: item.weather[0].icon,
    //   }));
  } catch (error) {
    if (error.name === "TypeError") {
      console.error("Network error or resource not found:", error);
    } else {
      console.error("Failed to fetch weather data:", error);
    }
    throw error;
  }
};
