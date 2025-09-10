import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const tokenId = params.id

    const token = await sql`
      SELECT 
        t.id,
        t.token_number,
        t.status,
        t.customer_name,
        t.customer_phone,
        t.estimated_wait_time,
        ROW_NUMBER() OVER (PARTITION BY t.service_id ORDER BY t.created_at) as position_in_queue,
        t.created_at,
        b.name as branch_name,
        s.name as service_name
      FROM tokens t
      JOIN branches b ON t.branch_id = b.id
      JOIN services s ON t.service_id = s.id
      WHERE t.id = ${tokenId}
    `

    if (token.length === 0) {
      return Response.json({ error: "Token not found" }, { status: 404 })
    }

    return Response.json(token[0])
  } catch (error) {
    console.error("Error fetching token:", error)
    return Response.json({ error: "Failed to fetch token" }, { status: 500 })
  }
}
