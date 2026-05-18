import { useMemo, useState } from "react";
import { scaleIngredients } from "../utils/scaleIngredients";
import { ingredientsToCartItems } from "../utils/shoppingList";
import { printRecipe, shareRecipe } from "../utils/recipeShare";
import StarRating from "./StarRating";

const PLACEHOLDER =
  "https://via.placeholder.com/600x400/ffe4e6/9d174d?text=No+Image+🍓";

export default function RecipeDetailModal({
  recipe,
  onClose,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onRate,
  userRating,
  user,
}) {
  const baseServings = recipe.servings > 0 ? recipe.servings : 4;
  const [servings, setServings] = useState(baseServings);
  const [cookMode, setCookMode] = useState(false);
  const [cookStep, setCookStep] = useState(0);

  const scaledIngredients = useMemo(
    () => scaleIngredients(recipe.ingredients, baseServings, servings),
    [recipe.ingredients, baseServings, servings]
  );

  const steps = recipe.steps || [];
  const adjustServings = (delta) => {
    setServings((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    onAddToCart(ingredientsToCartItems(scaledIngredients, recipe.title));
  };

  const handleShare = async () => {
    try {
      await shareRecipe(recipe);
    } catch {
      /* user cancelled */
    }
  };

  if (cookMode && steps.length > 0) {
    const step = steps[cookStep];
    const progress = ((cookStep + 1) / steps.length) * 100;

    return (
      <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col text-white">
        <div className="p-6 flex justify-between items-center border-b border-gray-800">
          <button type="button" onClick={() => setCookMode(false)} className="text-pink-400">
            ← Exit cook mode
          </button>
          <span className="text-sm text-gray-400">
            Step {cookStep + 1} / {steps.length}
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
          <div className="w-full bg-gray-800 rounded-full h-2 mb-10">
            <div
              className="bg-pink-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-3xl md:text-4xl font-medium leading-relaxed">{step}</p>
        </div>
        <div className="p-6 flex gap-4 justify-center border-t border-gray-800">
          <button
            type="button"
            disabled={cookStep === 0}
            onClick={() => setCookStep((s) => s - 1)}
            className="px-8 py-3 rounded-full bg-gray-800 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => {
              if (cookStep < steps.length - 1) setCookStep((s) => s + 1);
              else setCookMode(false);
            }}
            className="px-8 py-3 rounded-full bg-pink-500"
          >
            {cookStep < steps.length - 1 ? "Next step" : "Done! 🍓"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 print:hidden"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-[28px] w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64 overflow-hidden rounded-t-[28px]">
          <img
            src={recipe.imageURL || PLACEHOLDER}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <button
            type="button"
            onClick={onToggleFavorite}
            className="absolute top-4 right-14 text-2xl"
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white text-xl bg-black/30 w-10 h-10 rounded-full"
          >
            ✕
          </button>
          <h2 className="absolute bottom-4 left-6 text-white text-3xl font-semibold pr-4">
            {recipe.title}
          </h2>
        </div>

        <div className="p-8">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <StarRating
              value={recipe.ratingAverage || 0}
              readonly
              size="sm"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {recipe.ratingCount
                ? `${recipe.ratingAverage} (${recipe.ratingCount})`
                : "No ratings yet"}
            </span>
            {user && onRate && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Your rating:</span>
                <StarRating
                  value={userRating || 0}
                  onRate={onRate}
                  size="sm"
                />
              </div>
            )}
          </div>

          {recipe.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-6">{recipe.description}</p>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {recipe.prepTime != null && (
              <span className="bg-pink-50 dark:bg-pink-900/30 px-3 py-1 rounded-full text-sm">
                🥄 Prep {recipe.prepTime}m
              </span>
            )}
            {recipe.cookingTime != null && (
              <span className="bg-pink-50 dark:bg-pink-900/30 px-3 py-1 rounded-full text-sm">
                ⏱ Cook {recipe.cookingTime}m
              </span>
            )}
            {recipe.difficulty && (
              <span className="bg-pink-50 dark:bg-pink-900/30 px-3 py-1 rounded-full text-sm">
                {recipe.difficulty}
              </span>
            )}
            {recipe.category && (
              <span className="bg-pink-50 dark:bg-pink-900/30 px-3 py-1 rounded-full text-sm">
                {recipe.category}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              type="button"
              onClick={handleAddToCart}
              className="px-4 py-2 rounded-full bg-pink-500 text-white text-sm hover:bg-pink-400"
            >
              + Add to shopping list
            </button>
            {steps.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setCookStep(0);
                  setCookMode(true);
                }}
                className="px-4 py-2 rounded-full bg-gray-900 dark:bg-gray-700 text-white text-sm"
              >
                👨‍🍳 Cook mode
              </button>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm"
            >
              Share
            </button>
            <button
              type="button"
              onClick={() => printRecipe(recipe, scaledIngredients)}
              className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm"
            >
              Print
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-pink-500">Ingredients</h3>
            <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
              <button
                type="button"
                onClick={() => adjustServings(-1)}
                className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow"
              >
                −
              </button>
              <span className="text-sm font-medium min-w-[4rem] text-center dark:text-gray-200">
                {servings} servings
              </span>
              <button
                type="button"
                onClick={() => adjustServings(1)}
                className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow"
              >
                +
              </button>
            </div>
          </div>

          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-1">
            {scaledIngredients.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          {steps.length > 0 && (
            <>
              <h3 className="font-semibold text-pink-500 mb-2">Instructions</h3>
              <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2">
                {steps.map((step, index) => (
                  <li key={`${index}-${step}`}>{step}</li>
                ))}
              </ol>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
