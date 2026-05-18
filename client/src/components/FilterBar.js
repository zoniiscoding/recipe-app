import { CATEGORY_OPTIONS } from "../constants";

const inputClass =
  "border border-gray-200 dark:border-gray-600 rounded-2xl p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400";

export default function FilterBar({
  titleFilter,
  setTitleFilter,
  ingredientFilter,
  setIngredientFilter,
  difficultyFilter,
  setDifficultyFilter,
  categoryFilter,
  setCategoryFilter,
  timeFilter,
  setTimeFilter,
  sortBy,
  setSortBy,
}) {
  return (
    <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-[28px] shadow dark:shadow-gray-900/50 p-8 mb-12 relative z-10">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
        <input
          placeholder="Search by title"
          value={titleFilter}
          onChange={(e) => setTitleFilter(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Ingredient"
          value={ingredientFilter}
          onChange={(e) => setIngredientFilter(e.target.value)}
          className={inputClass}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={inputClass}
        >
          <option value="newest">Newest first</option>
          <option value="title">Title A–Z</option>
          <option value="time">Quickest</option>
          <option value="rating">Top rated</option>
          <option value="prep">Prep time</option>
        </select>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className={inputClass}
        >
          <option value="">All Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={inputClass}
        >
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className={inputClass}
        >
          <option value="">All Time</option>
          <option value="30">Under 30 mins</option>
          <option value="45">Under 45 mins</option>
          <option value="60">Under 60 mins</option>
        </select>
      </div>
    </div>
  );
}
