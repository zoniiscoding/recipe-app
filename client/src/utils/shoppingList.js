import {
  formatMergedIngredient,
  parseIngredient,
} from "./ingredientParser";

export function mergeShoppingItems(items) {
  const map = new Map();

  for (const item of items) {
    const parsed = parseIngredient(item.text);
    const key = parsed.key || item.text.toLowerCase();

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name: parsed.name || item.text,
        quantity: parsed.quantity,
        unit: parsed.unit,
        raw: parsed.raw,
        recipes: new Set(),
        lines: [],
      });
    }

    const entry = map.get(key);
    entry.recipes.add(item.recipeTitle || "Manual");
    entry.lines.push(item.text);

    if (
      parsed.quantity != null &&
      entry.quantity != null &&
      parsed.unit &&
      entry.unit &&
      parsed.unit === entry.unit
    ) {
      entry.quantity += parsed.quantity;
      entry.name = parsed.name || entry.name;
    } else if (parsed.quantity == null || entry.quantity == null || parsed.unit !== entry.unit) {
      entry.quantity = null;
      entry.unit = null;
      entry.name = entry.lines.join(" + ");
    }
  }

  return Array.from(map.values())
    .map((entry) => ({
      id: entry.id,
      name: formatMergedIngredient(entry),
      recipes: Array.from(entry.recipes).sort(),
      lines: entry.lines,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function buildShoppingListFromRecipes(recipes) {
  const items = [];
  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients || []) {
      items.push({ text: ingredient, recipeTitle: recipe.title });
    }
  }
  return mergeShoppingItems(items);
}

export function ingredientsToCartItems(ingredients, recipeTitle) {
  return (ingredients || []).map((text) => ({ text, recipeTitle }));
}
