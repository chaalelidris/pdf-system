import { type NextRequest, NextResponse } from "next/server"
import { join } from "path"
import { readFile, unlink } from "fs/promises"
import { existsSync } from "fs"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  // Check if user is authenticated
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const filename = params.filename

    // Find PDF in database
    const pdf = await db.pdf.findFirst({
      where: {
        filename,
      },
    })

    if (!pdf) {
      return NextResponse.json({ message: "PDF not found" }, { status: 404 })
    }

    // Get file path
    const filePath = join(process.cwd(), "storage", "pdfs", filename)

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({ message: "PDF file not found" }, { status: 404 })
    }

    // Read file
    const fileBuffer = await readFile(filePath)

    // Return file as response
    const response = new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdf.title}.pdf"`,
      },
    })

    return response
  } catch (error) {
    console.error("Get PDF error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { filename: string } }) {
  // Check if user is admin
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
  }

  try {
    const id = params.filename

    // Find PDF in database
    const pdf = await db.pdf.findUnique({
      where: {
        id,
      },
    })

    if (!pdf) {
      return NextResponse.json({ message: "PDF not found" }, { status: 404 })
    }

    // Get file path
    const filePath = join(process.cwd(), "storage", "pdfs", pdf.filename)

    // Delete file if exists
    if (existsSync(filePath)) {
      await unlink(filePath)
    }

    // Delete from database
    await db.pdf.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({
      message: "PDF deleted successfully",
    })
  } catch (error) {
    console.error("Delete PDF error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
