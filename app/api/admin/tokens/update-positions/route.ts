import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    // Update estimated wait times for all waiting tokens
    const waitingTokens = await sql`
      SELECT 
        t.id, 
        t.service_id, 
        t.branch_id, 
        t.created_at,
        ROW_NUMBER() OVER (PARTITION BY t.service_id ORDER BY t.created_at) as position
      FROM tokens t
      WHERE status = 'waiting'
      ORDER BY t.created_at ASC
    `

    // Update estimated wait times based on calculated positions
    for (const token of waitingTokens) {
      // Get service duration for wait time calculation
      const service = await sql`
        SELECT estimated_duration FROM services WHERE id = ${token.service_id}
      `

      const estimatedWaitTime = token.position * (service[0]?.estimated_duration || 15)

      await sql`
        UPDATE tokens 
        SET estimated_wait_time = ${estimatedWaitTime}
        WHERE id = ${token.id}
      `
    }

    return Response.json({ message: "Queue positions updated successfully" })
  } catch (error) {
    console.error("Error updating queue positions:", error)
    return Response.json({ error: "Failed to update queue positions" }, { status: 500 })
  }
}
