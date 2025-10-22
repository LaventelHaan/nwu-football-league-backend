import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { is_active } = await request.json()
    const userId = params.id

    await query(
      'UPDATE users SET is_active = ?, updated_at = NOW() WHERE user_id = ?',
      [is_active, userId]
    )

    return NextResponse.json({
      success: true,
      message: 'User status updated successfully'
    })
  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user status' },
      { status: 500 }
    )
  }
} 