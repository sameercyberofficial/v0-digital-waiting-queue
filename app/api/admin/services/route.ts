import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const services = await sql`
      SELECT id, name, description, prefix, estimated_duration, status, created_at
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
    const { name, description, prefix, estimated_duration } = await request.json()

    if (!name || !prefix || !estimated_duration) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newService = await sql`
      INSERT INTO services (name, description, prefix, estimated_duration, status)
      VALUES (${name}, ${description}, ${prefix.toUpperCase()}, ${estimated_duration}, 'active')
      RETURNING id, name, description, prefix, estimated_duration, status
    `

    return Response.json(newService[0])
  } catch (error) {
    console.error("Error creating service:", error)
    return Response.json({ error: "Failed to create service" }, { status: 500 })
  }
}
