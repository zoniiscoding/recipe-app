import React, { useState } from "react";
import { CATEGORY_OPTIONS } from "../constants";
import { uploadRecipeImage } from "../utils/uploadImage";

const labelClass = "text-sm text-gray-500 dark:text-gray-400";
const fieldClass =
  "w-full border border-gray-200 dark:border-gray-600 p-4 rounded-2xl mb-3 mt-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100";

export default function RecipeFormModal({
  title,
  form,
  onChange,
  onSubmit,
  onClose,
  submitLabel,
  user,
  onToast,
}) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadRecipeImage(file, user.uid);
      onChange({ ...form, imageURL: url });
      onToast("Image uploaded!", "success");
    } catch (error) {
      onToast(error.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-gray-900 p-8 rounded-[28px] w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold text-pink-500 mb-5">{title}</h2>

        <label className={labelClass}>Title *</label>
        <input
          placeholder="Title"
          className={fieldClass}
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
        />

        <label className={labelClass}>Description</label>
        <textarea
          placeholder="Short description"
          className={`${fieldClass} resize-none`}
          rows={2}
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
        />

        <label className={labelClass}>Ingredients * (comma separated)</label>
        <input
          placeholder="e.g. flour, sugar, eggs"
          className={fieldClass}
          value={form.ingredients}
          onChange={(e) => onChange({ ...form, ingredients: e.target.value })}
        />

        <label className={labelClass}>Instructions (one step per line)</label>
        <textarea
          placeholder={"Preheat oven to 350°F\nMix dry ingredients\nBake 25 minutes"}
          className={`${fieldClass} resize-none`}
          rows={4}
          value={form.steps}
          onChange={(e) => onChange({ ...form, steps: e.target.value })}
        />

        <label className={labelClass}>Servings</label>
        <input
          type="number"
          min="1"
          placeholder="4"
          className={fieldClass}
          value={form.servings}
          onChange={(e) => onChange({ ...form, servings: e.target.value })}
        />

        <label className={labelClass}>Prep time (mins)</label>
        <input
          type="number"
          min="0"
          placeholder="15"
          className={fieldClass}
          value={form.prepTime}
          onChange={(e) => onChange({ ...form, prepTime: e.target.value })}
        />

        <label className={labelClass}>Cooking time (mins)</label>
        <input
          type="number"
          min="1"
          placeholder="30"
          className={fieldClass}
          value={form.cookingTime}
          onChange={(e) => onChange({ ...form, cookingTime: e.target.value })}
        />

        <label className={labelClass}>Recipe photo</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className={`${fieldClass} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-100 file:text-pink-600 dark:file:bg-pink-900 dark:file:text-pink-200`}
          onChange={handleImageUpload}
          disabled={uploading}
        />
        {uploading && (
          <p className="text-sm text-pink-500 mb-2">Uploading image…</p>
        )}

        <label className={labelClass}>Or image URL</label>
        <input
          placeholder="https://..."
          className={fieldClass}
          value={form.imageURL}
          onChange={(e) => onChange({ ...form, imageURL: e.target.value })}
        />
        {form.imageURL && (
          <img
            src={form.imageURL}
            alt="Preview"
            className="w-full h-32 object-cover rounded-2xl mb-3"
          />
        )}

        <label className={labelClass}>Difficulty</label>
        <select
          value={form.difficulty}
          className={fieldClass}
          onChange={(e) => onChange({ ...form, difficulty: e.target.value })}
        >
          <option value="">Select difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <label className={labelClass}>Category</label>
        <select
          value={form.category}
          className={`${fieldClass} mb-5`}
          onChange={(e) => onChange({ ...form, category: e.target.value })}
        >
          <option value="">Select category</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onSubmit}
          disabled={uploading}
          className="w-full bg-pink-500 text-white py-3 rounded-full hover:bg-pink-400 transition disabled:opacity-50"
        >
          {submitLabel}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-3 text-gray-500 dark:text-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
