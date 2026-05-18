export default function RecipeSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-[28px] shadow-xl overflow-hidden animate-pulse">
      <div className="h-56 bg-gray-200 dark:bg-gray-700" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="flex gap-2 pt-2">
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-full flex-1" />
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-full flex-1" />
        </div>
      </div>
    </div>
  );
}
