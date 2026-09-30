import { prisma } from './src/lib/prisma.js';

async function main() {
  // Garantir/Criar o utilizador do João com a carteira de destino
  const joao = await prisma.user.upsert({
    where: { email: 'joao@email.com' },
    update: {},
    create: {
      name: 'João Souza',
      email: 'joao@email.com',
      passwordHash: 'hash_falso',
      wallet: {
        create: {
          id: '2f38d5af-6b62-4f19-ad2b-733e85746b10',
          balanceBrl: 0,
          balanceCoin: 0,
        },
      },
    },
  });

  console.log('Carteira do João configurada com sucesso!', joao.id);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Erro ao configurar o João:', err);
    process.exit(1);
  });