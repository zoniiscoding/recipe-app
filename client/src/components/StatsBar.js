import { useEffect, useState } from "react";
import api from "../api/client";

export default function StatsBar() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get("/recipes/stats/summary")
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  if (!stats) return null;

  return (
    <div className="max-w-6xl mx-auto mb-8 relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-2xl p-4 text-center shadow">
        <p className="text-2xl font-bold text-pink-500">{stats.total}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Recipes</p>
      </div>
      {stats.avgCookingTime != null && (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-2xl p-4 text-center shadow">
          <p className="text-2xl font-bold text-pink-500">{stats.avgCookingTime}m</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Avg cook time</p>
        </div>
      )}
      {stats.topCategories?.slice(0, 2).map((cat) => (
        <div
          key={cat._id}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-2xl p-4 text-center shadow"
        >
          <p className="text-lg font-bold text-pink-500 truncate">{cat._id}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {cat.count} recipe{cat.count !== 1 ? "s" : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
