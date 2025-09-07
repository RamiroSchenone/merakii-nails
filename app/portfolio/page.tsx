import dynamic from "next/dynamic"
import { MainLayout } from "@/components/main-layout"
import { PortfolioGridSkeleton } from "@/components/skeletons"

// Lazy load del componente pesado
const PortfolioGridSupabase = dynamic(
  () => import("@/components/portfolio-grid-supabase").then(mod => ({ default: mod.PortfolioGridSupabase })),
  { 
    ssr: false,
    loading: () => <PortfolioGridSkeleton />
  }
)

export default function PortfolioPage() {
  return (
    <MainLayout
      showBackButton={true}
      backHref="/"
      title="Portfolio"
      subtitle="Descubre nuestros trabajos más destacados"
    >
      <PortfolioGridSupabase />
    </MainLayout>
  )
}
