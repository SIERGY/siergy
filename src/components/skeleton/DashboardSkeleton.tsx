export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* 1. SKELETON HEADER */}
      <div className="bg-gray-200 h-32 rounded-2xl w-full"></div>

      {/* 2. SKELETON KPI CARDS (4 Item) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5"
          >
            {/* Icon Placeholder */}
            <div className="w-14 h-14 bg-gray-200 rounded-xl shrink-0"></div>
            {/* Text Placeholder */}
            <div className="space-y-2 w-full">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. SKELETON CHARTS */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bar Chart Skeleton */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-75 bg-gray-100 rounded-xl w-full"></div>
        </div>
        {/* Pie Chart Skeleton */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="h-62.5 w-62.5 bg-gray-100 rounded-full mx-auto mt-4"></div>
        </div>
      </div>

      {/* 4. SKELETON TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
        </div>
        <div className="p-6 space-y-4">
          {/* Table Rows Placeholder */}
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-12 bg-gray-50 rounded-lg w-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
