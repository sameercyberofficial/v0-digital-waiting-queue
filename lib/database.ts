import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Database helper functions
export async function getBranches() {
  return await sql`
    SELECT b.*, o.name as organization_name 
    FROM branches b 
    JOIN organizations o ON b.organization_id = o.id 
    WHERE b.is_active = true
    ORDER BY b.name
  `
}

export async function getServices(branchId: number) {
  return await sql`
    SELECT * FROM services 
    WHERE branch_id = ${branchId} AND is_active = true
    ORDER BY name
  `
}

export async function getActiveTokens(branchId: number) {
  return await sql`
    SELECT t.*, s.name as service_name, c.name as counter_name
    FROM tokens t
    JOIN services s ON t.service_id = s.id
    LEFT JOIN counters c ON t.counter_id = c.id
    WHERE t.branch_id = ${branchId} 
    AND t.status IN ('waiting', 'called', 'serving')
    ORDER BY t.priority DESC, t.created_at ASC
  `
}

export async function createToken(data: {
  serviceId: number
  branchId: number
  customerName?: string
  customerPhone?: string
  customerEmail?: string
}) {
  // Generate token number (format: A001, A002, etc.)
  const lastToken = await sql`
    SELECT token_number FROM tokens 
    WHERE branch_id = ${data.branchId} 
    AND DATE(created_at) = CURRENT_DATE
    ORDER BY created_at DESC 
    LIMIT 1
  `

  let tokenNumber = "A001"
  if (lastToken.length > 0) {
    const lastNum = Number.parseInt(lastToken[0].token_number.slice(1))
    tokenNumber = `A${String(lastNum + 1).padStart(3, "0")}`
  }

  const result = await sql`
    INSERT INTO tokens (
      token_number, service_id, branch_id, customer_name, 
      customer_phone, customer_email, status
    ) VALUES (
      ${tokenNumber}, ${data.serviceId}, ${data.branchId}, 
      ${data.customerName || null}, ${data.customerPhone || null}, 
      ${data.customerEmail || null}, 'waiting'
    )
    RETURNING *
  `

  return result[0]
}
