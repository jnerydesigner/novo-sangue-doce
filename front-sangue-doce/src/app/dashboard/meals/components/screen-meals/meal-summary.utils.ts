export const nutrientColors = {
  carbohydrates: "#9b59b6",
  energy: "#f1c40f",
  fat: "#2c3e50",
  fiber: "#2ecc71",
  protein: "#e74c3c",
};

export const itemColors = [
  nutrientColors.carbohydrates,
  nutrientColors.protein,
  nutrientColors.fat,
  nutrientColors.fiber,
  nutrientColors.energy,
];

export function formatDecimal(value: number | string) {
  const numberValue = Number(value);
  return (Number.isFinite(numberValue) ? numberValue : 0)
    .toFixed(2)
    .replace(".", ",");
}

export function buildConicGradient(
  segments: Array<{ color: string; value: number }>,
) {
  const positiveSegments = segments.filter((segment) => segment.value > 0);
  const total = positiveSegments.reduce(
    (sum, segment) => sum + segment.value,
    0,
  );

  if (!total) {
    return `conic-gradient(${itemColors
      .map((color, index) => {
        const start = index * 20;
        return `${color} ${start}% ${start + 20}%`;
      })
      .join(", ")})`;
  }

  let offset = 0;
  return `conic-gradient(${positiveSegments
    .map((segment) => {
      const start = offset;
      const size = (segment.value / total) * 100;
      offset += size;
      return `${segment.color} ${start}% ${offset}%`;
    })
    .join(", ")})`;
}
