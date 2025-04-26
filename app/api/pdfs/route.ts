import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  // 1. Auth check
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Query params
    const qp = request.nextUrl.searchParams;
    const page = parseInt(qp.get("page") || "1", 10);
    const limit = parseInt(qp.get("limit") || "10", 10);
    const search = qp.get("search")?.trim() || "";
    const category = qp.get("category") || "";
    const type = qp.get("type") || "";
    const origin = qp.get("origin") || "";

    const skip = (page - 1) * limit;

    // 3. Build WHERE fragments + params
    const filters: string[] = [];
    const params: any[] = [];

    if (search) {
      filters.push(`LOWER("title") LIKE LOWER($${params.length + 1})`);
      params.push(`%${search}%`);
    }
    if (category) {
      filters.push(`"category" = $${params.length + 1}`);
      params.push(category);
    }
    if (type) {
      filters.push(`"type" = $${params.length + 1}`);
      params.push(type);
    }
    if (origin) {
      filters.push(`"origin" = $${params.length + 1}`);
      params.push(origin);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    // 4. Total count
    const countResult: { count: bigint }[] = await db.$queryRawUnsafe(
      `SELECT COUNT(*) AS count FROM "Pdf" ${whereClause};`,
      ...params
    );
    const total = Number(countResult[0]?.count ?? 0);

    // 5. Paginated fetch (SQLite wants LIMIT then OFFSET)
    const pdfs = await db.$queryRawUnsafe<
      Array<{
        id: string;
        title: string;
        filename: string;
        fileNumber: string;
        category: string;
        type: string;
        origin: string;
        createdAt: string; // or Date, depending on your driver
      }>
    >(
      `
      SELECT
        "id", "title", "filename", "fileNumber", "category", "type", "origin", "createdAt"
      FROM "Pdf"
      ${whereClause}
      ORDER BY "createdAt" DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2};
      `,
      ...params,
      limit,
      skip
    );

    return NextResponse.json({
      pdfs: pdfs.map((p) => ({
        ...p,
        createdAt: new Date(p.createdAt),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get PDFs error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
