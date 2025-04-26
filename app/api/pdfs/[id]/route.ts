import { type NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { readFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { z } from "zod";

// Schema for PDF update
const pdfUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  origin: z.string().min(1).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const param = await params;
    const id = param.id;

    // Find PDF in database
    const pdf = await db.pdf.findUnique({
      where: {
        id,
      },
    });

    if (!pdf) {
      return NextResponse.json({ message: "PDF not found" }, { status: 404 });
    }

    // If the request is for file download (contains "download" query param)
    if (request.nextUrl.searchParams.has("download")) {
      // Get file path
      const filePath = join(process.cwd(), "storage", "pdfs", pdf.filename);

      // Check if file exists
      if (!existsSync(filePath)) {
        return NextResponse.json(
          { message: "PDF file not found" },
          { status: 404 }
        );
      }

      // Read file
      const fileBuffer = await readFile(filePath);

      // Return file as response
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${pdf.title}.pdf"`,
        },
      });
    }

    // Otherwise return the PDF metadata
    return NextResponse.json({
      pdf: {
        id: pdf.id,
        title: pdf.title,
        filename: pdf.filename,
        category: pdf.category,
        type: pdf.type,
        origin: pdf.origin,
        createdAt: pdf.createdAt,
      },
    });
  } catch (error) {
    console.error("Get PDF error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check if user is admin
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const param = await params;
    const id = param.id;
    const body = await request.json();

    // Validate request body
    const result = pdfUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid input data" },
        { status: 400 }
      );
    }

    // Find PDF in database
    const existingPdf = await db.pdf.findUnique({
      where: {
        id,
      },
    });

    if (!existingPdf) {
      return NextResponse.json({ message: "PDF not found" }, { status: 404 });
    }

    // Update PDF
    const updatedPdf = await db.pdf.update({
      where: {
        id,
      },
      data: result.data,
    });

    return NextResponse.json({
      message: "PDF updated successfully",
      pdf: {
        id: updatedPdf.id,
        title: updatedPdf.title,
        filename: updatedPdf.filename,
        category: updatedPdf.category,
        type: updatedPdf.type,
        origin: updatedPdf.origin,
        createdAt: updatedPdf.createdAt,
      },
    });
  } catch (error) {
    console.error("Update PDF error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check if user is admin
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const param = await params;
    const id = param.id;

    // Find PDF in database
    const pdf = await db.pdf.findUnique({
      where: {
        id,
      },
    });

    if (!pdf) {
      return NextResponse.json({ message: "PDF not found" }, { status: 404 });
    }

    // Get file path
    const filePath = join(process.cwd(), "storage", "pdfs", pdf.filename);

    // Delete file if exists
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    // Delete from database
    await db.pdf.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "PDF deleted successfully",
    });
  } catch (error) {
    console.error("Delete PDF error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
