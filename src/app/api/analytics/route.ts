import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authConfig } from "@/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, page, properties } = body

    if (!event) {
      return NextResponse.json({ error: "Event name is required" }, { status: 400 })
    }

    // Get user session (optional for analytics)
    const session = await getServerSession(authConfig)

    // Extract request information
    const userAgent = request.headers.get("user-agent") || ""
    const referer = request.headers.get("referer")
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const cfIp = request.headers.get("cf-connecting-ip")
    const ipAddress = forwarded?.split(",")[0] || realIp || cfIp || "unknown"

    // Parse user agent for device/browser info (basic parsing)
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent)
    const device = isMobile ? "mobile" : "desktop"
    
    let browser = "unknown"
    if (userAgent.includes("Chrome")) browser = "Chrome"
    else if (userAgent.includes("Firefox")) browser = "Firefox"
    else if (userAgent.includes("Safari")) browser = "Safari"
    else if (userAgent.includes("Edge")) browser = "Edge"

    let os = "unknown"
    if (userAgent.includes("Windows")) os = "Windows"
    else if (userAgent.includes("Mac OS")) os = "macOS"
    else if (userAgent.includes("Linux")) os = "Linux"
    else if (userAgent.includes("Android")) os = "Android"
    else if (userAgent.includes("iOS")) os = "iOS"

    // Create analytics record
    await prisma.analytics.create({
      data: {
        userId: session?.user?.id,
        event,
        page,
        referrer: referer,
        userAgent,
        ipAddress,
        device,
        browser,
        os,
        properties,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json(
      { error: "Failed to record analytics" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "7d"
    const event = searchParams.get("event")

    // Calculate date range
    let startDate: Date
    switch (timeRange) {
      case "1d":
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
        break
      case "7d":
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }

    const where = {
      createdAt: {
        gte: startDate,
      },
      ...(event && { event }),
    }

    // Get analytics data
    const [
      totalEvents,
      eventBreakdown,
      pageViews,
      deviceBreakdown,
      browserBreakdown,
      countryBreakdown,
    ] = await Promise.all([
      // Total events count
      prisma.analytics.count({ where }),

      // Event breakdown
      prisma.analytics.groupBy({
        by: ["event"],
        where,
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
      }),

      // Top pages
      prisma.analytics.groupBy({
        by: ["page"],
        where: {
          ...where,
          event: "page_view",
          page: {
            not: null,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
        take: 10,
      }),

      // Device breakdown
      prisma.analytics.groupBy({
        by: ["device"],
        where,
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
      }),

      // Browser breakdown
      prisma.analytics.groupBy({
        by: ["browser"],
        where,
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
      }),

      // Country breakdown
      prisma.analytics.groupBy({
        by: ["country"],
        where: {
          ...where,
          country: {
            not: null,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
        take: 10,
      }),
    ])

    // Get daily analytics for chart
    const dailyAnalytics = await prisma.analytics.groupBy({
      by: ["createdAt"],
      where,
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Group daily analytics by date
    const dailyData = dailyAnalytics.reduce((acc, item) => {
      const date = item.createdAt.toISOString().split("T")[0]
      acc[date] = (acc[date] || 0) + item._count.id
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      summary: {
        totalEvents,
        timeRange,
      },
      events: eventBreakdown.map(item => ({
        event: item.event,
        count: item._count.id,
      })),
      pages: pageViews.map(item => ({
        page: item.page,
        views: item._count.id,
      })),
      devices: deviceBreakdown.map(item => ({
        device: item.device,
        count: item._count.id,
      })),
      browsers: browserBreakdown.map(item => ({
        browser: item.browser,
        count: item._count.id,
      })),
      countries: countryBreakdown.map(item => ({
        country: item.country,
        count: item._count.id,
      })),
      dailyData,
    })
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}