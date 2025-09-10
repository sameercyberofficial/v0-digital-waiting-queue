import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const tokens = await sql`
      SELECT 
        t.id,
        t.token_number,
        t.customer_name,
        t.status,
        t.created_at,
        s.name as service_name
      FROM tokens t
      JOIN services s ON t.service_id = s.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `

    return Response.json(tokens)
  } catch (error) {
    console.error("Error fetching recent tokens:", error)
    return Response.json({ error: "Failed to fetch recent tokens" }, { status: 500 })
  }
}
