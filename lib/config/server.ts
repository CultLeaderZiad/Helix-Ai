export const serverConfig = {
  get HELIX_API_KEY_PEPPER() {
    const val = process.env.HELIX_API_KEY_PEPPER
    if (!val) throw new Error('HELIX_API_KEY_PEPPER is missing in server environment variables.')
    return val
  },
  get AGENCY_ADMIN_EMAILS() {
    return process.env.AGENCY_ADMIN_EMAILS || ''
  },
  get HELIX_WEBHOOK_SECRET() {
    // Only used for global fallback if needed, but per-tenant is preferred
    return process.env.HELIX_WEBHOOK_SECRET
  },
  // Add other server-only vars as needed
}

export function validateServerConfig() {
  // Accessing properties will throw if missing
  serverConfig.HELIX_API_KEY_PEPPER
}
