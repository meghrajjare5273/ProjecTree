export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header */}
      <header className="bg-[#1a1a1a] border-b border-[#333333] py-4 px-6 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-5 w-5 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-6 w-48 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="h-6 w-32 bg-gray-700 rounded animate-pulse"></div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-[#1a1a1a] rounded-lg mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-4 py-3 flex-1 flex justify-center">
                <div className="h-6 w-20 bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-[#1a1a1a] border-[#333333] rounded-lg p-4 flex items-start gap-3"
            >
              <div className="h-10 w-10 rounded-full bg-gray-700 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 w-full bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-3/4 bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-24 bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="h-3 w-3 rounded-full bg-gray-700 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="mt-6 flex justify-center">
          <div className="h-10 w-32 bg-gray-700 rounded animate-pulse"></div>
        </div>
      </main>
    </div>
  );
}
