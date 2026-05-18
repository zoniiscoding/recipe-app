export function parseList(value, separator = ",") {
  if (!value?.trim()) return [];
  return value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseSteps(value) {
  if (!value?.trim()) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function recipeToPayload(form) {
  return {
    title: form.title.trim(),
    description: form.description?.trim() || "",
    ingredients: parseList(form.ingredients),
    steps: parseSteps(form.steps),
    cookingTime: form.cookingTime ? Number(form.cookingTime) : undefined,
    prepTime: form.prepTime ? Number(form.prepTime) : undefined,
    servings: form.servings ? Math.max(1, Number(form.servings)) : 4,
    difficulty: form.difficulty || undefined,
    category: form.category || undefined,
    imageURL: form.imageURL?.trim() || "",
  };
}

export function recipeToForm(recipe) {
  return {
    title: recipe.title || "",
    description: recipe.description || "",
    ingredients: recipe.ingredients?.join(", ") || "",
    steps: recipe.steps?.join("\n") || "",
    cookingTime: recipe.cookingTime ?? "",
    prepTime: recipe.prepTime ?? "",
    servings: String(recipe.servings ?? 4),
    difficulty: recipe.difficulty || "",
    category: recipe.category || "",
    imageURL: recipe.imageURL || "",
  };
}
