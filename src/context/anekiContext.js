import { createContext, useContext } from 'react'

export const AnekiContext = createContext(null)

export function useAneki() {
  const context = useContext(AnekiContext)
  if (!context) {
    throw new Error('useAneki must be used within AnekiProvider')
  }
  return context
}
