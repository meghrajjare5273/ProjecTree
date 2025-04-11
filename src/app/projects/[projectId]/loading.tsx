import { Card } from "@/components/ui/card";

export default function ProjectLoading() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Card className="bg-[#1a1a1a] border-[#333333] p-6 md:p-8">
          {/* Project Header Skeleton */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="w-24 h-6 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-3/4 h-10 bg-gray-700 rounded animate-pulse"></div>
            <div className="flex flex-wrap gap-2 mt-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-16 h-6 bg-gray-700 rounded animate-pulse"
                ></div>
              ))}
            </div>
            <div className="flex items-center mt-2">
              <div className="h-8 w-8 rounded-full bg-gray-700 animate-pulse"></div>
              <div className="ml-3">
                <div className="h-4 w-24 bg-gray-700 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-16 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Project Gallery Skeleton */}
          <div className="mb-4">
            <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden bg-gray-700 animate-pulse"></div>
          </div>

          {/* Project Description Skeleton */}
          <div className="mb-6">
            <div className="h-6 w-40 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-5/6 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Project Comments Skeleton */}
          <div className="mt-6">
            <div className="h-6 w-40 bg-gray-700 rounded animate-pulse mb-4"></div>
            <div className="mb-6">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-700 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-20 bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="flex justify-end">
                    <div className="h-9 w-32 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#252525]/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-700 animate-pulse"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-3 w-16 bg-gray-700 rounded animate-pulse"></div>
                      </div>
                      <div className="h-4 w-full bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 w-5/6 bg-gray-700 rounded animate-pulse mt-1"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Related Projects Skeleton */}
        <div className="mt-8">
          <div className="h-6 w-40 bg-gray-700 rounded animate-pulse mb-3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-[#1a1a1a] border-[#333333]">
                <div className="h-40 bg-gray-700 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-5 w-3/4 bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-full bg-gray-700 rounded animate-pulse mb-1"></div>
                  <div className="h-4 w-5/6 bg-gray-700 rounded animate-pulse mb-3"></div>
                  <div className="h-8 w-full bg-gray-700 rounded animate-pulse"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
