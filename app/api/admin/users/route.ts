import { NextResponse } from 'next/server'
import { query } from '@/lib/database'
import bcrypt from 'bcryptjs'

// GET - Fetch all users
export async function GET() {
  try {
    const users = await query(`
      SELECT 
        u.user_id,
        u.email,
        u.phone_e164,
        u.is_active,
        u.email_verified_at,
        u.phone_verified_at,
        u.created_at,
        u.updated_at,
        up.first_name,
        up.last_name,
        up.birth_date,
        GROUP_CONCAT(DISTINCT r.role_name) as role_names,
        GROUP_CONCAT(DISTINCT CONCAT(o.name, '||', uo.org_role)) as organization_data
      FROM users u
      LEFT JOIN user_profiles up ON up.user_id = u.user_id
      LEFT JOIN user_roles ur ON ur.user_id = u.user_id
      LEFT JOIN roles r ON r.role_id = ur.role_id
      LEFT JOIN user_organizations uo ON uo.user_id = u.user_id
      LEFT JOIN organizations o ON o.organization_id = uo.organization_id
      GROUP BY u.user_id, up.first_name, up.last_name, up.birth_date
      ORDER BY u.created_at DESC
    `) as any[]

    const formattedUsers = users.map(user => ({
      user_id: user.user_id,
      email: user.email,
      phone_e164: user.phone_e164,
      is_active: Boolean(user.is_active),
      email_verified_at: user.email_verified_at,
      phone_verified_at: user.phone_verified_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
      profile: {
        first_name: user.first_name,
        last_name: user.last_name,
        birth_date: user.birth_date
      },
      roles: user.role_names ? user.role_names.split(',') : [],
      organizations: user.organization_data ? user.organization_data.split(',').map((org: string) => {
        const [organization_name, org_role] = org.split('||')
        return { organization_name, org_role }
      }) : []
    }))

    return NextResponse.json({
      success: true,
      users: formattedUsers
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST - Create new user
export async function POST(request: Request) {
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

    console.log('Received data:', { firstName, lastName, email, phone, role, dominantFoot, height, preferredPosition, qualification })

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: email, password, firstName, lastName, and role are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    ) as any[]

    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Start transaction
    await query('START TRANSACTION')

    try {
      // Create user
      const userResult = await query(
        `INSERT INTO users (email, phone_e164, password_hash, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, TRUE, NOW(), NOW())`,
        [email, phone || null, hashedPassword]
      ) as any

      const userId = userResult.insertId

      // Create user profile
      await query(
        `INSERT INTO user_profiles (user_id, first_name, last_name, created_at, updated_at) 
         VALUES (?, ?, ?, NOW(), NOW())`,
        [userId, firstName, lastName]
      )

      // Assign role (get role_id from roles table)
      const roleResult = await query(
        'SELECT role_id FROM roles WHERE role_name = ?',
        [role.toUpperCase()]
      ) as any[]

      if (roleResult.length > 0) {
        const roleId = roleResult[0].role_id
        await query(
          'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
          [userId, roleId]
        )
      } else {
        throw new Error(`Role '${role}' not found`)
      }

      // Handle role-specific data
      if (role.toUpperCase() === 'PLAYER') {
        await query(
          `INSERT INTO players (user_id, dominant_foot, height_cm, preferred_position) 
           VALUES (?, ?, ?, ?)`,
          [userId, dominantFoot || null, height ? parseInt(height) : null, preferredPosition || null]
        )
      } else if (role.toUpperCase() === 'COACH') {
        await query(
          'INSERT INTO coaches (user_id, qualification) VALUES (?, ?)',
          [userId, qualification || null]
        )
      }

      await query('COMMIT')

      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        user_id: userId
      })
    } catch (error) {
      await query('ROLLBACK')
      throw error
    }

  } catch (error: any) {
    console.error('Error creating user:', error)
    
    // Handle duplicate entry errors
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, error: 'Email or phone number already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create user' },
      { status: 500 }
    )
  }
}