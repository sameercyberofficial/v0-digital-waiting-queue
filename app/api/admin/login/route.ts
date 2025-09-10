import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return Response.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Simple demo authentication - in production, use proper password hashing
    if (username === "admin" && password === "admin123") {
      const staff = await sql`
        SELECT s.id, u.name, s.role, b.name as branch_name
        FROM staff s
        JOIN branches b ON s.branch_id = b.id
        LEFT JOIN neon_auth.users_sync u ON s.user_id = u.id
        WHERE s.role = 'admin' AND s.is_active = true
        LIMIT 1
      `

      if (staff.length === 0) {
        return Response.json({ error: "Admin user not found" }, { status: 404 })
      }

      const user = staff[0]
      const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      return Response.json({
        token,
        user: {
          id: user.id,
          name: user.name || "Admin User",
          role: user.role,
          branch_name: user.branch_name,
        },
      })
    }

    return Response.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("Login error:", error)
    return Response.json({ error: "Login failed" }, { status: 500 })
  }
}
