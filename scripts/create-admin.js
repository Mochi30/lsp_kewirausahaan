const bcrypt = require("bcryptjs");
const prisma = require("../api/lib/db");

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error("Set ADMIN_EMAIL dan ADMIN_PASSWORD.");
    process.exit(1);
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    console.error("User sudah ada.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, name, passwordHash, role: "admin" },
  });
  console.log("Admin created.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
