import { Card } from "@/components/ui/card";

export default function CreatePostLoading() {
  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header Skeleton */}
      <header className="bg-[#1a1a1a] border-b border-[#333333] py-4 px-6 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-5 w-5 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-6 w-48 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="h-6 w-32 bg-gray-700 rounded animate-pulse"></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Card className="bg-[#1a1a1a] border-[#333333] overflow-hidden">
          <div className="p-4">
            <div className="flex items-center mb-3">
              <div className="h-5 w-5 bg-gray-700 rounded animate-pulse mr-2"></div>
              <div className="h-5 w-32 bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Tabs Skeleton */}
            <div className="mb-8">
              <div className="grid w-full grid-cols-2 bg-[#252525] p-1 rounded-lg">
                <div className="h-9 w-full bg-gray-700 rounded animate-pulse"></div>
                <div className="h-9 w-full bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Form Fields Skeleton */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="h-5 w-24 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-700 rounded animate-pulse"></div>
              </div>

              <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-32 w-full bg-gray-700 rounded animate-pulse"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-5 w-24 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-24 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-5 w-24 bg-gray-700 rounded animate-pulse"></div>
                <div className="border-2 border-dashed border-[#333333] rounded-lg p-6 flex flex-col items-center justify-center gap-2">
                  <div className="h-10 w-10 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-5 w-48 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-64 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-700 animate-pulse"></div>
                  <div className="h-5 w-32 bg-gray-700 rounded animate-pulse"></div>
                </div>

                <div className="flex gap-3">
                  <div className="h-9 w-20 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-9 w-28 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
