import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const CATEGORY_OPTIONS = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
  "Dessert",
  "Beverage",
];

function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  const [ingredientFilter, setIngredientFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [showSparkle, setShowSparkle] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);


  const [newRecipe, setNewRecipe] = useState({
    title: "",
    ingredients: "",
    cookingTime: "",
    difficulty: "",
    category: "",
    imageURL: "",
  });

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/recipes");
      setRecipes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter((recipe) => {
  const recipeTime = Number(recipe.cookingTime) || 0;

  return (
    (ingredientFilter === "" ||
      recipe.ingredients?.some((i) =>
        i.toLowerCase().includes(ingredientFilter.toLowerCase())
      )) &&
    (difficultyFilter === "" || recipe.difficulty === difficultyFilter) &&
    (categoryFilter === "" || recipe.category === categoryFilter) &&
    (timeFilter === "" || recipeTime <= Number(timeFilter)) &&
    (!showFavoritesOnly || favorites.includes(recipe._id))
  );
});


  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((fav) => fav !== id)
        : [...prev, id]
    );
  };

  const deleteRecipe = async (id) => {
    await axios.delete(`http://localhost:5000/api/recipes/${id}`);
    fetchRecipes();
  };

  const addRecipe = async () => {
    await axios.post("http://localhost:5000/api/recipes", {
      ...newRecipe,
      cookingTime: Number(newRecipe.cookingTime),
      ingredients: newRecipe.ingredients.split(",").map((i) => i.trim()),
    });

    setShowSparkle(true);

    setTimeout(() => {
      setShowSparkle(false);
      setShowForm(false);
      fetchRecipes();
    }, 900);
  };

  const startEdit = (recipe) => {
    setEditingRecipe({
      ...recipe,
      ingredients: recipe.ingredients.join(", "),
      imageURL: recipe.imageURL || "",
    });
  };

  const saveEdit = async () => {
    await axios.put(
      `http://localhost:5000/api/recipes/${editingRecipe._id}`,
      {
        ...editingRecipe,
        cookingTime: Number(editingRecipe.cookingTime),
        ingredients: editingRecipe.ingredients
          .split(",")
          .map((i) => i.trim()),
      }
    );
    setEditingRecipe(null);
    fetchRecipes();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 p-6 relative overflow-hidden">

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12 flex justify-between items-center relative z-10">
        <div>
          <h1 className="text-5xl font-bold text-pink-500">
            🍓 Recipe Garden
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            Curate, organize and fall in love with your favorite recipes 🍓
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="bg-pink-500 text-white px-8 py-4 rounded-full shadow-lg hover:bg-pink-400 hover:scale-105 transition"
        >
          + Add Recipe
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
  <button
    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
    className={`px-5 py-2 rounded-full transition ${
      showFavoritesOnly
        ? "bg-pink-500 text-white"
        : "bg-gray-200 text-gray-700"
    }`}
  >
    {showFavoritesOnly ? "Showing Favorites ❤️" : "Show Favorites 🤍"}
  </button>

  
</div>

      <div className="max-w-6xl mx-auto bg-white rounded-[28px] shadow p-8 mb-12">
        <div className="grid md:grid-cols-4 gap-5">
          <input
            placeholder="Ingredient"
            value={ingredientFilter}
            onChange={(e) => setIngredientFilter(e.target.value)}
            className="border rounded-2xl p-4"
          />

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="border rounded-2xl p-4"
          >
            <option value="">All Difficulty</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded-2xl p-4"
          >
            <option value="">All Categories</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border rounded-2xl p-4"
          >
            <option value="">All Time</option>
            <option value="30">Under 30 mins</option>
            <option value="45">Under 45 mins</option>
            <option value="60">Under 60 mins</option>
          </select>
        </div>
      </div>

      {/* Recipes */}
      <div className="max-w-6xl mx-auto relative z-10">
        {loading ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4 animate-pulse">🍓</div>
            <p className="text-lg text-gray-600">
              Loading delicious recipes...
            </p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🍓</div>
            <h2 className="text-2xl font-semibold text-pink-500 mb-2">
              No recipes found
            </h2>
            <p className="text-gray-500">
              Try adjusting your filters or add a new recipe.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe._id}
                className="bg-white rounded-[28px] shadow-xl overflow-hidden transition hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={
                      recipe.imageURL ||
                      "https://via.placeholder.com/600x400/ffe4e6/9d174d?text=No+Image+🍓"
                    }
                    alt={recipe.title}
                    className="w-full h-full object-cover transition hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                  <button
                    onClick={() => toggleFavorite(recipe._id)}
                    className="absolute top-4 right-4 text-2xl transition hover:scale-125"
                  >
                    {favorites.includes(recipe._id) ? "❤️" : "🤍"}
                  </button>

                  <h3 className="absolute bottom-4 left-4 text-white text-2xl font-semibold">
                    {recipe.title}
                  </h3>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {recipe.ingredients?.join(", ")}
                  </p>

                  <div className="flex justify-between text-sm text-gray-500 mb-5">
                    <span>⏱ {recipe.cookingTime || "-"} mins</span>
                    <span>{recipe.difficulty}</span>
                    {recipe.category && <span>{recipe.category}</span>}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => startEdit(recipe)}
                      className="flex-1 bg-pink-500 text-white py-2 rounded-full hover:bg-pink-400 transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteRecipe(recipe._id)}
                      className="flex-1 bg-gray-200 py-2 rounded-full hover:bg-gray-300 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-[28px] w-96 shadow-xl">
            <h2 className="text-2xl font-semibold text-pink-500 mb-5">
              Add Recipe 🍓
            </h2>

            <input
              placeholder="Title"
              className="w-full border p-4 rounded-2xl mb-3"
              onChange={(e) =>
                setNewRecipe({ ...newRecipe, title: e.target.value })
              }
            />

            <input
              placeholder="Ingredients (comma separated)"
              className="w-full border p-4 rounded-2xl mb-3"
              onChange={(e) =>
                setNewRecipe({ ...newRecipe, ingredients: e.target.value })
              }
            />

            <input
              placeholder="Cooking Time (mins)"
              className="w-full border p-4 rounded-2xl mb-3"
              onChange={(e) =>
                setNewRecipe({ ...newRecipe, cookingTime: e.target.value })
              }
            />

            <input
              placeholder="Image URL (optional)"
              className="w-full border p-4 rounded-2xl mb-3"
              onChange={(e) =>
                setNewRecipe({ ...newRecipe, imageURL: e.target.value })
              }
            />

            <select
              value={newRecipe.difficulty}
              className="w-full border p-4 rounded-2xl mb-3"
              onChange={(e) =>
                setNewRecipe({ ...newRecipe, difficulty: e.target.value })
              }
            >
              <option value="" disabled>Select Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={newRecipe.category}
              className="w-full border p-4 rounded-2xl mb-5"
              onChange={(e) =>
                setNewRecipe({ ...newRecipe, category: e.target.value })
              }
            >
              <option value="">Select Category</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>

            <button
              onClick={addRecipe}
              className="w-full bg-pink-500 text-white py-3 rounded-full hover:bg-pink-400 transition"
            >
              Save Recipe
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="w-full mt-3 text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
{editingRecipe && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-[28px] w-96 shadow-xl">

      <h2 className="text-2xl font-semibold text-pink-500 mb-6">
        Edit Recipe 🍓
      </h2>

      {/* Title */}
      <label className="text-sm text-gray-500">Title</label>
      <input
        value={editingRecipe.title}
        className="w-full border p-4 rounded-2xl mb-4 mt-1"
        onChange={(e) =>
          setEditingRecipe({ ...editingRecipe, title: e.target.value })
        }
      />

      {/* Ingredients */}
      <label className="text-sm text-gray-500">
        Ingredients (comma separated)
      </label>
      <input
        value={editingRecipe.ingredients}
        className="w-full border p-4 rounded-2xl mb-4 mt-1"
        onChange={(e) =>
          setEditingRecipe({
            ...editingRecipe,
            ingredients: e.target.value,
          })
        }
      />

      {/* Cooking Time */}
      <label className="text-sm text-gray-500">Cooking Time (mins)</label>
      <input
        value={editingRecipe.cookingTime}
        className="w-full border p-4 rounded-2xl mb-4 mt-1"
        onChange={(e) =>
          setEditingRecipe({
            ...editingRecipe,
            cookingTime: e.target.value,
          })
        }
      />

      {/* Image URL */}
      <label className="text-sm text-gray-500">Image URL</label>
      <input
        value={editingRecipe.imageURL || ""}
        className="w-full border p-4 rounded-2xl mb-4 mt-1"
        onChange={(e) =>
          setEditingRecipe({
            ...editingRecipe,
            imageURL: e.target.value,
          })
        }
      />

      {/* Difficulty Dropdown */}
      <label className="text-sm text-gray-500">Difficulty</label>
      <select
        value={editingRecipe.difficulty || ""}
        className="w-full border p-4 rounded-2xl mb-4 mt-1"
        onChange={(e) =>
          setEditingRecipe({
            ...editingRecipe,
            difficulty: e.target.value,
          })
        }
      >
        <option value="">Select Difficulty</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>

      {/* Category Dropdown */}
      <label className="text-sm text-gray-500">Category</label>
      <select
        value={editingRecipe.category || ""}
        className="w-full border p-4 rounded-2xl mb-6 mt-1"
        onChange={(e) =>
          setEditingRecipe({
            ...editingRecipe,
            category: e.target.value,
          })
        }
      >
        <option value="">Select Category</option>
        {CATEGORY_OPTIONS.map((cat) => (
          <option key={cat}>{cat}</option>
        ))}
      </select>

      {/* Buttons */}
      <button
        onClick={saveEdit}
        className="w-full bg-pink-500 text-white py-3 rounded-full hover:bg-pink-400 transition"
      >
        Save Changes
      </button>

      <button
        onClick={() => setEditingRecipe(null)}
        className="w-full mt-3 text-gray-500"
      >
        Cancel
      </button>

    </div>
  </div>
)}


      {/* Sparkle */}
      {showSparkle && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none">
          <div className="text-6xl animate-sparklePop">✨🍓✨</div>
        </div>
      )}
    </div>
  );
}

export default App;
