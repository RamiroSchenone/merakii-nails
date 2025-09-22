import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const baseClient = createClient(supabaseUrl, supabaseAnonKey)

let authenticatedClient: SupabaseClient | null = null
let authToken: string | null = null
let isInitializing = false
let initPromise: Promise<SupabaseClient> | null = null

/**
 * Inicializa el cliente de Supabase con autenticación automática usando un usuario de servicio
 */
export async function initApiClient(): Promise<SupabaseClient> {
  if (authenticatedClient && authToken) {
    return authenticatedClient
  }

  if (isInitializing && initPromise) {
    return await initPromise
  }

  isInitializing = true
  initPromise = performInit()

  try {
    const client = await initPromise
    return client
  } finally {
    isInitializing = false
    initPromise = null
  }
}

async function performInit(): Promise<SupabaseClient> {
  try {
    const response = await fetch('/api/auth/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to authenticate API client')
    }

    const { access_token } = await response.json()

    if (!access_token) {
      throw new Error('No access token received from authentication')
    }

    authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${access_token}` },
      },
      auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false,
      },
    })

    // Configurar el token en la sesión del cliente
    await authenticatedClient.auth.setSession({
      access_token,
      refresh_token: '', // No necesitamos refresh token para este caso
    })

    authToken = access_token
    return authenticatedClient

  } catch (error) {
    console.error('Failed to initialize API client:', error)
    throw error
  }
}

/**
 * Obtiene el cliente de Supabase autenticado
 * Si no está inicializado, lo inicializa automáticamente
 */
export async function getAuthenticatedClient(): Promise<SupabaseClient> {
  if (authenticatedClient && authToken) {
    try {
      const tokenPayload = JSON.parse(atob(authToken.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)
      
      if (tokenPayload.exp > now + 300) {
        return authenticatedClient
      }
    } catch (error) {
      console.warn('Error verificando token:', error)
    }
  }

  return await initApiClient()
}

/**
 * Obtiene el token de autenticación actual
 */
export function getAuthToken(): string | null {
  return authToken
}

/**
 * Cliente de Supabase para uso en el servidor (con service role key)
 */
export const supabaseServer = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export { baseClient as supabase }
