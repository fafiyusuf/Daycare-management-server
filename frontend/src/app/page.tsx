import { Hero } from "@/components/Hero"
import { FeatureCards } from "@/components/FeatureCards"
import { Footer } from "@/components/Footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <FeatureCards />
      <Footer />
    </main>
  )
}
