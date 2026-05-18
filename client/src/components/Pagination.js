export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-40"
      >
        ← Prev
      </button>

      {start > 1 && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
          >
            1
          </button>
          {start > 2 && <span className="text-gray-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`w-10 h-10 rounded-full transition ${
            p === page
              ? "bg-pink-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200 hover:bg-pink-100 dark:hover:bg-gray-600"
          }`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-gray-400">…</span>}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}
