import { Service } from "@/lib/database.types"

interface ServiceLegendsProps {
  service: Service
  className?: string
}

export function ServiceLegends({ service, className = "" }: ServiceLegendsProps) {
  const legends: string[] = []
  
  if (service.has_retiro) legends.push("Incluye retiro")
  if (service.has_diseno) legends.push("Incluye diseño")
  
  if (legends.length === 0) return null
  
  return (
    <p className={`text-xs italic text-muted-foreground ${className}`}>
      {legends.join(" • ")}
    </p>
  )
}
