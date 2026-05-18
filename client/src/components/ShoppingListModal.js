export default function ShoppingListModal({
  items,
  onClose,
  checked,
  onToggleChecked,
  onRemoveItem,
  onClearCart,
  onCopyList,
  onImportFavorites,
  cartCount,
}) {
  const unchecked = items.filter((item) => !checked.has(item.id)).length;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-[28px] w-full max-w-lg shadow-xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold text-pink-500">🛒 Shopping List</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {unchecked} to buy · {cartCount} items in cart (smart-merged)
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              onClick={onImportFavorites}
              className="text-xs px-3 py-1.5 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300"
            >
              + From favorites
            </button>
            <button
              type="button"
              onClick={onCopyList}
              className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              Copy list
            </button>
            <button
              type="button"
              onClick={onClearCart}
              className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-red-500"
            >
              Clear all
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {items.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Your cart is empty. Open a recipe and tap &quot;Add to list&quot;, or import favorites.
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => {
                const isChecked = checked.has(item.id);
                return (
                  <li
                    key={item.id}
                    className={`flex gap-3 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 ${
                      isChecked ? "opacity-50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleChecked(item.id)}
                      className="mt-1 w-5 h-5 accent-pink-500 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-gray-800 dark:text-gray-100 ${
                          isChecked ? "line-through" : ""
                        }`}
                      >
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        From: {item.recipes.join(", ")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-500 text-sm shrink-0"
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
