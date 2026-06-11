import type { IconName } from './IconSprite'

interface IconProps {
  name: IconName
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Icon({ name, className, size = 'md' }: IconProps) {
  const sizeClass = size === 'md' ? 'ds-icon' : `ds-icon ds-icon--${size}`
  return (
    <svg className={className ? `${sizeClass} ${className}` : sizeClass} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  )
}
