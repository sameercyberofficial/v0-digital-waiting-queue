import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    // Get the next waiting token
    const nextToken = await sql`
      SELECT id FROM tokens 
      WHERE status = 'waiting'
      ORDER BY created_at ASC
      LIMIT 1
    `

    if (nextToken.length === 0) {
      return Response.json({ error: "No tokens in queue" }, { status: 404 })
    }

    // Update the token status to in_progress
    const updatedToken = await sql`
      UPDATE tokens 
      SET status = 'in_progress', counter_id = 1, updated_at = NOW()
      WHERE id = ${nextToken[0].id}
      RETURNING id, token_number, customer_name
    `

    return Response.json({
      message: "Next token called successfully",
      token: updatedToken[0],
    })
  } catch (error) {
    console.error("Error calling next token:", error)
    return Response.json({ error: "Failed to call next token" }, { status: 500 })
  }
}
