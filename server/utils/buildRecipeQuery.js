const mongoose = require("mongoose");

function buildRecipeQuery(query) {
  const {
    title,
    ingredient,
    category,
    difficulty,
    maxTime,
    favoriteIds,
    createdBy,
  } = query;

  const filter = {};

  if (title?.trim()) {
    filter.title = { $regex: title.trim(), $options: "i" };
  }

  if (ingredient?.trim()) {
    filter.ingredients = { $regex: ingredient.trim(), $options: "i" };
  }

  if (category) {
    filter.category = category;
  }

  if (difficulty) {
    filter.difficulty = difficulty;
  }

  if (maxTime) {
    const max = Number(maxTime);
    if (!Number.isNaN(max)) {
      filter.cookingTime = { $lte: max };
    }
  }

  if (createdBy?.trim()) {
    filter.createdBy = createdBy.trim();
  }

  if (favoriteIds) {
    const ids = favoriteIds
      .split(",")
      .map((id) => id.trim())
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (ids.length === 0) {
      filter._id = { $in: [] };
    } else {
      filter._id = { $in: ids };
    }
  }

  return filter;
}

function getSortOption(sortBy) {
  switch (sortBy) {
    case "title":
      return { title: 1 };
    case "time":
      return { cookingTime: 1, createdAt: -1 };
    case "rating":
      return { ratingAverage: -1, ratingCount: -1, createdAt: -1 };
    case "prep":
      return { prepTime: 1, createdAt: -1 };
    default:
      return { createdAt: -1 };
  }
}

module.exports = { buildRecipeQuery, getSortOption };
