import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { branchId, serviceId, customerName, customerPhone } = await request.json()

    if (!branchId || !serviceId || !customerName || !customerPhone) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the service details for token generation
    const service = await sql`
      SELECT name FROM services WHERE id = ${serviceId}
    `

    if (service.length === 0) {
      return Response.json({ error: "Service not found" }, { status: 404 })
    }

    // Get the next token number for this service today
    const today = new Date().toISOString().split("T")[0]
    const lastToken = await sql`
      SELECT token_number FROM tokens 
      WHERE service_id = ${serviceId} 
      AND branch_id = ${branchId}
      AND DATE(created_at) = ${today}
      ORDER BY created_at DESC 
      LIMIT 1
    `

    // Create prefix from service name (first 2 letters)
    const servicePrefix = service[0].name.substring(0, 2).toUpperCase()

    let nextNumber = 1
    if (lastToken.length > 0) {
      const lastNumber = Number.parseInt(lastToken[0].token_number.replace(servicePrefix, ""))
      nextNumber = lastNumber + 1
    }

    const tokenNumber = `${servicePrefix}${nextNumber.toString().padStart(3, "0")}`

    // Calculate estimated wait time (simplified)
    const queueCount = await sql`
      SELECT COUNT(*) as count FROM tokens 
      WHERE service_id = ${serviceId} 
      AND branch_id = ${branchId}
      AND status IN ('waiting', 'in_progress')
    `

    const serviceDetails = await sql`
      SELECT estimated_duration FROM services WHERE id = ${serviceId}
    `

    const estimatedWaitTime = (queueCount[0].count + 1) * serviceDetails[0].estimated_duration

    // Create the token
    const newToken = await sql`
      INSERT INTO tokens (
        token_number, branch_id, service_id, customer_name, 
        customer_phone, status, estimated_wait_time
      ) VALUES (
        ${tokenNumber}, ${branchId}, ${serviceId}, ${customerName},
        ${customerPhone}, 'waiting', ${estimatedWaitTime}
      )
      RETURNING id, token_number, status, estimated_wait_time
    `

    return Response.json(newToken[0])
  } catch (error) {
    console.error("Error creating token:", error)
    return Response.json({ error: "Failed to create token" }, { status: 500 })
  }
}
