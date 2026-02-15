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

  const [ingredientFilter, setIngredientFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [showSparkle, setShowSparkle] = useState(false);
  const [favorites, setFavorites] = useState([]);


  const [newRecipe, setNewRecipe] = useState({
    title: "",
    ingredients: "",
    cookingTime: "",
    difficulty: "",
    category: "",
    imageURL: "",
  });

  const fetchRecipes = async () => {
    const res = await axios.get("http://localhost:5000/api/recipes");
    setRecipes(res.data);
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
      (timeFilter === "" || recipeTime <= Number(timeFilter))
    );
  });

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

  const toggleFavorite = (id) => {
  setFavorites((prev) =>
    prev.includes(id)
      ? prev.filter((fav) => fav !== id)
      : [...prev, id]
  );
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 p-6 relative overflow-hidden">

      {/* Floating Strawberries */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-70">
        <div className="absolute animate-floatSlow text-2xl" style={{top:"12%", left:"8%"}}>🍓</div>
        <div className="absolute animate-float text-xl" style={{top:"28%", right:"12%"}}>🍓</div>
        <div className="absolute animate-floatSlow text-xl" style={{bottom:"20%", left:"14%"}}>🍓</div>
        <div className="absolute animate-float text-lg" style={{bottom:"10%", right:"18%"}}>🍓</div>
      </div>

      {/* Glow */}
      <div className="absolute top-[-250px] left-[-250px] w-[600px] h-[600px] bg-pink-300/60 blur-[160px] rounded-full"></div>
      <div className="absolute bottom-[-250px] right-[-250px] w-[600px] h-[600px] bg-rose-300/60 blur-[160px] rounded-full"></div>

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-10 flex justify-between items-center relative z-10">
        <div>
          <h1 className="text-5xl font-bold text-pink-500">
            🍓 Recipe Garden
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            Discover, create and manage your favorite recipes
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="relative bg-pink-500 text-white px-8 py-4 rounded-full shadow-lg hover:bg-pink-400 hover:scale-105 transition overflow-hidden"
        >
          + Add Recipe
          <span className="absolute inset-0 opacity-0 hover:opacity-100 transition pointer-events-none">✨</span>
        </button>
      </div>

      {/* Filters */}
      <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur rounded-[28px] shadow-xl border border-pink-100 p-8 mb-10 relative z-10">
        <h2 className="text-2xl font-semibold text-pink-500 mb-6">
          🔎 Search & Filter
        </h2>

        <div className="grid md:grid-cols-4 gap-5">
          <input
            placeholder="Ingredient"
            value={ingredientFilter}
            onChange={(e) => setIngredientFilter(e.target.value)}
            className="border border-pink-100 rounded-2xl p-4 focus:ring-2 focus:ring-pink-300"
          />

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="border border-pink-100 rounded-2xl p-4"
          >
            <option value="">All Difficulty</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-pink-100 rounded-2xl p-4"
          >
            <option value="">All Categories</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border border-pink-100 rounded-2xl p-4"
          >
            <option value="">All Time</option>
            <option value="30">Under 30 mins</option>
            <option value="45">Under 45 mins</option>
            <option value="60">Under 60 mins</option>
          </select>
        </div>
      </div>

      
      {/* Recipes */}
<div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
  {filteredRecipes.map((recipe) => (
    <div
      key={recipe._id}
      className="bg-white rounded-[28px] shadow-xl overflow-hidden transition duration-300 hover:shadow-[0_25px_50px_rgba(255,140,180,0.4)] hover:-translate-y-2"
    >
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={
            recipe.imageURL ||
            "https://via.placeholder.com/600x400/ffe4e6/9d174d?text=No+Image+🍓"
          }
          alt={recipe.title}
          className="w-full h-full object-cover transition duration-500 hover:scale-110"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

        <button
  onClick={() => toggleFavorite(recipe._id)}
  className="absolute top-4 right-4 text-2xl transition transform hover:scale-125 active:scale-95"
>
  {favorites.includes(recipe._id) ? "❤️" : "🤍"}
</button>


        {/* Title */}
        <h3 className="absolute bottom-4 left-4 text-white text-2xl font-semibold drop-shadow-md">
          {recipe.title}
        </h3>
      </div>

      {/* Info Section */}
      <div className="p-6">
        <p className="text-gray-600 mb-3 line-clamp-2">
          {recipe.ingredients?.join(", ")}
        </p>

        <div className="flex justify-between items-center text-sm text-gray-500 mb-5">
          <span>⏱ {recipe.cookingTime || "-"} mins</span>
          <span>{recipe.difficulty}</span>
          {recipe.category && <span>{recipe.category}</span>}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => startEdit(recipe)}
            className="flex-1 bg-pink-500 text-white py-2 rounded-full transition active:scale-95 hover:bg-pink-400"
          >
            Edit
          </button>

          <button
            onClick={() => deleteRecipe(recipe._id)}
            className="flex-1 bg-gray-200 py-2 rounded-full transition active:scale-95 hover:bg-gray-300"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  ))}
</div>

            

      {/* Add Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-gradient-to-b from-pink-50 to-rose-100 p-8 rounded-t-[80px] rounded-b-[35px] w-96 shadow-[0_20px_50px_rgba(255,150,180,0.35)] border border-pink-200 animate-toastPop">

            <h2 className="text-2xl font-semibold text-pink-500 mb-5">
              Add Recipe 🍞🍓
            </h2>

            <input placeholder="Title" className="w-full border p-4 rounded-2xl mb-3"
              onChange={(e)=>setNewRecipe({...newRecipe,title:e.target.value})} />

            <input placeholder="Ingredients (comma separated)" className="w-full border p-4 rounded-2xl mb-3"
              onChange={(e)=>setNewRecipe({...newRecipe,ingredients:e.target.value})} />

            <input placeholder="Cooking Time (mins)" className="w-full border p-4 rounded-2xl mb-3"
              onChange={(e)=>setNewRecipe({...newRecipe,cookingTime:e.target.value})} />

            <input placeholder="Image URL (optional)" className="w-full border p-4 rounded-2xl mb-3"
              onChange={(e)=>setNewRecipe({...newRecipe,imageURL:e.target.value})} />

            <select value={newRecipe.difficulty}
              className="w-full border p-4 rounded-2xl mb-3"
              onChange={(e)=>setNewRecipe({...newRecipe,difficulty:e.target.value})}>
              <option value="" disabled>Select Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select className="w-full border p-4 rounded-2xl mb-5"
              onChange={(e)=>setNewRecipe({...newRecipe,category:e.target.value})}>
              <option value="">Select Category</option>
              {CATEGORY_OPTIONS.map((cat)=>(
                <option key={cat}>{cat}</option>
              ))}
            </select>

            <button onClick={addRecipe}
              className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white py-4 rounded-2xl">
              Save Recipe
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRecipe && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-gradient-to-b from-pink-50 to-rose-100 p-8 rounded-t-[80px] rounded-b-[35px] w-96 shadow-[0_20px_50px_rgba(255,150,180,0.35)] border border-pink-200 animate-toastPop">

            <h2 className="text-2xl font-semibold text-pink-500 mb-5">
              Edit Recipe 🍞🍓
            </h2>

            <input value={editingRecipe.title}
              className="w-full border p-4 rounded-2xl mb-3"
              onChange={(e)=>setEditingRecipe({...editingRecipe,title:e.target.value})}/>

            <input value={editingRecipe.ingredients}
              className="w-full border p-4 rounded-2xl mb-3"
              onChange={(e)=>setEditingRecipe({...editingRecipe,ingredients:e.target.value})}/>

            <input value={editingRecipe.cookingTime}
              className="w-full border p-4 rounded-2xl mb-3"
              onChange={(e)=>setEditingRecipe({...editingRecipe,cookingTime:e.target.value})}/>

            <input value={editingRecipe.imageURL || ""}
              className="w-full border p-4 rounded-2xl mb-3"
              onChange={(e)=>setEditingRecipe({...editingRecipe,imageURL:e.target.value})}/>

            <button onClick={saveEdit}
              className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white py-4 rounded-2xl">
              Save Changes
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
