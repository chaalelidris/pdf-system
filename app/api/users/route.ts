import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { hashPassword } from "@/lib/auth"
import { db } from "@/lib/db"

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "user"]),
})

export async function POST(request: NextRequest) {
  // Check if user is admin
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
  }

  try {
    const body = await request.json()

    // Validate request body
    const result = userSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ message: "Invalid input data" }, { status: 400 })
    }

    const { name, email, password, role } = result.data

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    })

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
