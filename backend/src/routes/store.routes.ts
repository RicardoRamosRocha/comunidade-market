import { Router, Request, Response } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated.js";

const storeRoutes = Router();

// POST /stores - Cadastrar uma nova loja (Requer Autenticação)
storeRoutes.post("/", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { name, storeName, description, category } = req.body;

    // Garante o preenchimento do nome
    const finalName = name || storeName;

    if (!finalName || !category) {
      return res.status(400).json({ error: "Nome da loja e categoria são obrigatórios." });
    }

    // Verifica se o usuário já possui uma loja cadastrada
    const existingStore = await prisma.store.findFirst({
      where: { userId },
    });

    if (existingStore) {
      return res.status(400).json({ error: "Você já possui uma loja cadastrada." });
    }

    // Grava no banco com os atributos reais do modelo
    const store = await prisma.store.create({
      data: {
        userId,
        name: finalName,
        description,
        category,
      },
    });

    // Atualiza o papel do usuário para SELLER
    await prisma.user.update({
      where: { id: userId },
      data: { role: Role.SELLER },
    });

    return res.status(201).json(store);
  } catch (error) {
    console.error("Erro no cadastro de loja:", error);
    return res.status(500).json({ error: "Erro interno ao cadastrar loja." });
  }
});

// GET /stores/me - Consultar a loja do usuário logado
storeRoutes.get("/me", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const store = await prisma.store.findFirst({
      where: { userId },
      include: { products: true },
    });

    if (!store) {
      return res.status(404).json({ error: "Você ainda não possui uma loja cadastrada." });
    }

    return res.json(store);
  } catch (error) {
    console.error("Erro ao buscar loja:", error);
    return res.status(500).json({ error: "Erro interno ao buscar loja." });
  }
});

export { storeRoutes };