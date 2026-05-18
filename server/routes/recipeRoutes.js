const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const { requireAuth } = require("../middleware/auth");
const { loadRecipe, requireOwner } = require("../middleware/ownership");
const {
  buildRecipeQuery,
  getSortOption,
} = require("../utils/buildRecipeQuery");
const requireDb = require("../middleware/requireDb");

const DEFAULT_LIMIT = 9;
const MAX_LIMIT = 50;

router.use(requireDb);

function paginatedList(filter, sort, page, limit) {
  const skip = (page - 1) * limit;
  return Promise.all([
    Recipe.find(filter).sort(sort).skip(skip).limit(limit),
    Recipe.countDocuments(filter),
  ]);
}

router.post("/", requireAuth, async (req, res) => {
  try {
    const recipe = new Recipe({
      ...req.body,
      createdBy: req.user.uid,
    });
    const savedRecipe = await recipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT)
    );
    const filter = buildRecipeQuery(req.query);
    const sort = getSortOption(req.query.sortBy);
    const [recipes, total] = await paginatedList(filter, sort, page, limit);

    res.json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/stats/summary", async (_req, res) => {
  try {
    const [total, byCategory, avgCooking] = await Promise.all([
      Recipe.countDocuments(),
      Recipe.aggregate([
        { $match: { category: { $exists: true, $ne: "" } } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
      Recipe.aggregate([
        { $match: { cookingTime: { $exists: true, $ne: null } } },
        { $group: { _id: null, avg: { $avg: "$cookingTime" } } },
      ]),
    ]);

    res.json({
      total,
      topCategories: byCategory,
      avgCookingTime: avgCooking[0]?.avg
        ? Math.round(avgCooking[0].avg)
        : null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/search/ingredient", async (req, res) => {
  try {
    const { ingredient } = req.query;
    if (!ingredient) {
      return res.status(400).json({ message: "Ingredient is required" });
    }
    const recipes = await Recipe.find({
      ingredients: { $regex: ingredient, $options: "i" },
    });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/filter", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT)
    );
    const filter = buildRecipeQuery(req.query);
    const sort = getSortOption(req.query.sortBy);
    const [recipes, total] = await paginatedList(filter, sort, page, limit);

    res.json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/rate", requireAuth, async (req, res) => {
  try {
    const value = Number(req.body.value);
    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    recipe.ratings = recipe.ratings.filter((r) => r.userId !== req.user.uid);
    recipe.ratings.push({ userId: req.user.uid, value });
    recipe.recalculateRatings();
    await recipe.save();

    res.json({
      ...recipe.toObject(),
      userRating: value,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", requireAuth, loadRecipe, requireOwner, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.createdBy;
    delete updates.ratings;
    delete updates.ratingAverage;
    delete updates.ratingCount;

    if (!req.recipe.createdBy) {
      updates.createdBy = req.user.uid;
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json(updatedRecipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete(
  "/:id",
  requireAuth,
  loadRecipe,
  requireOwner,
  async (req, res) => {
    try {
      await Recipe.findByIdAndDelete(req.params.id);
      res.json({ message: "Recipe deleted" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
