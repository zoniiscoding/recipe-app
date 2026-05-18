export function getRecipeShareUrl(recipeId) {
  const url = new URL(window.location.href);
  url.searchParams.set("recipe", recipeId);
  return url.toString();
}

export async function shareRecipe(recipe) {
  const url = getRecipeShareUrl(recipe._id);
  const text = `${recipe.title} — Recipe Garden 🍓`;

  if (navigator.share) {
    await navigator.share({ title: recipe.title, text, url });
    return;
  }

  await navigator.clipboard.writeText(url);
}

export function printRecipe(recipe, ingredients) {
  const win = window.open("", "_blank");
  if (!win) return;

  const stepsHtml = (recipe.steps || [])
    .map((step, i) => `<li>${step}</li>`)
    .join("");

  const ingredientsHtml = (ingredients || recipe.ingredients || [])
    .map((item) => `<li>${item}</li>`)
    .join("");

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${recipe.title}</title>
        <style>
          body { font-family: Georgia, serif; max-width: 600px; margin: 2rem auto; padding: 0 1rem; }
          h1 { color: #ec4899; }
          ul { line-height: 1.8; }
        </style>
      </head>
      <body>
        <h1>${recipe.title}</h1>
        ${recipe.description ? `<p>${recipe.description}</p>` : ""}
        <p><strong>Servings:</strong> ${recipe.servings || 4} · <strong>Cook:</strong> ${recipe.cookingTime || "—"} mins</p>
        <h2>Ingredients</h2>
        <ul>${ingredientsHtml}</ul>
        ${stepsHtml ? `<h2>Instructions</h2><ol>${stepsHtml}</ol>` : ""}
        <p style="margin-top:2rem;color:#888;font-size:12px;">Recipe Garden 🍓</p>
      </body>
    </html>
  `);
  win.document.close();
  win.print();
}
