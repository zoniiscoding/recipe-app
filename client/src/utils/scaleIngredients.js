function parseQuantity(token) {
  const fraction = token.match(/^(\d+)\/(\d+)$/);
  if (fraction) {
    return Number(fraction[1]) / Number(fraction[2]);
  }
  const value = parseFloat(token);
  return Number.isNaN(value) ? null : value;
}

function formatQuantity(value) {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1).replace(/\.0$/, "");
}

export function scaleIngredient(ingredient, factor) {
  const trimmed = ingredient.trim();
  const match = trimmed.match(/^([\d./]+)\s*(.*)$/);

  if (!match) return trimmed;

  const qty = parseQuantity(match[1]);
  if (qty == null) return trimmed;

  const scaled = qty * factor;
  const rest = match[2];
  const formatted = formatQuantity(scaled);

  return rest ? `${formatted} ${rest}` : formatted;
}

export function scaleIngredients(ingredients, fromServings, toServings) {
  const base = fromServings > 0 ? fromServings : 4;
  const factor = toServings / base;
  return (ingredients || []).map((item) => scaleIngredient(item, factor));
}
