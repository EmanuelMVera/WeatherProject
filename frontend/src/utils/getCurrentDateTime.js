export function getCurrentDateTime() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  let hour = now.getHours();
  const minute = String(now.getMinutes()).padStart(2, "0");

  let ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour ? hour : 12;

  const hora = `${hour}:${minute} ${ampm}`;
  const fecha = `${year}-${month}-${day}`;

  return { fecha, hora };
}
