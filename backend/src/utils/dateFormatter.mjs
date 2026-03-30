export const formatTimestamp = (unixTimestamp, timezoneOffset) => {
  const date = new Date((unixTimestamp + timezoneOffset) * 1000);
  // Usar UTC para evitar doble conversión local que provoca horarios fuera de lugar
  return {
    date: date.toLocaleDateString("es-AR", {
      timeZone: "UTC",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("es-AR", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
};

export const formatFullDate = (unixTimestamp, timezoneOffset) => {
  const date = new Date((unixTimestamp + timezoneOffset) * 1000);
  // Formato de fecha en español aplicando el offset UTC calculado
  let formattedDate = date.toLocaleDateString("es-AR", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Capitalize the first letter of the day and month
  return formattedDate.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
};