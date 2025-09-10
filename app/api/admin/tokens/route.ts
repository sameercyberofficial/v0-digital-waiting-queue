import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const query = `
      SELECT 
        t.id,
        t.token_number,
        t.customer_name,
        t.customer_phone,
        t.status,
        t.estimated_wait_time,
        t.position_in_queue,
        t.created_at,
        t.counter_id,
        s.name as service_name,
        c.name as counter_name
      FROM tokens t
      JOIN services s ON t.service_id = s.id
      LEFT JOIN counters c ON t.counter_id = c.id
    `

    let tokens
    if (status && status !== "all") {
      tokens = await sql`
        SELECT 
          t.id,
          t.token_number,
          t.customer_name,
          t.customer_phone,
          t.status,
          t.estimated_wait_time,
          t.position_in_queue,
          t.created_at,
          t.counter_id,
          s.name as service_name,
          c.name as counter_name
        FROM tokens t
        JOIN services s ON t.service_id = s.id
        LEFT JOIN counters c ON t.counter_id = c.id
        WHERE t.status = ${status}
        ORDER BY t.created_at DESC
      `
    } else {
      tokens = await sql`
        SELECT 
          t.id,
          t.token_number,
          t.customer_name,
          t.customer_phone,
          t.status,
          t.estimated_wait_time,
          t.position_in_queue,
          t.created_at,
          t.counter_id,
          s.name as service_name,
          c.name as counter_name
        FROM tokens t
        JOIN services s ON t.service_id = s.id
        LEFT JOIN counters c ON t.counter_id = c.id
        ORDER BY t.created_at DESC
      `
    }

    return Response.json(tokens)
  } catch (error) {
    console.error("Error fetching admin tokens:", error)
    return Response.json({ error: "Failed to fetch tokens" }, { status: 500 })
  }
}
