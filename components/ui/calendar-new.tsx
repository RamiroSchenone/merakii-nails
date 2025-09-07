"use client"

import { DayPicker } from 'react-day-picker'
import { es } from 'date-fns/locale'
import 'react-day-picker/dist/style.css'
import { cn } from '@/lib/utils'

interface CalendarProps {
  mode?: 'single' | 'multiple' | 'range'
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  className?: string
  workingDays?: number[] // Array de días de la semana que se trabaja (0 = domingo, 1 = lunes, etc.)
}

export function Calendar({
  mode = 'single',
  selected,
  onSelect,
  disabled,
  className,
  workingDays = [1, 2, 3, 4, 5, 6], // Por defecto trabaja de lunes a sábado
}: CalendarProps) {
  // Función para determinar si una fecha debe estar deshabilitada
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

  return (
    <div className={cn('rounded-xl border border-border bg-card p-4 w-full', className)}>
      <DayPicker
        mode={mode}
        selected={selected}
        onSelect={onSelect}
        disabled={isDateDisabled}
        locale={es}
        showOutsideDays={true}
        fixedWeeks={true}
        classNames={{
          months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
          month: 'space-y-4 w-full',
          caption: 'flex justify-center pt-1 relative items-center mb-4',
          caption_label: 'text-lg font-semibold text-card-foreground',
          nav: 'space-x-1 flex items-center',
          nav_button: cn(
            'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:pointer-events-none disabled:opacity-50',
            'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
            'h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-primary/10'
          ),
          nav_button_previous: 'absolute left-1',
          nav_button_next: 'absolute right-1',
          table: 'w-full border-collapse',
          head_row: 'flex mb-2',
          head_cell: 'text-muted-foreground rounded-md font-medium text-sm text-center flex-1',
          row: 'flex w-full mt-1',
          cell: cn(
            'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1',
            '[&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50',
            '[&:has([aria-selected].day-range-end)]:rounded-r-md'
          ),
          day: cn(
            'inline-flex items-center justify-center rounded-md text-sm font-normal ring-offset-background',
            'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30',
            'hover:bg-accent hover:text-accent-foreground',
            'h-10 w-10 p-0 font-normal',
            // Estilos mejorados para selección - sin círculo azul
            'aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:shadow-sm',
            'aria-selected:border-2 aria-selected:border-primary/30'
          ),
          day_range_end: 'day-range-end',
          day_selected: cn(
            'bg-primary text-primary-foreground shadow-sm',
            'hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
            'border-2 border-primary/30 font-semibold'
          ),
          day_today: 'bg-accent text-accent-foreground font-semibold',
          day_outside: 'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
          day_disabled: 'text-muted-foreground opacity-40 cursor-not-allowed bg-muted/20',
          day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
          day_hidden: 'invisible',
        }}
      />
    </div>
  )
}
