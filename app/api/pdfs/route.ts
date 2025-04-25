import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  // Check if user is authenticated
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get all PDFs
    const pdfs = await db.pdf.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      pdfs: pdfs.map((pdf) => ({
        id: pdf.id,
        title: pdf.title,
        filename: pdf.filename,
        category: pdf.category,
        createdAt: pdf.createdAt,
      })),
    })
  } catch (error) {
    console.error("Get PDFs error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
