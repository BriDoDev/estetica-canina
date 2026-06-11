// Inline SVG sprite for the admin/dashboard design system.
// Rendered once at the top of the admin layout; <Icon name="…" /> references
// these symbols via <use href="#i-NAME" />. Kebab-case SVG attributes are kept
// via dangerouslySetInnerHTML to avoid converting every property to camelCase.

const SPRITE = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
  <symbol id="i-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3-3"></path></symbol>
  <symbol id="i-bell" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"></path><path d="M10 21a2 2 0 0 0 4 0"></path></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></symbol>
  <symbol id="i-chevron-d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></symbol>
  <symbol id="i-chevron-r" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"></path></symbol>
  <symbol id="i-chevron-l" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"></path></symbol>
  <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4 10-10"></path></symbol>
  <symbol id="i-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18"></path></symbol>
  <symbol id="i-dots" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="1.4"></circle><circle cx="12" cy="12" r="1.4"></circle><circle cx="19" cy="12" r="1.4"></circle></symbol>
  <symbol id="i-edit" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4l6 6L8 22H2v-6z"></path></symbol>
  <symbol id="i-trash" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"></path></symbol>
  <symbol id="i-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"></path><circle cx="12" cy="12" r="3"></circle></symbol>
  <symbol id="i-filter" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16l-6 8v6l-4-2v-4z"></path></symbol>
  <symbol id="i-download" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v12M7 12l5 5 5-5"></path><path d="M4 19h16"></path></symbol>
  <symbol id="i-home" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"></path></symbol>
  <symbol id="i-calendar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M3 9h18M8 3v4M16 3v4"></path></symbol>
  <symbol id="i-paw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="9" r="1.8"></circle><circle cx="17" cy="9" r="1.8"></circle><circle cx="5" cy="14" r="1.5"></circle><circle cx="19" cy="14" r="1.5"></circle><path d="M9 19c0-2.4 1.3-3.8 3-3.8s3 1.4 3 3.8-1.3 2.5-3 2.5-3 0-3-2.5z"></path></symbol>
  <symbol id="i-users" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"></circle><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"></path><circle cx="17" cy="9" r="2.5"></circle><path d="M16 14c3 0 6 2 6 5"></path></symbol>
  <symbol id="i-cart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2 13h12l2-9H6"></path><circle cx="9" cy="20" r="1.5"></circle><circle cx="18" cy="20" r="1.5"></circle></symbol>
  <symbol id="i-tag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11V3h8l10 10-8 8z"></path><circle cx="7" cy="7" r="1.5"></circle></symbol>
  <symbol id="i-chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18M6 16V8M11 16V4M16 16v-6M21 16v-2"></path></symbol>
  <symbol id="i-cog" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19 12a7 7 0 0 0-.2-1.6l2-1.6-2-3.4-2.4.8a7 7 0 0 0-2.8-1.6L13 2h-2l-.6 2.6a7 7 0 0 0-2.8 1.6l-2.4-.8-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .6.1 1.1.2 1.6l-2 1.6 2 3.4 2.4-.8a7 7 0 0 0 2.8 1.6L11 22h2l.6-2.6a7 7 0 0 0 2.8-1.6l2.4.8 2-3.4-2-1.6c.1-.5.2-1 .2-1.6z"></path></symbol>
  <symbol id="i-msg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18v12H8l-5 4z"></path></symbol>
  <symbol id="i-sparkle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"></path></symbol>
  <symbol id="i-arrow-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 6-6 6 6"></path></symbol>
  <symbol id="i-arrow-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 10 6 6 6-6"></path></symbol>
  <symbol id="i-alert" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 2 20h20z"></path><path d="M12 10v5M12 18v.5"></path></symbol>
  <symbol id="i-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 10v6M12 7v.5"></path></symbol>
  <symbol id="i-scissors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="7" r="3"></circle><circle cx="6" cy="17" r="3"></circle><path d="M20 4 8.6 15.4M8.6 8.6 20 20M11 12l-3 1"></path></symbol>
  <symbol id="i-grid" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="6" height="6" rx="1"></rect><rect x="14" y="4" width="6" height="6" rx="1"></rect><rect x="4" y="14" width="6" height="6" rx="1"></rect><rect x="14" y="14" width="6" height="6" rx="1"></rect></symbol>
  <symbol id="i-image" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="9" cy="10" r="2"></circle><path d="m3 18 5-5 5 4 3-3 5 5"></path></symbol>
  <symbol id="i-arrow-r" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></symbol>
</svg>`

export function IconSprite() {
  return <div aria-hidden="true" dangerouslySetInnerHTML={{ __html: SPRITE }} />
}

export type IconName =
  | 'search'
  | 'bell'
  | 'plus'
  | 'chevron-d'
  | 'chevron-r'
  | 'chevron-l'
  | 'check'
  | 'x'
  | 'dots'
  | 'edit'
  | 'trash'
  | 'eye'
  | 'filter'
  | 'download'
  | 'home'
  | 'calendar'
  | 'paw'
  | 'users'
  | 'cart'
  | 'tag'
  | 'chart'
  | 'cog'
  | 'msg'
  | 'sparkle'
  | 'arrow-up'
  | 'arrow-down'
  | 'alert'
  | 'info'
  | 'scissors'
  | 'grid'
  | 'image'
  | 'arrow-r'
