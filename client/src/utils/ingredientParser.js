export function parseIngredient(raw) {
  const text = raw.trim();
  if (!text) return { raw: text, quantity: null, unit: null, name: text, key: "" };

  const fractionMatch = text.match(/^(\d+)\s*\/\s*(\d+)\s+(\S+)?\s*(.*)$/i);
  if (fractionMatch) {
    const quantity = Number(fractionMatch[1]) / Number(fractionMatch[2]);
    const unit = fractionMatch[3]?.toLowerCase() || null;
    const name = (fractionMatch[4] || fractionMatch[3] || "").trim();
    return {
      raw: text,
      quantity,
      unit: fractionMatch[4] ? unit : null,
      name: fractionMatch[4] ? name : fractionMatch[3],
      key: normalizeKey(fractionMatch[4] ? name : fractionMatch[3]),
    };
  }

  const decimalMatch = text.match(/^([\d.]+)\s+(\S+)?\s*(.*)$/i);
  if (decimalMatch) {
    const quantity = parseFloat(decimalMatch[1]);
    const unit = decimalMatch[3] ? decimalMatch[2]?.toLowerCase() : null;
    const name = (decimalMatch[3] || decimalMatch[2] || "").trim();
    return {
      raw: text,
      quantity: Number.isNaN(quantity) ? null : quantity,
      unit,
      name,
      key: normalizeKey(name),
    };
  }

  return { raw: text, quantity: null, unit: null, name: text, key: normalizeKey(text) };
}

function normalizeKey(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatQuantity(value) {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, "");
}

export function formatMergedIngredient(entry) {
  if (entry.quantity != null && entry.unit && entry.name) {
    return `${formatQuantity(entry.quantity)} ${entry.unit} ${entry.name}`.trim();
  }
  if (entry.quantity != null && entry.name) {
    return `${formatQuantity(entry.quantity)} ${entry.name}`.trim();
  }
  return entry.name || entry.raw;
}
