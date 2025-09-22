import { initApiClient } from './supabase-client'

let isInitialized = false

export async function initializeApp(): Promise<void> {
  if (isInitialized) {
    return
  }

  try {
    await initApiClient()
    isInitialized = true
  } catch (error) {
    console.error('Error inicializando la aplicación:', error)
    throw error
  }
}

export function isAppInitialized(): boolean {
  return isInitialized
}
