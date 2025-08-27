export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Next.js with TypeScript & Tailwind!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Next.js 15</h2>
            <p className="text-gray-600">
              The React framework for production with App Router, Server Components, and more.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">TypeScript</h2>
            <p className="text-gray-600">
              Type-safe development with excellent IDE support and compile-time error checking.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Tailwind CSS</h2>
            <p className="text-gray-600">
              Utility-first CSS framework for rapid UI development with responsive design.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </main>
  )
}
