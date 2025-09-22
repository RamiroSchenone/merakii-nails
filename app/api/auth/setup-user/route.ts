import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

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

    // Crear cliente con service role para administrar usuarios
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Buscar si el usuario ya existe
    const { data: existingUsers, error: searchError } = await adminClient.auth.admin.listUsers()
    
    if (searchError) {
      return NextResponse.json(
        { error: `Error searching users: ${searchError.message}` },
        { status: 500 }
      )
    }

    const existingUser = existingUsers.users.find(user => user.email === apiUser)

    if (existingUser) {
      // Usuario existe, actualizar sus metadatos
      const { data, error } = await adminClient.auth.admin.updateUserById(
        existingUser.id,
        {
          app_metadata: {
            ...existingUser.app_metadata,
            role: 'api_client'
          }
        }
      )

      if (error) {
        return NextResponse.json(
          { error: `Error updating user: ${error.message}` },
          { status: 500 }
        )
      }

      console.log('✅ Usuario actualizado con rol api_client:', data.user.email)
    } else {
      // Usuario no existe, crearlo
      const { data, error } = await adminClient.auth.admin.createUser({
        email: apiUser,
        password: apiPass,
        email_confirm: true,
        app_metadata: {
          role: 'api_client'
        }
      })

      if (error) {
        return NextResponse.json(
          { error: `Error creating user: ${error.message}` },
          { status: 500 }
        )
      }

      console.log('✅ Usuario creado con rol api_client:', data.user.email)
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario configurado correctamente con rol api_client'
    })

  } catch (error) {
    console.error('Error configuring user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
