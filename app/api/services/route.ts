import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branchId")

    if (!branchId) {
      return Response.json({ error: "Branch ID is required" }, { status: 400 })
    }

    const services = await sql`
      SELECT s.id, s.name, s.description, s.estimated_duration
      FROM services s
      JOIN branch_services bs ON s.id = bs.service_id
      WHERE bs.branch_id = ${branchId} AND s.status = 'active'
      ORDER BY s.name
    `

    return Response.json(services)
  } catch (error) {
    console.error("Error fetching services:", error)
    return Response.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}
