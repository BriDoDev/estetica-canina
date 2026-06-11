// Shared mapping from appointment status (DB enum) -> { label, DS class }.
// Use across dashboard/appointments/customer pages so badges look identical
// without each component maintaining its own color map.

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled'

interface StatusMeta {
  label: string
  dsClass: string
}

const STATUS_MAP: Record<AppointmentStatus, StatusMeta> = {
  pending: { label: 'Pendiente', dsClass: 'ds-status ds-status--pendiente' },
  confirmed: { label: 'Confirmada', dsClass: 'ds-status ds-status--confirmada' },
  in_progress: { label: 'En proceso', dsClass: 'ds-status ds-status--proceso' },
  completed: { label: 'Completada', dsClass: 'ds-status ds-status--completada' },
  cancelled: { label: 'Cancelada', dsClass: 'ds-status ds-status--cancelada' },
  rescheduled: { label: 'Reagendada', dsClass: 'ds-status ds-status--reagendada' },
}

export function getStatusMeta(status: string | null | undefined): StatusMeta {
  if (!status) return STATUS_MAP.pending
  return STATUS_MAP[status as AppointmentStatus] ?? STATUS_MAP.pending
}
