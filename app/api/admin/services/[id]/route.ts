import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const serviceId = params.id
    const body = await request.json()

    if (body.status) {
      const isActive = body.status === "active"
      const updatedService = await sql`
        UPDATE services 
        SET is_active = ${isActive}, updated_at = NOW()
        WHERE id = ${serviceId}
        RETURNING id, name, description, estimated_duration, is_active
      `
      return Response.json(updatedService[0])
    }

    // Handle other updates
    const { name, description, estimated_duration } = body
    const updatedService = await sql`
      UPDATE services 
      SET name = ${name}, description = ${description}, estimated_duration = ${estimated_duration}, updated_at = NOW()
      WHERE id = ${serviceId}
      RETURNING id, name, description, estimated_duration, is_active
    `

    return Response.json(updatedService[0])
  } catch (error) {
    console.error("Error updating service:", error)
    return Response.json({ error: "Failed to update service" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const serviceId = params.id

    await sql`DELETE FROM services WHERE id = ${serviceId}`

    return Response.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error("Error deleting service:", error)
    return Response.json({ error: "Failed to delete service" }, { status: 500 })
  }
}
