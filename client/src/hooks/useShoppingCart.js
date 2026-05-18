import { useCallback, useEffect, useMemo, useState } from "react";
import { parseIngredient } from "../utils/ingredientParser";
import { mergeShoppingItems } from "../utils/shoppingList";

const cartKey = (uid) => `shopping_cart_${uid}`;

export function useShoppingCart(user) {
  const [cart, setCart] = useState([]);
  const [checked, setChecked] = useState(new Set());

  useEffect(() => {
    if (!user) {
      setCart([]);
      setChecked(new Set());
      return;
    }
    try {
      const saved = localStorage.getItem(cartKey(user.uid));
      setCart(saved ? JSON.parse(saved) : []);
      const savedChecked = localStorage.getItem(`shopping_checked_${user.uid}`);
      setChecked(savedChecked ? new Set(JSON.parse(savedChecked)) : new Set());
    } catch {
      setCart([]);
      setChecked(new Set());
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(cartKey(user.uid), JSON.stringify(cart));
  }, [cart, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(
      `shopping_checked_${user.uid}`,
      JSON.stringify([...checked])
    );
  }, [checked, user]);

  const mergedItems = useMemo(() => mergeShoppingItems(cart), [cart]);

  const addItems = useCallback((items) => {
    setCart((prev) => [...prev, ...items]);
  }, []);

  const removeItem = useCallback((id) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setCart((prev) =>
      prev.filter((item) => {
        const parsed = parseIngredient(item.text);
        const key = parsed.key || item.text.toLowerCase();
        return key !== id;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setChecked(new Set());
  }, []);

  const importFavorites = useCallback((recipes) => {
    const items = [];
    for (const recipe of recipes) {
      for (const text of recipe.ingredients || []) {
        items.push({ text, recipeTitle: recipe.title });
      }
    }
    setCart((prev) => [...prev, ...items]);
  }, []);

  const toggleChecked = useCallback((id) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearChecked = useCallback(() => setChecked(new Set()), []);

  const exportText = useMemo(() => {
    const lines = mergedItems
      .filter((item) => !checked.has(item.id))
      .map((item) => `• ${item.name}`);
    return lines.length ? lines.join("\n") : "Shopping list is empty!";
  }, [mergedItems, checked]);

  return {
    cart,
    mergedItems,
    checked,
    cartCount: cart.length,
    addItems,
    removeItem,
    clearCart,
    importFavorites,
    toggleChecked,
    clearChecked,
    exportText,
  };
}
