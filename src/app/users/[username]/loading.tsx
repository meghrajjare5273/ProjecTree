export default function UserProfileLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex flex-col">
        {/* Profile Header Skeleton */}
        <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl border border-[#333333] p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image Skeleton */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-700 animate-pulse"></div>
            </div>

            {/* Profile Info Skeleton */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="h-7 w-48 bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-5 w-32 bg-gray-700 rounded animate-pulse mb-4"></div>
                  <div className="h-4 w-full bg-gray-700 rounded animate-pulse mb-1"></div>
                  <div className="h-4 w-5/6 bg-gray-700 rounded animate-pulse mb-4"></div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="h-10 w-24 bg-gray-700 rounded animate-pulse"></div>
                  <div className="flex gap-2">
                    <div className="h-9 w-9 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-9 w-9 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* User Details Skeleton */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="h-6 w-24 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-6 w-24 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-700 rounded animate-pulse"></div>
              </div>

              {/* Stats Skeleton */}
              <div className="flex flex-wrap gap-6 mt-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="h-5 w-8 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs Skeleton */}
        <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl border border-[#333333] overflow-hidden">
          <div className="flex justify-between items-center border-b border-[#333333] px-4">
            <div className="flex">
              {[1, 2, 3].map((i) => (
                <div key={i} className="px-4 py-3">
                  <div className="h-5 w-20 bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Posts Grid Skeleton */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-[#252525]/90 backdrop-blur-sm rounded-lg overflow-hidden border border-[#333333]"
                >
                  <div className="h-40 bg-gray-700 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-5 w-3/4 bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-full bg-gray-700 rounded animate-pulse mb-1"></div>
                    <div className="h-4 w-5/6 bg-gray-700 rounded animate-pulse mb-4"></div>
                    <div className="h-3 w-20 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="border-t border-[#333333] p-3 flex justify-between">
                    <div className="flex space-x-3">
                      <div className="h-5 w-5 bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-5 w-5 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="h-5 w-5 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
