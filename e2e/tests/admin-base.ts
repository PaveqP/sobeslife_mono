/**
 * Admin UI is mounted at /admin (Vite `base` + React Router `basename`).
 * ADMIN_BASE_URL is the origin only, e.g. http://localhost:5174
 */
export function getAdminAppBase(): string {
  const origin = (process.env.ADMIN_BASE_URL || 'http://localhost:5174').replace(/\/$/, '')
  return `${origin}/admin`
}
