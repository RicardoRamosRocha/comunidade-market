import { prisma } from "./src/lib/prisma.js";

async function run() {
  const wallets = await prisma.wallet.findMany({
    include: { user: true },
  });
  console.log(JSON.stringify(wallets, null, 2));
  process.exit(0);
}

run();