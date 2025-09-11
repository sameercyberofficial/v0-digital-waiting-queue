import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0]

    // Get today's token stats
    const tokenStats = await sql`
      SELECT 
        COUNT(*) as total_tokens,
        COUNT(CASE WHEN status IN ('waiting', 'in_progress') THEN 1 END) as active_tokens,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tokens,
        AVG(CASE WHEN status = 'completed' THEN estimated_wait_time END) as avg_wait_time
      FROM tokens 
      WHERE DATE(created_at) = ${today}
    `

    const branchStats = await sql`
      SELECT COUNT(*) as active_branches FROM branches WHERE is_active = true
    `

    const staffStats = await sql`
      SELECT COUNT(*) as active_staff FROM staff WHERE is_active = true
    `

    return Response.json({
      totalTokensToday: Number(tokenStats[0].total_tokens),
      activeTokens: Number(tokenStats[0].active_tokens),
      completedTokens: Number(tokenStats[0].completed_tokens),
      averageWaitTime: Math.round(Number(tokenStats[0].avg_wait_time) || 0),
      activeBranches: Number(branchStats[0].active_branches),
      activeStaff: Number(staffStats[0].active_staff),
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
