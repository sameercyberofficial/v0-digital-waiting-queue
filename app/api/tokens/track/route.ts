import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenNumber = searchParams.get("token")
    const phoneNumber = searchParams.get("phone")

    if (!tokenNumber || !phoneNumber) {
      return Response.json({ error: "Token number and phone number are required" }, { status: 400 })
    }

    const token = await sql`
      SELECT id FROM tokens 
      WHERE token_number = ${tokenNumber} 
      AND customer_phone = ${phoneNumber}
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (token.length === 0) {
      return Response.json({ error: "Token not found" }, { status: 404 })
    }

    return Response.json(token[0])
  } catch (error) {
    console.error("Error tracking token:", error)
    return Response.json({ error: "Failed to track token" }, { status: 500 })
  }
}
