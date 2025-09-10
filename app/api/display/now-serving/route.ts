import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branchId")

    let query
    if (branchId) {
      query = sql`
        SELECT 
          t.token_number,
          c.name as counter_name,
          s.name as service_name
        FROM tokens t
        JOIN services s ON t.service_id = s.id
        LEFT JOIN counters c ON t.counter_id = c.id
        WHERE t.status = 'in_progress' 
        AND t.branch_id = ${branchId}
        ORDER BY t.updated_at DESC
      `
    } else {
      query = sql`
        SELECT 
          t.token_number,
          c.name as counter_name,
          s.name as service_name
        FROM tokens t
        JOIN services s ON t.service_id = s.id
        LEFT JOIN counters c ON t.counter_id = c.id
        WHERE t.status = 'in_progress'
        ORDER BY t.updated_at DESC
      `
    }

    const nowServing = await query

    return Response.json(nowServing)
  } catch (error) {
    console.error("Error fetching now serving:", error)
    return Response.json({ error: "Failed to fetch now serving" }, { status: 500 })
  }
}
