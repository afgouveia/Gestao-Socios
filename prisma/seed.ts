const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@gestao-socios.local" },
    update: { password: adminPassword, role: "ADMIN" },
    create: {
      email: "admin@gestao-socios.local",
      name: "Administrador",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.member.upsert({
    where: { id: "example-member" },
    update: {
      address: "Rua do Monte de Baixo 129, 4535-309 Parada",
      nif: "232324526",
      email: "adao.santonio@gmail.com",
      phone: "913913913",
      category: "Utente",
      submittedAt: new Date("2025-06-25"),
      note: "Sócio de exemplo.",
    },
    create: {
      id: "example-member",
      name: "António Exemplo",
      address: "Rua do Monte de Baixo 129, 4535-309 Parada",
      nif: "232324526",
      birthDate: new Date("1978-03-11"),
      email: "adao.santonio@gmail.com",
      phone: "913913913",
      submittedAt: new Date("2025-06-25"),
      category: "Utente",
      note: "Sócio de exemplo.",
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
