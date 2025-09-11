import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const staffId = params.id
    const body = await request.json()

    if (body.status) {
      const isActive = body.status === "active"
      const updatedStaff = await sql`
        UPDATE staff 
        SET is_active = ${isActive}, updated_at = NOW()
        WHERE id = ${staffId}
        RETURNING id, role, is_active
      `
      return Response.json(updatedStaff[0])
    }

    // Handle other updates
    const { name, email, role } = body

    // Update user info in users_sync table
    if (name || email) {
      await sql`
        UPDATE neon_auth.users_sync 
        SET name = COALESCE(${name}, name), email = COALESCE(${email}, email), updated_at = NOW()
        WHERE id = (SELECT user_id FROM staff WHERE id = ${staffId})
      `
    }

    // Update staff role
    if (role) {
      await sql`
        UPDATE staff 
        SET role = ${role}, updated_at = NOW()
        WHERE id = ${staffId}
      `
    }

    return Response.json({ message: "Staff updated successfully" })
  } catch (error) {
    console.error("Error updating staff:", error)
    return Response.json({ error: "Failed to update staff" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const staffId = params.id

    // Get user_id before deleting staff record
    const staff = await sql`SELECT user_id FROM staff WHERE id = ${staffId}`

    if (staff.length > 0) {
      // Delete staff record
      await sql`DELETE FROM staff WHERE id = ${staffId}`

      // Delete user record
      await sql`DELETE FROM neon_auth.users_sync WHERE id = ${staff[0].user_id}`
    }

    return Response.json({ message: "Staff deleted successfully" })
  } catch (error) {
    console.error("Error deleting staff:", error)
    return Response.json({ error: "Failed to delete staff" }, { status: 500 })
  }
}
