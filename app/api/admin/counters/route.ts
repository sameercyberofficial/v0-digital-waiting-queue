import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const counters = await sql`
      SELECT id, name, status
      FROM counters
      WHERE status = 'active'
      ORDER BY name
    `

    return Response.json(counters)
  } catch (error) {
    console.error("Error fetching counters:", error)
    return Response.json({ error: "Failed to fetch counters" }, { status: 500 })
  }
}
