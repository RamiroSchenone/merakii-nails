"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SimpleCalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  workingDays?: number[] // Array de días de la semana que se trabaja (0 = domingo, 1 = lunes, etc.)
  className?: string
}

const DAYS_OF_WEEK = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']
const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]

export function SimpleCalendar({
  selected,
  onSelect,
  disabled,
  workingDays = [1, 2, 3, 4, 5, 6], // Por defecto trabaja de lunes a sábado
  className
}: SimpleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Deshabilitar fechas pasadas
    if (date < today) {
      return true
    }
    
    // Deshabilitar días que no se trabajan
    const dayOfWeek = date.getDay()
    if (workingDays && !workingDays.includes(dayOfWeek)) {
      return true
    }
    
    // Aplicar función disabled personalizada si existe
    if (disabled) {
      return disabled(date)
    }
    
    return false
  }

  const isSelected = (date: Date) => {
    if (!selected) return false
    return date.toDateString() === selected.toDateString()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Días del mes anterior
    const prevMonth = new Date(year, month - 1, 0)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonth.getDate() - i))
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    // Días del mes siguiente para completar la grilla
    const remainingDays = 42 - days.length // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      days.push(new Date(year, month + 1, day))
    }
    
    return days
  }

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return
    onSelect?.(date)
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const days = getDaysInMonth(currentDate)
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  return (
    <div className={cn('rounded-xl border border-border bg-card p-4 w-full max-w-md mx-auto', className)}>
      {/* Header con mes/año y flechas */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPreviousMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-lg font-semibold text-card-foreground">
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Grilla de días */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentMonth
          const isDisabled = isDateDisabled(date)
          const isSelectedDate = isSelected(date)
          const isTodayDate = isToday(date)

          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => handleDateClick(date)}
              disabled={isDisabled}
              className={cn(
                'h-10 w-10 p-0 text-sm font-normal',
                !isCurrentMonth && 'text-muted-foreground opacity-50',
                isDisabled && 'opacity-30 cursor-not-allowed bg-muted/20',
                isTodayDate && !isSelectedDate && 'bg-accent text-accent-foreground font-semibold',
                isSelectedDate && 'bg-primary text-primary-foreground font-semibold shadow-sm border-2 border-primary/30',
                !isDisabled && !isSelectedDate && 'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {date.getDate()}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
