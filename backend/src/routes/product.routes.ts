import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated.js";

const productRoutes = Router();

// POST /products - Cadastrar um novo produto (Requer loja cadastrada)
productRoutes.post("/", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { title, name, description, priceBrl, priceCoin, acceptsCommunityCoin, stock, imageUrl } = req.body;

    const finalName = name || title;

    if (!finalName || priceBrl === undefined) {
      return res.status(400).json({ error: "Nome/Título e preço em BRL são obrigatórios." });
    }

    // Busca a loja do usuário autenticado
    const store = await prisma.store.findFirst({
      where: { userId },
    });

    if (!store) {
      return res.status(403).json({ error: "Você precisa cadastrar uma loja antes de criar produtos." });
    }

    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        name: finalName,
        description: description || null,
        priceBrl,
        priceCoin: priceCoin || null,
        acceptsCommunityCoin: acceptsCommunityCoin ?? true,
        stock: stock ?? 1,
        imageUrl: imageUrl || null,
      },
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error("Erro detalhado ao cadastrar produto:", error);
    return res.status(500).json({ error: "Erro ao cadastrar produto." });
  }
});

// GET /products - Listar todos os produtos com informações da loja
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
    console.error("Erro detalhado ao buscar produtos:", error);
    return res.status(500).json({ error: "Erro ao buscar produtos." });
  }
});

export { productRoutes };