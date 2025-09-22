import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const apiUser = process.env.SUPABASE_API_USER
    const apiPass = process.env.SUPABASE_API_PASS

    if (!apiUser || !apiPass) {
      return NextResponse.json(
        { error: 'Missing SUPABASE_API_USER or SUPABASE_API_PASS environment variables' },
        { status: 500 }
      )
    }

    // Crear cliente temporal para autenticación
    const tempClient = createClient(supabaseUrl, supabaseAnonKey)

    // Hacer login con las credenciales del usuario de servicio
    const { data, error } = await tempClient.auth.signInWithPassword({
      email: apiUser,
      password: apiPass,
    })

    if (error) {
      return NextResponse.json(
        { error: `Failed to authenticate API client: ${error.message}` },
        { status: 401 }
      )
    }

    if (!data.session?.access_token) {
      return NextResponse.json(
        { error: 'No access token received from authentication' },
        { status: 401 }
      )
    }

    // Verificar que el token tenga el rol correcto
    const tokenPayload = JSON.parse(atob(data.session.access_token.split('.')[1]))
    console.log('JWT Payload:', tokenPayload)
    
    // El rol está en app_metadata, no en el nivel principal del JWT
    const userRole = tokenPayload.app_metadata?.role
    
    if (!userRole || userRole !== 'api_client') {
      console.error('Error: JWT sin rol válido, se esperaba role=api_client')
      return NextResponse.json(
        { error: `Expected role 'api_client' but got '${userRole || 'undefined'}'` },
        { status: 401 }
      )
    }
    
    console.log('JWT verificado con role=api_client')

    // Retornar el token para que el cliente lo use
    return NextResponse.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at
    })

  } catch (error) {
    console.error('Failed to initialize API client:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
