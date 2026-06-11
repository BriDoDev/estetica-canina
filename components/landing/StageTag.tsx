interface StageTagProps {
  n: 1 | 2 | 3 | 4
  label: string
  light?: boolean
}

export function StageTag({ n, label, light = false }: StageTagProps) {
  return (
    <span className={`stage-tag${light ? ' stage-tag--light' : ''}`}>
      <span className="stage-tag__num">{n}</span>
      {label}
    </span>
  )
}
