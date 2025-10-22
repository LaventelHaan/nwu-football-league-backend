import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    const userResult = await query(`
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
        p.dominant_foot,
        p.height_cm,
        p.preferred_position,
        c.qualification
      FROM users u
      LEFT JOIN user_profiles up ON up.user_id = u.user_id
      LEFT JOIN user_roles ur ON ur.user_id = u.user_id
      LEFT JOIN roles r ON r.role_id = ur.role_id
      LEFT JOIN players p ON p.user_id = u.user_id
      LEFT JOIN coaches c ON c.user_id = u.user_id
      WHERE u.user_id = ?
      GROUP BY u.user_id, up.first_name, up.last_name, up.birth_date, p.dominant_foot, p.height_cm, p.preferred_position, c.qualification
    `, [userId]) as any[]

    if (userResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const user = userResult[0]
    const formattedUser = {
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
      player_data: user.dominant_foot ? {
        dominant_foot: user.dominant_foot,
        height_cm: user.height_cm,
        preferred_position: user.preferred_position
      } : undefined,
      coach_data: user.qualification ? {
        qualification: user.qualification
      } : undefined
    }

    return NextResponse.json({
      success: true,
      user: formattedUser
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    const { 
      email, 
      phone_e164, 
      first_name, 
      last_name, 
      birth_date, 
      is_active,
      roles,
      dominant_foot,
      height_cm,
      preferred_position,
      qualification
    } = await request.json()

    await query('START TRANSACTION')

    try {
      // Update user table
      await query(
        `UPDATE users 
         SET email = ?, phone_e164 = ?, is_active = ?, updated_at = NOW() 
         WHERE user_id = ?`,
        [email, phone_e164 || null, is_active, userId]
      )

      // Update user profile
      await query(
        `UPDATE user_profiles 
         SET first_name = ?, last_name = ?, birth_date = ?, updated_at = NOW() 
         WHERE user_id = ?`,
        [first_name, last_name, birth_date || null, userId]
      )

      // Update roles
      await query('DELETE FROM user_roles WHERE user_id = ?', [userId])
      
      for (const role of roles) {
        const roleResult = await query(
          'SELECT role_id FROM roles WHERE role_name = ?',
          [role]
        ) as any[]
        
        if (roleResult.length > 0) {
          await query(
            'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
            [userId, roleResult[0].role_id]
          )
        }
      }

      // Update player data if PLAYER role exists
      if (roles.includes('PLAYER')) {
        const playerExists = await query(
          'SELECT player_id FROM players WHERE user_id = ?',
          [userId]
        ) as any[]

        if (playerExists.length > 0) {
          await query(
            `UPDATE players 
             SET dominant_foot = ?, height_cm = ?, preferred_position = ?
             WHERE user_id = ?`,
            [dominant_foot, height_cm ? parseInt(height_cm) : null, preferred_position, userId]
          )
        } else {
          await query(
            `INSERT INTO players (user_id, dominant_foot, height_cm, preferred_position)
             VALUES (?, ?, ?, ?)`,
            [userId, dominant_foot, height_cm ? parseInt(height_cm) : null, preferred_position]
          )
        }
      } else {
        // Remove player data if PLAYER role is removed
        await query('DELETE FROM players WHERE user_id = ?', [userId])
      }

      // Update coach data if COACH role exists
      if (roles.includes('COACH')) {
        const coachExists = await query(
          'SELECT coach_id FROM coaches WHERE user_id = ?',
          [userId]
        ) as any[]

        if (coachExists.length > 0) {
          await query(
            'UPDATE coaches SET qualification = ? WHERE user_id = ?',
            [qualification, userId]
          )
        } else {
          await query(
            'INSERT INTO coaches (user_id, qualification) VALUES (?, ?)',
            [userId, qualification]
          )
        }
      } else {
        // Remove coach data if COACH role is removed
        await query('DELETE FROM coaches WHERE user_id = ?', [userId])
      }

      await query('COMMIT')

      return NextResponse.json({
        success: true,
        message: 'User updated successfully'
      })
    } catch (error) {
      await query('ROLLBACK')
      throw error
    }

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}