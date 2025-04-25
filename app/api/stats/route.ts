import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { PdfType } from "@/lib/types";

export async function GET(request: NextRequest) {
  // Check if user is admin
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    // Get total PDFs
    const totalPdfs = await db.pdf.count();

    // Get total users
    const totalUsers = await db.user.count();

    // Get recent uploads (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUploads = await db.pdf.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    return NextResponse.json({
      totalPdfs,
      totalUsers,
      recentUploads,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
