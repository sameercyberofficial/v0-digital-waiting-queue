import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const staff = await sql`
      SELECT 
        s.id,
        s.name,
        s.email,
        s.role,
        s.status,
        s.created_at,
        b.name as branch_name,
        c.name as counter_name
      FROM staff s
      JOIN branches b ON s.branch_id = b.id
      LEFT JOIN counters c ON s.counter_id = c.id
      ORDER BY s.created_at DESC
    `

    return Response.json(staff)
  } catch (error) {
    console.error("Error fetching staff:", error)
    return Response.json({ error: "Failed to fetch staff" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, role, counter_id } = await request.json()

    if (!name || !email || !role) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newStaff = await sql`
      INSERT INTO staff (name, email, role, branch_id, counter_id, status)
      VALUES (${name}, ${email}, ${role}, 1, ${counter_id || null}, 'active')
      RETURNING id, name, email, role, status
    `

    return Response.json(newStaff[0])
  } catch (error) {
    console.error("Error creating staff:", error)
    return Response.json({ error: "Failed to create staff" }, { status: 500 })
  }
}
