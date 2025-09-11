import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const services = await sql`
      SELECT id, name, description, estimated_duration, is_active, created_at
      FROM services
      ORDER BY created_at DESC
    `

    return Response.json(services)
  } catch (error) {
    console.error("Error fetching services:", error)
    return Response.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, estimated_duration } = await request.json()

    if (!name || !estimated_duration) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newService = await sql`
      INSERT INTO services (name, description, estimated_duration, is_active, branch_id)
      VALUES (${name}, ${description}, ${estimated_duration}, true, 1)
      RETURNING id, name, description, estimated_duration, is_active
    `

    return Response.json(newService[0])
  } catch (error) {
    console.error("Error creating service:", error)
    return Response.json({ error: "Failed to create service" }, { status: 500 })
  }
}
