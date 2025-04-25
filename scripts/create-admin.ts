import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  try {
    const [
      adminEmail = "admin@military.gov",
      adminPassword = "admin123",
      adminName = "System Administrator",
    ] = process.argv.slice(3);

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`Admin user with email ${adminEmail} already exists.`);
      return;
    }

    // Hash password
    const hashedPassword = await hash(adminPassword, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      },
    });

    console.log(`Admin user created successfully:`);
    console.log(`- Name: ${admin.name}`);
    console.log(`- Email: ${admin.email}`);
    console.log(`- Role: ${admin.role}`);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
