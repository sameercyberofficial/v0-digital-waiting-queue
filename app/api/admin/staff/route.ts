import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const staff = await sql`
      SELECT 
        s.id,
        u.name,
        u.email,
        s.role,
        s.is_active,
        s.created_at,
        b.name as branch_name
      FROM staff s
      JOIN branches b ON s.branch_id = b.id
      LEFT JOIN neon_auth.users_sync u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `

    return Response.json(
      staff.map((member) => ({
        ...member,
        status: member.is_active ? "active" : "inactive",
      })),
    )
  } catch (error) {
    console.error("Error fetching staff:", error)
    return Response.json({ error: "Failed to fetch staff" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, role } = await request.json()

    if (!name || !email || !role) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newUser = await sql`
      INSERT INTO neon_auth.users_sync (id, name, email, created_at, updated_at)
      VALUES (gen_random_uuid()::text, ${name}, ${email}, NOW(), NOW())
      RETURNING id, name, email
    `

    const newStaff = await sql`
      INSERT INTO staff (user_id, role, branch_id, is_active)
      VALUES (${newUser[0].id}, ${role}, 1, true)
      RETURNING id, role, is_active
    `

    return Response.json({
      id: newStaff[0].id,
      name: newUser[0].name,
      email: newUser[0].email,
      role: newStaff[0].role,
      status: "active",
    })
  } catch (error) {
    console.error("Error creating staff:", error)
    return Response.json({ error: "Failed to create staff" }, { status: 500 })
  }
}
