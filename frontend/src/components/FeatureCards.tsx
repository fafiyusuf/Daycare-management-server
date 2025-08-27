import { Card } from "./ui/Card"

const features = [
  {
    title: "TypeScript",
    description: "Full type safety with excellent IDE support and compile-time error checking.",
    icon: "🔷",
  },
  {
    title: "Tailwind CSS",
    description: "Utility-first CSS framework for rapid UI development with responsive design.",
    icon: "🎨",
  },
  {
    title: "Next.js 15",
    description: "The React framework with App Router, Server Components, and optimized performance.",
    icon: "⚡",
  },
  {
    title: "Modern Tooling",
    description: "ESLint, Prettier, and pnpm for a smooth development experience.",
    icon: "🛠️",
  },
  {
    title: "Responsive Design",
    description: "Mobile-first approach with beautiful designs that work on all devices.",
    icon: "📱",
  },
  {
    title: "Production Ready",
    description: "Optimized build process with automatic code splitting and image optimization.",
    icon: "🚀",
  },
]

export function FeatureCards() {
  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to build modern web apps
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            This starter template includes all the tools and configurations you need to build production-ready
            applications.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={feature.title} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
