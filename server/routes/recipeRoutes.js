const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");


// ======================
// CREATE RECIPE
// ======================
router.post("/", async (req, res) => {
  try {
    const recipe = new Recipe(req.body);
    const savedRecipe = await recipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ======================
// GET ALL RECIPES
// ======================
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ======================
// SEARCH BY INGREDIENT
// ======================
router.get("/search/ingredient", async (req, res) => {
  try {
    const { ingredient } = req.query;

    if (!ingredient) {
      return res.status(400).json({ message: "Ingredient is required" });
    }

    const recipes = await Recipe.find({
      ingredients: { $regex: ingredient, $options: "i" }
    });

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ======================
// ADVANCED FILTER
// ======================
router.get("/filter", async (req, res) => {
  try {
    const { ingredient, category, difficulty, maxTime } = req.query;

    let query = {};

    if (ingredient) {
      query.ingredients = { $regex: ingredient, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (maxTime) {
      query.cookingTime = { $lte: Number(maxTime) };
    }

    const recipes = await Recipe.find(query);
    res.json(recipes);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ======================
// GET RECIPE BY ID (ALWAYS LAST)
// ======================
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


// ======================
// UPDATE RECIPE
// ======================
router.put("/:id", async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedRecipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ======================
// DELETE RECIPE
// ======================
router.delete("/:id", async (req, res) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: "Recipe deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
