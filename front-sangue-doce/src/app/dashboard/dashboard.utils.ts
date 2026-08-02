export function formatMeasurementTime(measuredAt: string) {
  const [date = "", time = ""] = measuredAt.split("T");
  const [year, month, day] = date.split("-");
  const [hour, minute] = time.split(":");

  if (!day || !month || !hour || !minute) {
    return measuredAt;
  }

  return `${day}/${month} ${hour}:${minute}`;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
