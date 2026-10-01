import { Router, Request, Response } from "express";
import { Prisma, Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated.js";

const productRoutes = Router();

// GET /products - Listar todos os produtos para o Feed
productRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        store: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(products);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return res.status(500).json({ error: "Erro ao buscar produtos." });
  }
});

// POST /products - Cadastrar novo produto (Lojista Autenticado)
productRoutes.post("/", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { name, description, priceBrl, acceptsCommunityCoin, stock } = req.body;

    if (!name || !priceBrl) {
      return res.status(400).json({ error: "Nome e preço em Reais são obrigatórios." });
    }

    const store = await prisma.store.findFirst({
      where: { userId },
    });

    if (!store) {
      return res.status(400).json({ error: "Você precisa cadastrar uma loja antes de criar produtos." });
    }

    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        name,
        description,
        priceBrl: Number(priceBrl),
        acceptsCommunityCoin: Boolean(acceptsCommunityCoin),
        stock: stock ? Number(stock) : 1,
      },
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error("Erro ao cadastrar produto:", error);
    return res.status(500).json({ error: "Erro ao cadastrar produto." });
  }
});

// POST /products/purchase - Compra direta via Carteira
productRoutes.post("/purchase", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const buyerId = req.user.id;
    const { productId, currencyType } = req.body;

    if (!productId || !currencyType) {
      return res.status(400).json({ error: "ID do produto e tipo de moeda são obrigatórios." });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: {
          include: {
            user: {
              include: { wallet: true },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    if (product.stock < 1) {
      return res.status(400).json({ error: "Produto esgotado." });
    }

    const buyerWallet = await prisma.wallet.findUnique({
      where: { userId: buyerId },
    });

    if (!buyerWallet) {
      return res.status(404).json({ error: "Carteira do comprador não encontrada." });
    }

    const sellerWallet = product.store.user.wallet;
    if (!sellerWallet) {
      return res.status(400).json({ error: "Carteira do vendedor não configurada." });
    }

    if (buyerWallet.id === sellerWallet.id) {
      return res.status(400).json({ error: "Você não pode comprar o seu próprio produto." });
    }

    let priceToPay = 0;
    if (currencyType === "COMMUNITY_COIN") {
      if (!product.acceptsCommunityCoin) {
        return res.status(400).json({ error: "Este produto não aceita Moeda Social." });
      }
      priceToPay = Number(product.priceCoin || product.priceBrl);
      if (Number(buyerWallet.balanceCoin) < priceToPay) {
        return res.status(400).json({ error: "Saldo insuficiente em Moeda Social." });
      }
    } else {
      priceToPay = Number(product.priceBrl);
      if (Number(buyerWallet.balanceBrl) < priceToPay) {
        return res.status(400).json({ error: "Saldo insuficiente em Reais (BRL)." });
      }
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (currencyType === "COMMUNITY_COIN") {
        await tx.wallet.update({
          where: { id: buyerWallet.id },
          data: { balanceCoin: { decrement: priceToPay } },
        });
        await tx.wallet.update({
          where: { id: sellerWallet.id },
          data: { balanceCoin: { increment: priceToPay } },
        });
      } else {
        await tx.wallet.update({
          where: { id: buyerWallet.id },
          data: { balanceBrl: { decrement: priceToPay } },
        });
        await tx.wallet.update({
          where: { id: sellerWallet.id },
          data: { balanceBrl: { increment: priceToPay } },
        });
      }

      await tx.product.update({
        where: { id: productId },
        data: { stock: { decrement: 1 } },
      });

      await tx.transaction.create({
        data: {
          senderWalletId: buyerWallet.id,
          receiverWalletId: sellerWallet.id,
          amount: priceToPay,
          currencyType: currencyType === "COMMUNITY_COIN" ? "COMMUNITY_COIN" : "BRL",
          type: "PURCHASE",
        },
      });
    });

    return res.status(200).json({ message: "Compra realizada com sucesso!" });
  } catch (error) {
    console.error("Erro ao realizar compra:", error);
    return res.status(500).json({ error: "Erro interno ao processar compra." });
  }
});

export { productRoutes };