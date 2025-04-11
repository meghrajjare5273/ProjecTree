export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-[#121212]">
      {/* Sidebar Skeleton */}
      <div className="fixed top-0 left-0 z-40 w-[280px] h-screen bg-[#1a1a1a] border-r border-[#333333]">
        <div className="p-6 flex items-center justify-center">
          <div className="h-8 w-40 bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="px-6 py-4 flex flex-col items-center border-b border-[#333333]">
          <div className="w-20 h-20 rounded-full bg-gray-700 animate-pulse mb-3"></div>
          <div className="h-5 w-24 bg-gray-700 animate-pulse mb-1"></div>
          <div className="h-4 w-20 bg-gray-700 animate-pulse mb-3"></div>
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="h-5 w-8 bg-gray-700 animate-pulse mb-1"></div>
                <div className="h-3 w-12 bg-gray-700 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="py-6 px-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 bg-gray-700 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-[280px]">
        {/* Navbar Skeleton */}
        <header className="bg-[#1a1a1a]/80 backdrop-blur-md border-b border-[#333333] py-4 px-6 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="flex-1">
              <div className="h-6 w-32 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-48 bg-gray-700 rounded animate-pulse mt-2"></div>
            </div>
            <div className="hidden md:flex flex-1 justify-center">
              <div className="h-10 w-full max-w-md bg-gray-700 rounded-full animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2 flex-1 justify-end">
              <div className="h-10 w-10 bg-gray-700 rounded-full animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-700 rounded-full animate-pulse"></div>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Main Feed Skeleton */}
            <div className="flex-1 order-2 md:order-1">
              <div className="bg-[#1a1a1a] rounded-lg mb-6 overflow-hidden">
                <div className="flex overflow-x-auto">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="px-4 py-3 flex-1 flex justify-center"
                    >
                      <div className="h-6 w-20 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="h-6 w-24 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-700 rounded animate-pulse"></div>
              </div>

              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-[#1a1a1a] border-[#333333] rounded-lg overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse"></div>
                        <div className="ml-3">
                          <div className="h-4 w-24 bg-gray-700 animate-pulse mb-1"></div>
                          <div className="h-3 w-16 bg-gray-700 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="h-5 w-3/4 bg-gray-700 animate-pulse mb-2"></div>
                      <div className="h-4 w-full bg-gray-700 animate-pulse mb-1"></div>
                      <div className="h-4 w-5/6 bg-gray-700 animate-pulse mb-4"></div>
                    </div>
                    <div className="h-40 bg-gray-700 animate-pulse"></div>
                    <div className="border-t border-[#333333] p-3 flex justify-between">
                      <div className="flex space-x-4">
                        <div className="w-8 h-8 bg-gray-700 animate-pulse rounded"></div>
                        <div className="w-8 h-8 bg-gray-700 animate-pulse rounded"></div>
                      </div>
                      <div className="w-8 h-8 bg-gray-700 animate-pulse rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar Skeleton */}
            <div className="w-full md:w-80 order-1 md:order-2">
              <div className="bg-[#1a1a1a] border-[#333333] rounded-lg mb-6">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-gray-700 animate-pulse"></div>
                    <div className="flex-1 h-10 bg-gray-700 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-8 w-24 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-8 w-24 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] border-[#333333] rounded-lg mb-6">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-5 w-32 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-5 w-5 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-10 bg-gray-700 rounded animate-pulse"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] border-[#333333] rounded-lg">
                <div className="p-4">
                  <div className="h-5 w-32 bg-gray-700 rounded animate-pulse mb-4"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-700 animate-pulse"></div>
                          <div className="ml-3">
                            <div className="h-4 w-24 bg-gray-700 animate-pulse mb-1"></div>
                            <div className="h-3 w-16 bg-gray-700 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="h-8 w-20 bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
    