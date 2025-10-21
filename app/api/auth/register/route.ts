import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query, withTransaction } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      dominantFoot,
      height,
      preferredPosition,
      qualification
    } = await request.json()

    // Input validation
    if (!firstName || !lastName || !email || !phone || !password || !role) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      )
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['player', 'coach', 'scouter']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role selected' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUsers = await query(
      'SELECT user_id FROM users WHERE email = ? OR phone_e164 = ?',
      [email.toLowerCase().trim(), phone.trim()]
    ) as any[]

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this email or phone number already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Use transaction wrapper
    const result = await withTransaction(async (connection) => {
      // 1. Insert into users table
      const [userResult] = await connection.execute(
        `INSERT INTO users (email, phone_e164, password_hash) 
         VALUES (?, ?, ?)`,
        [email.toLowerCase().trim(), phone.trim(), passwordHash]
      ) as any

      const userId = userResult.insertId

      // 2. Insert into user_profiles table
      await connection.execute(
        `INSERT INTO user_profiles (user_id, first_name, last_name) 
         VALUES (?, ?, ?)`,
        [userId, firstName.trim(), lastName.trim()]
      )

      // 3. Determine role_id based on role name
      // First, let's get the actual role_id from the roles table
      const [roleRows] = await connection.execute(
        'SELECT role_id FROM roles WHERE role_name = ?',
        [role]
      ) as any[]

      if (roleRows.length === 0) {
        throw new Error(`Role '${role}' not found in database`)
      }

      const roleId = roleRows[0].role_id

      // 4. Insert into user_roles table
      await connection.execute(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [userId, roleId]
      )

      // 5. Insert into role-specific tables
      if (role === 'player') {
        await connection.execute(
          `INSERT INTO players (user_id, dominant_foot, height_cm, preferred_position) 
           VALUES (?, ?, ?, ?)`,
          [userId, dominantFoot || null, height || null, preferredPosition || null]
        )
      } else if (role === 'coach') {
        await connection.execute(
          'INSERT INTO coaches (user_id, qualification) VALUES (?, ?)',
          [userId, qualification || null]
        )
      }
      // Note: Scouts might not need a separate table, or you can create one later

      return { userId, roleId }
    })

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      userId: result.userId
    })

  } catch (error: any) {
    console.error('Registration API error:', error)
    
    // Handle specific errors
    if (error.message?.includes('Role')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'User with this email or phone number already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}