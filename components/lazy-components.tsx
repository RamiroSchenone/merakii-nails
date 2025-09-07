"use client"

import dynamic from "next/dynamic"

// Lazy load components para el panel de admin
export const ReservationsGridAdmin = dynamic(
  () => import("@/components/reservations-grid-admin").then(mod => ({ default: mod.ReservationsGridAdmin })),
  { ssr: false }
)

export const ServicesManagementAdmin = dynamic(
  () => import("@/components/services-management-admin").then(mod => ({ default: mod.ServicesManagementAdmin })),
  { ssr: false }
)

export const PortfolioManagementAdmin = dynamic(
  () => import("@/components/portfolio-management-admin").then(mod => ({ default: mod.PortfolioManagementAdmin })),
  { ssr: false }
)

export const WorkingHoursConfig = dynamic(
  () => import("@/components/working-hours-config").then(mod => ({ default: mod.WorkingHoursConfig })),
  { ssr: false }
)