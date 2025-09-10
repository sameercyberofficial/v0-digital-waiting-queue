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
          t.id,
          t.token_number,
          t.customer_name,
          t.estimated_wait_time,
          t.position_in_queue,
          s.name as service_name
        FROM tokens t
        JOIN services s ON t.service_id = s.id
        WHERE t.status = 'waiting' 
        AND t.branch_id = ${branchId}
        ORDER BY t.position_in_queue ASC, t.created_at ASC
        LIMIT 20
      `
    } else {
      query = sql`
        SELECT 
          t.id,
          t.token_number,
          t.customer_name,
          t.estimated_wait_time,
          t.position_in_queue,
          s.name as service_name
        FROM tokens t
        JOIN services s ON t.service_id = s.id
        WHERE t.status = 'waiting'
        ORDER BY t.position_in_queue ASC, t.created_at ASC
        LIMIT 20
      `
    }

    const waitingQueue = await query

    return Response.json(waitingQueue)
  } catch (error) {
    console.error("Error fetching waiting queue:", error)
    return Response.json({ error: "Failed to fetch waiting queue" }, { status: 500 })
  }
}
