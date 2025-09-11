import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const counters = await sql`
      SELECT id, name, is_active
      FROM counters
      WHERE is_active = true
      ORDER BY name
    `

    return Response.json(counters)
  } catch (error) {
    console.error("Error fetching counters:", error)
    return Response.json({ error: "Failed to fetch counters" }, { status: 500 })
  }
}
