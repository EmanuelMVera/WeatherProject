const apiKey = import.meta.env.VITE_API_KEY;

export const fetchDailyForecast = async (city) => {
  try {
    const response = await fetch(
      `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=${14}&day_fields=date,temp_max,temp_min,condition:text,icon`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error fetching weather data: ${errorData.message} (status: ${response.status})`
      );
    }

    const data = await response.json();
    return data;

    // const daysOfWeek = [
    //   "Sunday",
    //   "Monday",
    //   "Tuesday",
    //   "Wednesday",
    //   "Thursday",
    //   "Friday",
    //   "Saturday",
    // ];

    // const dailyForecast = data.list.reduce((acc, item) => {
    //   const date = new Date(item.dt_txt);
    //   const day = daysOfWeek[date.getDay()];
    //   const formattedDate = `${day}`;

    //   if (!acc[formattedDate]) {
    //     acc[formattedDate] = {
    //       date: formattedDate,
    //       minTemp: item.main.temp_min,
    //       maxTemp: item.main.temp_max,
    //     };
    //   } else {
    //     acc[formattedDate].minTemp = Math.min(
    //       acc[formattedDate].minTemp,
    //       item.main.temp_min
    //     );
    //     acc[formattedDate].maxTemp = Math.max(
    //       acc[formattedDate].maxTemp,
    //       item.main.temp_max
    //     );
    //   }
    //   return acc;
    // }, {});

    // return Object.values(dailyForecast);
  } catch (error) {
    if (error.name === "TypeError") {
      console.error("Network error or resource not found:", error);
    } else {
      console.error("Failed to fetch weather data:", error);
    }
    throw error;
  }
};
