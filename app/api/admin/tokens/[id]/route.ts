import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const tokenId = params.id
    const { status, counter_id } = await request.json()

    if (!status) {
      return Response.json({ error: "Status is required" }, { status: 400 })
    }

    let updateQuery
    if (counter_id) {
      updateQuery = await sql`
        UPDATE tokens 
        SET status = ${status}, counter_id = ${counter_id}, updated_at = NOW()
        WHERE id = ${tokenId}
        RETURNING id, status
      `
    } else {
      updateQuery = await sql`
        UPDATE tokens 
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${tokenId}
        RETURNING id, status
      `
    }

    if (updateQuery.length === 0) {
      return Response.json({ error: "Token not found" }, { status: 404 })
    }

    return Response.json(updateQuery[0])
  } catch (error) {
    console.error("Error updating token:", error)
    return Response.json({ error: "Failed to update token" }, { status: 500 })
  }
}
