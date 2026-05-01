'use client'

import { useState, useRef, useCallback } from 'react'
import { Scissors, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PreviewEntry {
  styleId: string
  name: string
  description: string
  imageUrl: string
}

interface BeforeAfterScrollerProps {
  originalImage: string
  previews: PreviewEntry[]
  selectedStyleId: string | null
  onSelectStyle: (styleId: string) => void
  isSelectable: boolean
}

export function BeforeAfterScroller({
  originalImage,
  previews,
  selectedStyleId,
  onSelectStyle,
  isSelectable,
}: BeforeAfterScrollerProps) {
  const [activeStyleId, setActiveStyleId] = useState<string | null>(
    previews[0]?.styleId ?? null,
  )
  const [sliderPos, setSliderPos] = useState(50)
  const isDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const activePreview = previews.find((p) => p.styleId === activeStyleId)

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
      setSliderPos((x / rect.width) * 100)
    },
    [],
  )

  const handleMouseDown = () => {
    isDragging.current = true
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return
    handleMove(e.clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX)
  }

  return (
    <div className="space-y-3">
      {/* Comparison scroller */}
      <div
        ref={containerRef}
        className="relative w-full select-none overflow-hidden rounded-xl bg-slate-100"
        style={{ aspectRatio: '1 / 1' }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onTouchMove={handleTouchMove}
      >
        {/* After image (full width behind) */}
        {activePreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activePreview.imageUrl}
            alt={activePreview.name}
            className="absolute inset-0 h-full w-full object-contain"
            draggable={false}
          />
        )}

        {/* Before image (clipped from right) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalImage}
            alt="Original"
            className="absolute inset-0 h-full w-full object-contain"
            draggable={false}
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          />
        </div>

        {/* Slider line */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white shadow-lg"
          style={{ left: `${sliderPos}%` }}
        />

        {/* Slider handle */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#FF8C7A] shadow-lg">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <path d="M8 5l7 7-7 7" />
              <path d="M16 5l-7 7 7 7" />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white">
          {activePreview ? activePreview.name : 'Después'}
        </div>
        <div className="pointer-events-none absolute bottom-3 right-3 rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white">
          Original
        </div>
      </div>

      {/* Style selector buttons (only if more than 1 preview) */}
      {previews.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((preview) => {
            const isActive = preview.styleId === activeStyleId
            const isSelected = preview.styleId === selectedStyleId
            return (
              <button
                key={preview.styleId}
                type="button"
                onClick={() => setActiveStyleId(preview.styleId)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all',
                  isActive
                    ? 'border-[#FF8C7A] bg-[#FF8C7A]/10 text-[#FF8C7A]'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300',
                )}
              >
                <Scissors className="h-3 w-3" />
                {preview.name}
              </button>
            )
          })}
        </div>
      )}

      {/* Select button (if multiple previews and selectable) */}
      {isSelectable && activePreview && previews.length >= 1 && (
        <button
          type="button"
          onClick={() => onSelectStyle(activePreview.styleId)}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all',
            selectedStyleId === activePreview.styleId
              ? 'border-green-400 bg-green-50 text-green-700'
              : 'border-[#FF8C7A] bg-white text-[#FF8C7A] hover:bg-[#FF8C7A]/5',
          )}
        >
          {selectedStyleId === activePreview.styleId ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Corte seleccionado: {activePreview.name}
            </>
          ) : (
            <>
              <Scissors className="h-4 w-4" />
              Elegir este corte: {activePreview.name}
            </>
          )}
        </button>
      )}
    </div>
  )
}
