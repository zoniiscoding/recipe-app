const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    value: { type: Number, min: 1, max: 5, required: true },
  },
  { _id: false }
);

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
      default: [],
    },

    cookingTime: Number,
    prepTime: Number,

    servings: {
      type: Number,
      default: 4,
      min: 1,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },

    category: String,
    imageURL: String,
    createdBy: String,

    ratings: {
      type: [ratingSchema],
      default: [],
    },

    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

recipeSchema.methods.recalculateRatings = function recalculateRatings() {
  if (!this.ratings.length) {
    this.ratingAverage = 0;
    this.ratingCount = 0;
    return;
  }
  const sum = this.ratings.reduce((total, r) => total + r.value, 0);
  this.ratingAverage = Math.round((sum / this.ratings.length) * 10) / 10;
  this.ratingCount = this.ratings.length;
};

module.exports = mongoose.model("Recipe", recipeSchema);
