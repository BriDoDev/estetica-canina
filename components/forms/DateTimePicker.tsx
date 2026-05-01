'use client'

import { useState, useRef, useEffect } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { es } from 'react-day-picker/locale'
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
]

interface DateTimePickerProps {
  value: string
  onChange: (isoString: string) => void
  error?: boolean
  touched?: boolean
  minDate?: Date
}

export function DateTimePicker({
  value,
  onChange,
  error,
  touched,
  minDate = new Date(Date.now() + 60 * 60 * 1000),
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<'calendar' | 'time'>('calendar')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined,
  )
  const [selectedTime, setSelectedTime] = useState<string>(
    value
      ? `${String(new Date(value).getHours()).padStart(2, '0')}:${String(new Date(value).getMinutes()).padStart(2, '0')}`
      : '',
  )
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const formatDisplay = (): string => {
    if (!selectedDate) return ''
    if (!selectedTime) {
      return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(selectedDate)
    }
    return `${new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(selectedDate)} · ${selectedTime}`
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    setSelectedDate(date)
    if (TIME_SLOTS.length > 0) {
      setView('time')
    } else {
      const iso = date.toISOString()
      onChange(iso)
      setIsOpen(false)
    }
  }

  const handleTimeSelect = (time: string) => {
    if (!selectedDate) return
    setSelectedTime(time)
    const [hours, minutes] = time.split(':').map(Number)
    const dt = new Date(selectedDate)
    dt.setHours(hours, minutes, 0, 0)
    onChange(dt.toISOString())
    setIsOpen(false)
  }

  const borderClass = cn(
    'min-h-[44px] flex items-center gap-2 w-full rounded-xl border bg-white px-3 py-2 text-sm cursor-pointer transition-colors hover:border-[#FF8C7A]',
    error
      ? 'border-red-400'
      : touched && !error
        ? 'border-green-400'
        : 'border-slate-200',
  )

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className={borderClass}
        onClick={() => {
          setView('calendar')
          setIsOpen(!isOpen)
        }}
      >
        <Calendar className="h-4 w-4 flex-shrink-0 text-slate-400" />
        <span className={selectedDate ? 'text-slate-800' : 'text-slate-400'}>
          {selectedDate ? formatDisplay() : 'Seleccionar fecha y hora'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[300px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg sm:min-w-[340px]">
          {view === 'calendar' && (
            <div>
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(d: Date | undefined) => handleDateSelect(d)}
                locale={es}
                disabled={{ before: minDate }}
                showOutsideDays={false}
                classNames={{
                  root: 'p-3',
                  months: 'flex flex-col',
                  month_caption: 'flex items-center justify-center h-10 px-2',
                  nav: 'flex items-center gap-1 absolute right-3',
                  button_previous: cn(
                    'inline-flex items-center justify-center h-7 w-7 rounded-lg text-slate-600 hover:bg-slate-100',
                  ),
                  button_next: cn(
                    'inline-flex items-center justify-center h-7 w-7 rounded-lg text-slate-600 hover:bg-slate-100',
                  ),
                  weekdays: 'grid grid-cols-7 mt-2',
                  weekday: 'text-xs font-medium text-slate-400 text-center h-8',
                  weeks: '',
                  week: 'grid grid-cols-7',
                  day: 'text-center text-sm h-9 w-9 rounded-lg aria-selected:bg-[#FF8C7A] aria-selected:text-white hover:bg-[#FF8C7A]/10 transition-colors',
                  day_button: 'w-full h-full flex items-center justify-center',
                  today: 'font-bold text-[#FF8C7A]',
                  outside: 'text-slate-300',
                  disabled: 'text-slate-300 cursor-not-allowed',
                }}
                components={{
                  Chevron: ({ orientation }) =>
                    orientation === 'left' ? (
                      <ChevronLeft className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    ),
                }}
              />
              {TIME_SLOTS.length > 0 && (
                <button
                  type="button"
                  disabled={!selectedDate}
                  onClick={() => setView('time')}
                  className="flex w-full items-center justify-center gap-2 border-t border-slate-100 py-2.5 text-sm font-medium text-[#FF8C7A] transition-colors hover:bg-[#FF8C7A]/5 disabled:opacity-40"
                >
                  <Clock className="h-4 w-4" />
                  {selectedTime ? `Hora: ${selectedTime}` : 'Seleccionar hora'}
                </button>
              )}
            </div>
          )}

          {view === 'time' && (
            <div>
              <button
                type="button"
                onClick={() => setView('calendar')}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
                {selectedDate
                  ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(selectedDate)
                  : 'Volver al calendario'}
              </button>
              <div className="grid grid-cols-3 gap-1.5 border-t border-slate-100 p-3">
                {TIME_SLOTS.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleTimeSelect(time)}
                    className={cn(
                      'rounded-lg px-2 py-2 text-sm font-medium transition-colors',
                      selectedTime === time
                        ? 'bg-[#FF8C7A] text-white'
                        : 'text-slate-700 hover:bg-[#FF8C7A]/10',
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
