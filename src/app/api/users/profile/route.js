import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { getUserFromRequest } from '@/server/auth'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return user data without sensitive information
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl
    }

    return NextResponse.json(safeUser)
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    console.log('Profile PATCH request received')
    
    const user = await getUserFromRequest(req)
    if (!user) {
      console.log('No user found in request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User found:', user.id, user.email)

    const body = await req.json()
    console.log('Request body:', body)
    const { name, avatarUrl } = body

    // Validate required fields
    if (!name || name.trim() === '') {
      console.log('Name validation failed')
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    console.log('Updating user profile for:', user.id)

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        avatarUrl: avatarUrl || null
      }
    })

    console.log('User updated successfully:', updatedUser.id)

    const safeUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatarUrl: updatedUser.avatarUrl
    }

    return NextResponse.json(safeUser)
  } catch (error) {
    console.error('Profile update error:', error)
    console.error('Error details:', error.message, error.stack)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Test endpoint to verify API is working
export async function POST(req) {
  try {
    console.log('Profile test POST request received')
    return NextResponse.json({ message: 'Profile API is working', timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('Profile test error:', error)
    return NextResponse.json({ error: 'Test failed' }, { status: 500 })
  }
}
