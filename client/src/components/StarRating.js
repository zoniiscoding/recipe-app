export default function StarRating({
  value = 0,
  onRate,
  size = "md",
  readonly = false,
}) {
  const sizes = { sm: "text-lg", md: "text-2xl", lg: "text-3xl" };

  return (
    <div
      className={`flex gap-0.5 ${sizes[size]}`}
      role={readonly ? "img" : "group"}
      aria-label={readonly ? `${value} out of 5 stars` : undefined}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly || !onRate}
          onClick={() => onRate?.(star)}
          className={`transition hover:scale-110 ${
            readonly ? "cursor-default" : "cursor-pointer"
          } ${star <= Math.round(value) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          {star <= Math.round(value) ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}
