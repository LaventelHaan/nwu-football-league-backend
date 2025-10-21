import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import rateLimit from '@/lib/rate-limit'
import { query } from '@/lib/database'

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export async function POST(request: NextRequest) {
  try {
    // Get IP address from headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const identifier = forwardedFor?.split(',')[0] || realIp || 'anonymous'

    const isRateLimited = await limiter.check(identifier, 5)
    
    if (isRateLimited) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const { email, password } = await request.json()

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('Login attempt for email:', email)

    // SIMPLIFIED QUERY - Let's start with basic user lookup
    const users = await query(
      `SELECT 
        u.user_id,
        u.email,
        u.password_hash,
        u.is_active,
        u.email_verified_at
       FROM users u
       WHERE u.email = ?`,
      [email.toLowerCase().trim()]
    ) as any[]

    console.log('Users found:', users.length)
    if (users.length > 0) {
      console.log('User data:', {
        id: users[0].user_id,
        email: users[0].email,
        is_active: users[0].is_active,
        email_verified: users[0].email_verified_at,
        password_hash_length: users[0].password_hash?.length
      })
    }

    if (users.length === 0) {
      console.log('No user found with email:', email)
      await query(
        `INSERT INTO security_logs (action, user_identifier, ip_address, user_agent, success) 
         VALUES (?, ?, ?, ?, ?)`,
        ['login_attempt', email.toLowerCase().trim(), identifier, request.headers.get('user-agent'), false]
      )
      
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = users[0]

    // Check if user is active
    if (!user.is_active) {
      console.log('User account inactive:', user.user_id)
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      )
    }

    console.log('Comparing password...')
    console.log('Input password:', password)
    console.log('Stored hash:', user.password_hash)

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    console.log('Password valid:', isPasswordValid)
    
    if (!isPasswordValid) {
      console.log('Invalid password for user:', user.user_id)
      await query(
        `INSERT INTO security_logs (action, user_id, ip_address, user_agent, success) 
         VALUES (?, ?, ?, ?, ?)`,
        ['login_attempt', user.user_id, identifier, request.headers.get('user-agent'), false]
      )
      
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Get user profile and roles
    const userDetails = await query(
      `SELECT 
        up.first_name,
        up.last_name,
        GROUP_CONCAT(r.role_name) as roles
       FROM user_profiles up
       LEFT JOIN user_roles ur ON up.user_id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.role_id
       WHERE up.user_id = ?
       GROUP BY up.user_id, up.first_name, up.last_name`,
      [user.user_id]
    ) as any[]

    console.log('User details:', userDetails)

    const userProfile = userDetails[0] || { first_name: '', last_name: '', roles: '' }

    // Parse roles from comma-separated string to array
    const roles = userProfile.roles ? userProfile.roles.split(',') : []

    // Log successful login
    await query(
      `INSERT INTO security_logs (action, user_id, ip_address, user_agent, success) 
       VALUES (?, ?, ?, ?, ?)`,
      ['login_attempt', user.user_id, identifier, request.headers.get('user-agent'), true]
    )

    // Update last login timestamp
    await query(
      `UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [user.user_id]
    )

    // Return user data without sensitive information
    const userResponse = {
      id: user.user_id,
      email: user.email,
      firstName: userProfile.first_name,
      lastName: userProfile.last_name,
      roles: roles,
      isActive: user.is_active,
      emailVerified: !!user.email_verified_at,
    }

    console.log('Login successful for user:', userResponse)

    return NextResponse.json({
      success: true,
      user: userResponse,
    })

  } catch (error) {
    console.error('Login API error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}