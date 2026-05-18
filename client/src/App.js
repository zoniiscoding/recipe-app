import React, { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import api from "./api/client";
import { auth } from "./firebase";
import { EMPTY_RECIPE_FORM, PAGE_SIZE } from "./constants";
import { recipeToForm, recipeToPayload } from "./utils/recipeForm";
import { ingredientsToCartItems } from "./utils/shoppingList";
import { useDarkMode } from "./hooks/useDarkMode";
import { useDebounce } from "./hooks/useDebounce";
import { useShoppingCart } from "./hooks/useShoppingCart";
import AuthModal from "./components/AuthModal";
import RecipeCard from "./components/RecipeCard";
import RecipeFormModal from "./components/RecipeFormModal";
import RecipeDetailModal from "./components/RecipeDetailModal";
import FilterBar from "./components/FilterBar";
import Pagination from "./components/Pagination";
import ShoppingListModal from "./components/ShoppingListModal";
import RecipeSkeleton from "./components/RecipeSkeleton";
import StatsBar from "./components/StatsBar";
import SystemStatusBanner from "./components/SystemStatusBanner";
import { scaleIngredients } from "./utils/scaleIngredients";
import { getErrorMessage } from "./utils/errors";
import "./App.css";

function getUserRating(recipe, uid) {
  if (!uid || !recipe.ratings) return 0;
  return recipe.ratings.find((r) => r.userId === uid)?.value || 0;
}

function App() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [user, setUser] = useState(null);

  const cart = useShoppingCart(user);

  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  const [viewMode, setViewMode] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [ingredientFilter, setIngredientFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");

  const debouncedTitle = useDebounce(titleFilter);
  const debouncedIngredient = useDebounce(ingredientFilter);

  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [newRecipe, setNewRecipe] = useState(EMPTY_RECIPE_FORM);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [viewingRecipe, setViewingRecipe] = useState(null);

  const [showSparkle, setShowSparkle] = useState(false);
  const [showShopping, setShowShopping] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  const showToast = useCallback((message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchRecipes = useCallback(
    async (targetPage = 1) => {
      if (viewMode === "favorites" && favorites.length === 0) {
        setRecipes([]);
        setPagination({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
        setLoading(false);
        return;
      }

      if (viewMode === "mine" && !user) {
        setRecipes([]);
        setPagination({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const params = {
          page: targetPage,
          limit: PAGE_SIZE,
          sortBy,
          title: debouncedTitle || undefined,
          ingredient: debouncedIngredient || undefined,
          category: categoryFilter || undefined,
          difficulty: difficultyFilter || undefined,
          maxTime: timeFilter || undefined,
        };

        if (viewMode === "favorites" && favorites.length > 0) {
          params.favoriteIds = favorites.join(",");
        }
        if (viewMode === "mine" && user) {
          params.createdBy = user.uid;
        }

        const res = await api.get("/recipes", { params });
        setRecipes(res.data.recipes);
        setPagination(res.data.pagination);
        setPage(res.data.pagination.page);
      } catch (error) {
        showToast(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    },
    [
      debouncedTitle,
      debouncedIngredient,
      categoryFilter,
      difficultyFilter,
      timeFilter,
      viewMode,
      favorites,
      user,
      sortBy,
      showToast,
    ]
  );

  const loadRecipeById = useCallback(
    async (id) => {
      try {
        const res = await api.get(`/recipes/${id}`);
        setViewingRecipe(res.data);
      } catch {
        showToast("Recipe not found");
      }
    },
    [showToast]
  );

  useEffect(() => {
    setPage(1);
  }, [
    debouncedTitle,
    debouncedIngredient,
    categoryFilter,
    difficultyFilter,
    timeFilter,
    viewMode,
    sortBy,
  ]);

  useEffect(() => {
    fetchRecipes(page);
  }, [fetchRecipes, page]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get("recipe");
    if (recipeId) loadRecipeById(recipeId);
  }, [loadRecipeById]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    try {
      const saved = localStorage.getItem(`favorites_${user.uid}`);
      setFavorites(saved ? JSON.parse(saved) : []);
    } catch {
      setFavorites([]);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`favorites_${user.uid}`, JSON.stringify(favorites));
  }, [favorites, user]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const canModifyRecipe = (recipe) =>
    user && (!recipe.createdBy || recipe.createdBy === user.uid);

  const deleteRecipe = async (recipe) => {
    if (!window.confirm(`Delete "${recipe.title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/recipes/${recipe._id}`);
      showToast("Recipe deleted", "success");
      if (viewingRecipe?._id === recipe._id) setViewingRecipe(null);
      fetchRecipes(page);
    } catch (error) {
      showToast(getErrorMessage(error));
    }
  };

  const validateForm = (form) => {
    if (!form.title.trim()) {
      showToast("Title is required.");
      return false;
    }
    if (!form.ingredients.trim()) {
      showToast("Please enter at least one ingredient.");
      return false;
    }
    return true;
  };

  const addRecipe = async () => {
    if (!validateForm(newRecipe)) return;
    try {
      await api.post("/recipes", recipeToPayload(newRecipe));
      setNewRecipe(EMPTY_RECIPE_FORM);
      setShowSparkle(true);
      setTimeout(() => {
        setShowSparkle(false);
        setShowForm(false);
        setPage(1);
        fetchRecipes(1);
      }, 900);
      showToast("Recipe added successfully! 🍓", "success");
    } catch (error) {
      showToast(getErrorMessage(error));
    }
  };

  const saveEdit = async () => {
    if (!validateForm(editingRecipe)) return;
    try {
      await api.put(
        `/recipes/${editingRecipe._id}`,
        recipeToPayload(editingRecipe)
      );
      setEditingRecipe(null);
      fetchRecipes(page);
      showToast("Recipe updated successfully! 🍓", "success");
    } catch (error) {
      showToast(getErrorMessage(error));
    }
  };

  const rateRecipe = async (recipeId, value) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    try {
      const res = await api.post(`/recipes/${recipeId}/rate`, { value });
      const updated = res.data;
      setRecipes((prev) =>
        prev.map((r) => (r._id === recipeId ? { ...r, ...updated } : r))
      );
      if (viewingRecipe?._id === recipeId) {
        setViewingRecipe({ ...viewingRecipe, ...updated });
      }
      showToast("Thanks for rating! ⭐", "success");
    } catch (error) {
      showToast(getErrorMessage(error));
    }
  };

  const addRecipeToCart = (recipe) => {
    const base = recipe.servings > 0 ? recipe.servings : 4;
    const scaled = scaleIngredients(recipe.ingredients, base, base);
    cart.addItems(ingredientsToCartItems(scaled, recipe.title));
    showToast("Added to shopping list 🛒", "success");
  };

  const importFavoritesToCart = async () => {
    if (favorites.length === 0) {
      showToast("Favorite some recipes first!");
      return;
    }
    try {
      const res = await api.get("/recipes", {
        params: { favoriteIds: favorites.join(","), limit: 50 },
      });
      cart.importFavorites(res.data.recipes);
      showToast("Favorites added to cart!", "success");
    } catch (error) {
      showToast(getErrorMessage(error));
    }
  };

  const copyShoppingList = async () => {
    try {
      await navigator.clipboard.writeText(cart.exportText);
      showToast("List copied to clipboard!", "success");
    } catch {
      showToast("Could not copy list");
    }
  };

  const tabClass = (mode) =>
    `px-5 py-2 rounded-full transition text-sm ${
      viewMode === mode
        ? "bg-pink-500 text-white"
        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6 relative overflow-hidden transition-colors">
      <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
        <div>
          <h1 className="text-5xl font-bold text-pink-500">🍓 Recipe Garden</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">
            Your personal cookbook — cook, shop & share
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-full text-sm"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          <button
            type="button"
            onClick={() => setShowShopping(true)}
            className="relative bg-gray-200 dark:bg-gray-700 dark:text-gray-100 px-5 py-2 rounded-full text-sm"
          >
            🛒 List
            {cart.mergedItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cart.mergedItems.length}
              </span>
            )}
          </button>

          {user && (
            <button
              type="button"
              onClick={() => {
                setNewRecipe(EMPTY_RECIPE_FORM);
                setShowForm(true);
              }}
              className="bg-pink-500 text-white px-8 py-4 rounded-full shadow-lg hover:bg-pink-400 hover:scale-105 transition"
            >
              + Add Recipe
            </button>
          )}

          {user ? (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {user.displayName || user.email}
              </span>
              <button
                type="button"
                onClick={() => signOut(auth)}
                className="bg-gray-200 dark:bg-gray-700 dark:text-gray-100 px-5 py-2 rounded-full"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuth(true)}
              className="bg-pink-500 text-white px-6 py-3 rounded-full"
            >
              Login
            </button>
          )}
        </div>
      </div>

      <SystemStatusBanner />
      <StatsBar />

      <div className="pointer-events-none fixed inset-0 z-0 opacity-70 dark:opacity-30">
        <div className="absolute animate-floatSlow text-2xl" style={{ top: "12%", left: "8%" }}>🍓</div>
        <div className="absolute animate-float text-xl" style={{ top: "28%", right: "12%" }}>🍓</div>
        <div className="absolute animate-floatSlow text-xl" style={{ bottom: "20%", left: "14%" }}>🍓</div>
        <div className="absolute animate-float text-lg" style={{ bottom: "10%", right: "18%" }}>🍓</div>
      </div>

      <div className="max-w-6xl mx-auto mb-6 relative z-10 flex flex-wrap gap-3 items-center">
        <button type="button" onClick={() => setViewMode("all")} className={tabClass("all")}>
          All recipes
        </button>
        <button
          type="button"
          onClick={() => (user ? setViewMode("mine") : setShowAuth(true))}
          className={tabClass("mine")}
        >
          My recipes
        </button>
        <button type="button" onClick={() => setViewMode("favorites")} className={tabClass("favorites")}>
          Favorites ❤️
        </button>
        {!loading && pagination.total > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
            {pagination.total} recipe{pagination.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <FilterBar
        titleFilter={titleFilter}
        setTitleFilter={setTitleFilter}
        ingredientFilter={ingredientFilter}
        setIngredientFilter={setIngredientFilter}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <RecipeSkeleton key={i} />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🍓</div>
            <h2 className="text-2xl font-semibold text-pink-500 mb-2">No recipes found</h2>
            <p className="text-gray-500 dark:text-gray-400">
              {viewMode === "favorites"
                ? "Save some favorites with the heart icon."
                : viewMode === "mine"
                  ? "Create your first recipe with + Add Recipe."
                  : "Try adjusting your filters or add a new recipe."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  isFavorite={favorites.includes(recipe._id)}
                  canModify={canModifyRecipe(recipe)}
                  onView={() => setViewingRecipe(recipe)}
                  onToggleFavorite={() => toggleFavorite(recipe._id)}
                  onAddToCart={() => addRecipeToCart(recipe)}
                  onEdit={() =>
                    setEditingRecipe({ ...recipeToForm(recipe), _id: recipe._id })
                  }
                  onDelete={() => deleteRecipe(recipe)}
                />
              ))}
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {showForm && user && (
        <RecipeFormModal
          title="Add Recipe 🍓"
          form={newRecipe}
          onChange={setNewRecipe}
          onSubmit={addRecipe}
          onClose={() => setShowForm(false)}
          submitLabel="Save Recipe"
          user={user}
          onToast={showToast}
        />
      )}

      {editingRecipe && user && (
        <RecipeFormModal
          title="Edit Recipe 🍓"
          form={editingRecipe}
          onChange={setEditingRecipe}
          onSubmit={saveEdit}
          onClose={() => setEditingRecipe(null)}
          submitLabel="Save Changes"
          user={user}
          onToast={showToast}
        />
      )}

      {viewingRecipe && (
        <RecipeDetailModal
          recipe={viewingRecipe}
          user={user}
          onClose={() => setViewingRecipe(null)}
          isFavorite={favorites.includes(viewingRecipe._id)}
          onToggleFavorite={() => toggleFavorite(viewingRecipe._id)}
          onAddToCart={(items) => {
            cart.addItems(items);
            showToast("Added to shopping list 🛒", "success");
          }}
          onRate={(value) => rateRecipe(viewingRecipe._id, value)}
          userRating={getUserRating(viewingRecipe, user?.uid)}
        />
      )}

      {showShopping && (
        <ShoppingListModal
          items={cart.mergedItems}
          cartCount={cart.cart.length}
          checked={cart.checked}
          onClose={() => setShowShopping(false)}
          onToggleChecked={cart.toggleChecked}
          onRemoveItem={cart.removeItem}
          onClearCart={() => {
            if (window.confirm("Clear entire shopping list?")) cart.clearCart();
          }}
          onCopyList={copyShoppingList}
          onImportFavorites={importFavoritesToCart}
        />
      )}

      {showSparkle && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none">
          <div className="text-6xl animate-sparklePop">✨🍓✨</div>
        </div>
      )}

      {toast && (
        <div className="fixed top-6 right-6 z-[200] animate-toastSlide">
          <div
            className={`px-6 py-4 rounded-2xl shadow-lg text-white ${
              toast.type === "success" ? "bg-green-500" : "bg-pink-500"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onToast={showToast} />
      )}
    </div>
  );
}

export default App;
