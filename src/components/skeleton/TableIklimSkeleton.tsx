export default function TableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              {[1, 2, 3, 4, 5, 6].map((i) => <th key={i} className="p-4"><div className="h-4 bg-gray-200 rounded w-full"></div></th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((item) => (
              <tr key={item} className="bg-white">
                <td className="p-4"><div className="h-5 bg-gray-200 rounded w-16"></div></td>
                <td className="p-4"><div className="h-5 bg-gray-200 rounded w-24"></div></td>
                <td className="p-4"><div className="h-5 bg-gray-200 rounded ml-auto w-20"></div></td>
                <td className="p-4"><div className="h-5 bg-gray-200 rounded ml-auto w-16"></div></td>
                <td className="p-4"><div className="h-5 bg-gray-200 rounded ml-auto w-16"></div></td>
                <td className="p-4"><div className="h-8 bg-gray-200 rounded mx-auto w-20"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-100 gap-4">
        <div className="h-4 bg-gray-200 rounded w-48"></div>
        <div className="h-8 bg-gray-200 rounded w-52"></div>
      </div>
    </div>
  );
}
