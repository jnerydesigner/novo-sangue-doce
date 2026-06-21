/**
 * Formats Date-like values as dd/mm/yyyy.
 *
 * @example
 * formatDateToDayMonthYear('1978-01-23T00:00:00.000Z')
 * // '23/01/1978'
 */
export function formatDateToDayMonthYear(
  value: Date | string | number,
): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date.');
  }

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
}
