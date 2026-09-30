import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRoutes } from "./routes/auth.routes.js";
import { walletRoutes } from "./routes/wallet.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

// Rotas da API
app.use("/auth", authRoutes);
app.use("/wallet", walletRoutes);

app.get("/health", (req, res) => {
  return res.json({ 
    status: "ok", 
    message: "Comunidade Market API rodando com sucesso!" 
  });
});

app.listen(PORT, () => {
  console.log("🚀 Servidor rodando na porta " + PORT);
});
