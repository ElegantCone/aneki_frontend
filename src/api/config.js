const env = import.meta.env ?? {}

export const API_MODE = env.VITE_API_MODE ?? 'http'
export const API_BASE_URL = env.VITE_API_BASE_URL ?? ''
