export default function CompleteProfileLoading() {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background Image Placeholder */}
      <div className="absolute inset-0 z-0 bg-gray-900"></div>

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-stretch bg-black/30 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl">
        {/* Left Panel */}
        <div className="lg:w-5/12 p-8 lg:p-12 relative overflow-hidden">
          <div className="relative z-10">
            <div className="h-8 w-48 bg-gray-700 rounded animate-pulse mb-4"></div>
            <div className="h-6 w-64 bg-gray-700 rounded animate-pulse mb-8"></div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl"></div>
        </div>

        {/* Right Panel - Form Section */}
        <div className="lg:w-7/12 p-8 lg:p-12 bg-gray-900/50">
          <div className="space-y-4">
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gray-700 animate-pulse mb-2"></div>
              <div className="h-9 w-32 bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="h-5 w-24 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-11 w-full bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="space-y-1.5">
                <div className="h-5 w-24 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-11 w-full bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="h-5 w-24 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-11 w-full bg-gray-700 rounded animate-pulse"></div>
            </div>

            <div className="space-y-1.5">
              <div className="h-5 w-24 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-11 w-full bg-gray-700 rounded animate-pulse"></div>
            </div>

            <div className="space-y-1.5">
              <div className="h-5 w-24 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-11 w-full bg-gray-700 rounded animate-pulse"></div>
            </div>

            <div className="pt-2">
              <div className="h-11 w-full bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
