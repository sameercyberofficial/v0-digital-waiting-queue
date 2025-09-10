import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const branchId = params.id

    const branch = await sql`
      SELECT id, name, address, phone, status
      FROM branches 
      WHERE id = ${branchId}
    `

    if (branch.length === 0) {
      return Response.json({ error: "Branch not found" }, { status: 404 })
    }

    return Response.json(branch[0])
  } catch (error) {
    console.error("Error fetching branch:", error)
    return Response.json({ error: "Failed to fetch branch" }, { status: 500 })
  }
}
