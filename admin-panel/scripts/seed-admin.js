const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdmin() {
  const email = "admin@trainer.com";
  const password = "admin-password-123";
  const username = "Admin";

  const password_hash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password_hash,
      role: "admin",
    },
    create: {
      email,
      username,
      password_hash,
      role: "admin",
    },
  });

  console.log(`\n✅ Admin user created successfully!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}\n`);

  await prisma.$disconnect();
}

createAdmin().catch((e) => {
  console.error(e);
  process.exit(1);
});
