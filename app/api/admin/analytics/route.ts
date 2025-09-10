import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "7")

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split("T")[0]

    // Basic stats
    const basicStats = await sql`
      SELECT 
        COUNT(*) as total_tokens,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tokens,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_tokens,
        AVG(CASE WHEN status = 'completed' THEN estimated_wait_time END) as avg_wait_time,
        AVG(CASE WHEN status = 'completed' THEN 
          EXTRACT(EPOCH FROM (updated_at - created_at))/60 
        END) as avg_service_time
      FROM tokens 
      WHERE DATE(created_at) >= ${startDateStr}
    `

    // Service performance
    const serviceStats = await sql`
      SELECT 
        s.name as service_name,
        COUNT(t.id) as count,
        AVG(t.estimated_wait_time) as avg_wait
      FROM tokens t
      JOIN services s ON t.service_id = s.id
      WHERE DATE(t.created_at) >= ${startDateStr}
      GROUP BY s.id, s.name
      ORDER BY count DESC
    `

    // Peak hours
    const peakHours = await sql`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM tokens 
      WHERE DATE(created_at) >= ${startDateStr}
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY count DESC
    `

    // Daily stats
    const dailyStats = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as tokens,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM tokens 
      WHERE DATE(created_at) >= ${startDateStr}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `

    return Response.json({
      totalTokens: Number(basicStats[0].total_tokens),
      completedTokens: Number(basicStats[0].completed_tokens),
      cancelledTokens: Number(basicStats[0].cancelled_tokens),
      averageWaitTime: Math.round(Number(basicStats[0].avg_wait_time) || 0),
      averageServiceTime: Math.round(Number(basicStats[0].avg_service_time) || 0),
      serviceStats: serviceStats.map((s) => ({
        service_name: s.service_name,
        count: Number(s.count),
        avg_wait: Math.round(Number(s.avg_wait) || 0),
      })),
      peakHours: peakHours.map((h) => ({
        hour: Number(h.hour),
        count: Number(h.count),
      })),
      dailyStats: dailyStats.map((d) => ({
        date: d.date,
        tokens: Number(d.tokens),
        completed: Number(d.completed),
      })),
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return Response.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
