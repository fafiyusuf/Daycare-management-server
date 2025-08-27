import { Button } from "./ui/Button"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl animate-fade-in">
            Next.js with <span className="text-primary-600">TypeScript</span> &{" "}
            <span className="text-primary-600">Tailwind</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 animate-slide-up">
            A modern, production-ready starter template with TypeScript for type safety and Tailwind CSS for beautiful,
            responsive designs. Built with Next.js 15 and the App Router.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6 animate-slide-up">
            <Button variant="primary" size="lg">
              Get Started
            </Button>
            <Button variant="secondary" size="lg">
              View Documentation
            </Button>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary-400 to-primary-600 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
      </div>
    </section>
  )
}
