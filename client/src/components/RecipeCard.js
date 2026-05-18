import StarRating from "./StarRating";

const PLACEHOLDER =
  "https://via.placeholder.com/600x400/ffe4e6/9d174d?text=No+Image+🍓";

export default function RecipeCard({
  recipe,
  isFavorite,
  canModify,
  onView,
  onToggleFavorite,
  onAddToCart,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-[28px] shadow-xl dark:shadow-gray-950/50 overflow-hidden transition hover:-translate-y-2 hover:shadow-2xl">
      <button
        type="button"
        className="relative h-56 w-full overflow-hidden text-left"
        onClick={onView}
      >
        <img
          src={recipe.imageURL || PLACEHOLDER}
          alt={recipe.title}
          className="w-full h-full object-cover transition hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite();
            }
          }}
          className="absolute top-4 right-4 text-2xl transition hover:scale-125 cursor-pointer"
        >
          {isFavorite ? "❤️" : "🤍"}
        </span>
        <h3 className="absolute bottom-4 left-4 text-white text-2xl font-semibold pr-4">
          {recipe.title}
        </h3>
      </button>

      <div className="p-6">
        {recipe.ratingCount > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <StarRating value={recipe.ratingAverage} readonly size="sm" />
            <span className="text-xs text-gray-400">({recipe.ratingCount})</span>
          </div>
        )}
        <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {recipe.ingredients?.join(", ")}
        </p>

        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-5">
          <span>⏱ {recipe.cookingTime ?? "-"} mins</span>
          <span>{recipe.difficulty}</span>
          {recipe.category && <span>{recipe.category}</span>}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={onView}
            className="flex-1 min-w-[4rem] bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300 py-2 rounded-full hover:bg-pink-200 dark:hover:bg-pink-900/60 transition text-sm"
          >
            View
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.();
            }}
            className="px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm"
            title="Add to shopping list"
          >
            🛒
          </button>
          {canModify && (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="flex-1 bg-pink-500 text-white py-2 rounded-full hover:bg-pink-400 transition"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="flex-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 py-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
