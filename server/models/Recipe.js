const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: String,

    ingredients: {
      type: [String],
      required: true,
    },

    steps: {
      type: [String],
      required: true,
    },

    cookingTime: Number,

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },

    category: String,
    imageURL: String,
    createdBy: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", recipeSchema);
