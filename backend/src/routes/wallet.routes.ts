import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated.js";

const walletRoutes = Router();

// Exige autenticação em todas as rotas de carteira
walletRoutes.use(ensureAuthenticated);

// GET /wallet/me - Consulta de Saldo e Dados da Carteira do Usuário Logado
walletRoutes.get("/me", async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        sentTransactions: { take: 5, orderBy: { createdAt: "desc" } },
        receivedTransactions: { take: 5, orderBy: { createdAt: "desc" } },
      },
    });

    if (!wallet) {
      return res.status(404).json({ error: "Carteira não encontrada." });
    }

    return res.json(wallet);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar dados da carteira." });
  }
});

// POST /wallet/transfer - Transferência P2P entre Membros (Aceita Wallet ID, User ID ou E-mail)
walletRoutes.post("/transfer", async (req: Request, res: Response) => {
  try {
    const senderUserId = req.user.id;
    const { receiverWalletId, amount, currencyType } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "O valor da transferência deve ser maior que zero." });
    }

    if (!["BRL", "COMMUNITY_COIN"].includes(currencyType)) {
      return res.status(400).json({ error: "Tipo de moeda inválido." });
    }

    // Buscar a carteira do remetente
    const senderWallet = await prisma.wallet.findUnique({ where: { userId: senderUserId } });
    if (!senderWallet) {
      return res.status(404).json({ error: "Carteira de origem não encontrada." });
    }

    // Limpa espaços invisíveis caso o usuário tenha copiado e colado o identificador
    const searchKey = receiverWalletId ? String(receiverWalletId).trim() : "";

    // Evita transferência para si mesmo (checa Wallet ID ou User ID do remetente)
    if (senderWallet.id === searchKey || senderWallet.userId === searchKey) {
      return res.status(400).json({ error: "Você não pode transferir para si mesmo." });
    }

    // Busca flexível do destinatário: procura por Wallet ID, por User ID ou por E-mail do usuário
    const receiverWallet = await prisma.wallet.findFirst({
      where: {
        OR: [
          { id: searchKey },
          { userId: searchKey },
          { user: { email: searchKey } }
        ]
      }
    });

    if (!receiverWallet) {
      return res.status(404).json({ error: "Carteira ou usuário destinatário não encontrado." });
    }

    // Impede transferência para si mesmo via e-mail
    if (receiverWallet.id === senderWallet.id) {
      return res.status(400).json({ error: "Você não pode transferir para si mesmo." });
    }

    // Verificar saldo suficiente
    const fieldToCheck = currencyType === "BRL" ? "balanceBrl" : "balanceCoin";
    const currentBalance = Number(senderWallet[fieldToCheck]);

    if (currentBalance < Number(amount)) {
      return res.status(400).json({ error: "Saldo insuficiente para realizar a transferência." });
    }

    // Executar a transferência e o registro da transação de forma atômica
    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Debitar do remetente
      await tx.wallet.update({
        where: { id: senderWallet.id },
        data: {
          [fieldToCheck]: { decrement: amount },
        },
      });

      // 2. Creditar no destinatário
      await tx.wallet.update({
        where: { id: receiverWallet.id },
        data: {
          [fieldToCheck]: { increment: amount },
        },
      });

      // 3. Registrar o histórico da transação
      return await tx.transaction.create({
        data: {
          senderWalletId: senderWallet.id,
          receiverWalletId: receiverWallet.id,
          amount,
          currencyType,
          type: "P2P",
        },
      });
    });

    return res.status(201).json({
      message: "Transferência realizada com sucesso!",
      transaction,
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno ao processar transferência." });
  }
});

export { walletRoutes };