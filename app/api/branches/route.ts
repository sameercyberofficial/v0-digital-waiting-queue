import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const branches = await sql`
      SELECT id, name, address, phone, is_active
      FROM branches 
      WHERE is_active = true
      ORDER BY name
    `

    return Response.json(branches)
  } catch (error) {
    console.error("Error fetching branches:", error)
    return Response.json({ error: "Failed to fetch branches" }, { status: 500 })
  }
}
