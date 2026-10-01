import { prisma } from "./src/lib/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  // Limpa dados antigos por garantia
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("123456", 8);

  // 1. Criar João Souza
  const joao = await prisma.user.create({
    data: {
      name: "João Souza",
      email: "joao@email.com",
      passwordHash,
      role: "CLIENT",
      isCommunityMember: true,
      wallet: {
        create: {
          balanceBrl: 100,
          balanceCoin: 50,
        },
      },
    },
    include: { wallet: true },
  });

  // 2. Criar Maria Silva
  const maria = await prisma.user.create({
    data: {
      name: "Maria Silva",
      email: "maria@email.com",
      passwordHash,
      role: "CLIENT",
      isCommunityMember: true,
      wallet: {
        create: {
          balanceBrl: 100,
          balanceCoin: 50,
        },
      },
    },
    include: { wallet: true },
  });

  console.log("🌱 Banco repovoado com sucesso!");
  console.log("-----------------------------------------");
  console.log(`João Souza  -> User ID: ${joao.id} | Wallet ID: ${joao.wallet?.id}`);
  console.log(`Maria Silva -> User ID: ${maria.id} | Wallet ID: ${maria.wallet?.id}`);
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });