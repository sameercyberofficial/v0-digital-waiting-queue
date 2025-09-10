import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    // Update queue positions for all waiting tokens
    const waitingTokens = await sql`
      SELECT id, service_id, branch_id, created_at
      FROM tokens 
      WHERE status = 'waiting'
      ORDER BY created_at ASC
    `

    // Update positions and estimated wait times
    for (let i = 0; i < waitingTokens.length; i++) {
      const token = waitingTokens[i]
      const position = i + 1

      // Get service duration for wait time calculation
      const service = await sql`
        SELECT estimated_duration FROM services WHERE id = ${token.service_id}
      `

      const estimatedWaitTime = position * (service[0]?.estimated_duration || 15)

      await sql`
        UPDATE tokens 
        SET position_in_queue = ${position}, estimated_wait_time = ${estimatedWaitTime}
        WHERE id = ${token.id}
      `
    }

    return Response.json({ message: "Queue positions updated successfully" })
  } catch (error) {
    console.error("Error updating queue positions:", error)
    return Response.json({ error: "Failed to update queue positions" }, { status: 500 })
  }
}
