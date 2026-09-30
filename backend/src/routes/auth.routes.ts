import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const authRoutes = Router();
const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_comunidade_market";

authRoutes.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, isCommunityMember } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: "E-mail já cadastrado na plataforma." });
    }

    const passwordHash = await bcrypt.hash(password, 8);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || "CLIENT",
        isCommunityMember: isCommunityMember || false,
        wallet: {
          create: {
            balanceBrl: 0,
            balanceCoin: 0,
          },
        },
      },
      include: {
        wallet: true,
      },
    });

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isCommunityMember: user.isCommunityMember,
        wallet: user.wallet,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno ao cadastrar usuário." });
  }
});

authRoutes.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallet: true },
    });

    if (!user) {
      return res.status(400).json({ error: "E-mail ou senha incorretos." });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(400).json({ error: "E-mail ou senha incorretos." });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login realizado com sucesso!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isCommunityMember: user.isCommunityMember,
        wallet: user.wallet,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno ao realizar login." });
  }
});

export { authRoutes };
