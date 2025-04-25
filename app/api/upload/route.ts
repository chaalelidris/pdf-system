import { type NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import type { Category, PdfType, PdfOrigin } from "@/lib/types";

export async function POST(request: NextRequest) {
  // Check if user is admin
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const category = formData.get("category") as Category;
    const type = formData.get("type") as PdfType;
    const origin = formData.get("origin") as PdfOrigin;

    if (!file || !title || !category) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { message: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Create storage directory if it doesn't exist
    const storageDir = join(process.cwd(), "storage", "pdfs");
    if (!existsSync(storageDir)) {
      await mkdir(storageDir, { recursive: true });
    }

    // Generate unique filename
    const uniqueId = uuidv4();
    const filename = `${uniqueId}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = join(storageDir, filename);

    // Save file to storage
    const fileBuffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(fileBuffer));

    // Save metadata to database
    const pdf = await db.pdf.create({
      data: {
        title,
        filename,
        category,
        type,
        origin,
      },
    });

    return NextResponse.json({
      message: "PDF uploaded successfully",
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
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
