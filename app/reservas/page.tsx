import dynamic from "next/dynamic"
import { MainLayout } from "@/components/main-layout"
import { BookingFormSkeleton } from "@/components/skeletons"

// Lazy load del componente pesado
const BookingFormSupabase = dynamic(
  () => import("@/components/booking-form-supabase").then(mod => ({ default: mod.BookingFormSupabase })),
  { 
    ssr: false,
    loading: () => <BookingFormSkeleton />
  }
)

export default function ReservasPage() {
  return (
    <MainLayout 
      showBackButton={true}
      backHref="/"
      title="Reservar Cita"
      subtitle="Agenda tu próxima sesión de uñas"
    >
      <BookingFormSupabase />
    </MainLayout>
  )
}
