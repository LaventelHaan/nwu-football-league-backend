import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    // Start a transaction to delete user data from all related tables
    await query('START TRANSACTION')

    try {
      // Delete from user_organizations
      await query('DELETE FROM user_organizations WHERE user_id = ?', [userId])
      
      // Delete from user_roles
      await query('DELETE FROM user_roles WHERE user_id = ?', [userId])
      
      // Delete from user_profiles
      await query('DELETE FROM user_profiles WHERE user_id = ?', [userId])
      
      // Delete from users (this will cascade to other tables with foreign keys)
      await query('DELETE FROM users WHERE user_id = ?', [userId])
      
      // Commit the transaction
      await query('COMMIT')

      return NextResponse.json({
        success: true,
        message: 'User deleted successfully'
      })
    } catch (error) {
      // Rollback in case of error
      await query('ROLLBACK')
      throw error
    }

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}