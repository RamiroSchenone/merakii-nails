import { getAuthenticatedClient, initApiClient, getAuthToken, supabaseServer } from './supabase-client'

export { 
  getAuthenticatedClient,
  initApiClient,
  getAuthToken,
  supabaseServer as supabaseAdmin
}

export async function supabase() {
  return await getAuthenticatedClient()
}
