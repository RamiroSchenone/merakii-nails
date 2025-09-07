import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Contraseña requerida' },
        { status: 400 }
      )
    }

    // Obtener la contraseña desde variables de entorno
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD no está configurada en las variables de entorno')
      return NextResponse.json(
        { success: false, message: 'Error de configuración del servidor' },
        { status: 500 }
      )
    }

    // Verificar la contraseña
    if (password === adminPassword) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, message: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Error en autenticación de admin:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
