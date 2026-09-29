# ?? Comunidade Market

> **Marketplace & Ecossistema Financeiro Comunitário**

O **Comunidade Market** é uma plataforma e-commerce e financeira desenvolvida para conectar empresas, prestadores de serviços e consumidores de uma mesma comunidade religiosa. A plataforma permite transações financeiras em **Reais (R$)** e por meio de uma **Moeda Social/Comunitária** com foco em economia circular e apoio mútuo.

---

## ?? Objetivos do Projeto

- **Fortalecimento Comunitário:** Incentivar o comércio local e o apoio entre empreendedores e membros.
- **Abertura Externa:** Permitir que empresas locais comercializem seus produtos para clientes externos com pagamentos tradicionais.
- **Economia Circular:** Implementar uma moeda interna (token/crédito) com suporte a cashback e carteira digital (*In-App Wallet*).

---

## ??? Tecnologias Utilizadas

| Camada | Tecnologia |
| :--- | :--- |
| **Front-end Mobile** | React Native / Flutter |
| **Front-end Web** | Next.js (Admin & Vitrine Web) |
| **Back-end** | Node.js (NestJS / Express) |
| **Banco de Dados** | PostgreSQL + Redis (Cache) |
| **Gateway de Pagamento** | Mercado Pago / Asaas (com Split de Pagamentos) |
| **Infraestrutura** | Docker & GitHub Actions (CI/CD) |

---

## ?? Principais Funcionalidades (MVP)

1. **Gestão de Usuários e Perfis:**
   - Perfis de *Cliente*, *Lojista/Empreendedor* e *Administrador*.
   - Selo de verificação de membro da comunidade.
2. **Catálogo & Marketplace:**
   - Vitrine de produtos e serviços com filtros e busca por categoria.
3. **Checkout & Pagamentos:**
   - Suporte a Pix, Cartão e Boleto.
   - Pagamento misto (Reais + Moeda Comunitária).
   - Split automático da comissão da plataforma.
4. **Carteira Digital & Moeda Comunitária:**
   - Consulta de saldo (R\$ e Moeda Comunitária).
   - Transferências P2P entre membros via QR Code.

---

## ?? Documentação Técnica

Toda a documentação detalhada do projeto está localizada na pasta docs/:

- [?? Guia de Contribuição (CONTRIBUTING.md)](docs/CONTRIBUTING.md)
- [?? Histórias de Usuário (USER_STORIES.md)](docs/USER_STORIES.md)
- [??? Modelagem e Arquitetura do Banco de Dados (ARCHITECTURE.md)](docs/ARCHITECTURE.md)
