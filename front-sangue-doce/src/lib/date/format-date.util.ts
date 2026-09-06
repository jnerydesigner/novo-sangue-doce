export const formatDateUtil = (date: string): string => {
  const [, displayDay, displayMonth, displayYear] = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/) ?? [];

  if (displayDay && displayMonth && displayYear) {
    return `${displayDay}/${displayMonth}/${displayYear}`;
  }

  const [, year, month, day] = date.match(/^(\d{4})-(\d{2})-(\d{2})/) ?? [];
  if (year && month && day) {
    return `${day}/${month}/${year}`;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const formattedDay = String(parsedDate.getUTCDate()).padStart(2, "0");
  const formattedMonth = String(parsedDate.getUTCMonth() + 1).padStart(2, "0");
  const formattedYear = parsedDate.getUTCFullYear();

  return `${formattedDay}/${formattedMonth}/${formattedYear}`;
};
