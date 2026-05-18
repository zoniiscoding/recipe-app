const Recipe = require("../models/Recipe");

async function loadRecipe(req, res, next) {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    req.recipe = recipe;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function requireOwner(req, res, next) {
  const { recipe, user } = req;

  if (recipe.createdBy && recipe.createdBy !== user.uid) {
    return res.status(403).json({ message: "You can only modify your own recipes" });
  }

  next();
}

module.exports = { loadRecipe, requireOwner };
