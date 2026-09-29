# ??? Arquitetura e Modelagem do Banco de Dados

## ??? Modelo Relacional (PostgreSQL)

Abaixo está a definição da estrutura do banco de dados para suportar a plataforma de e-commerce e a carteira digital.

---

### 1. Tabela: users
Armazena todos os usuários da plataforma (Clientes, Lojistas e Administradores).

| Coluna | Tipo | Restrições / Descrição |
| :--- | :--- | :--- |
| id | UUID | **PK**, Padrão: gen_random_uuid() |
| 
ame | VARCHAR(150) | Nome completo |
| email | VARCHAR(150) | **UNIQUE**, E-mail de acesso |
| password_hash | VARCHAR(255) | Senha criptografada |
| ole | VARCHAR(20) | CLIENT, SELLER, ADMIN |
| is_community_member | BOOLEAN | Indica se possui selo comunitário |
| created_at | TIMESTAMP | Data de cadastro |

---

### 2. Tabela: stores
Armazena o perfil empresarial das empresas cadastradas.

| Coluna | Tipo | Restrições / Descrição |
| :--- | :--- | :--- |
| id | UUID | **PK** |
| user_id | UUID | **FK** -> users.id |
| store_name | VARCHAR(150) | Nome da loja |
| description | TEXT | Descrição dos serviços/produtos |
| phone | VARCHAR(20) | WhatsApp / Telefone |
| ddress | TEXT | Endereço físico |
| status | VARCHAR(20) | PENDING, APPROVED, BLOCKED |

---

### 3. Tabela: products
Catálogo de produtos e serviços ofertados pelos lojistas.

| Coluna | Tipo | Restrições / Descrição |
| :--- | :--- | :--- |
| id | UUID | **PK** |
| store_id | UUID | **FK** -> stores.id |
| 	itle | VARCHAR(150) | Nome do produto/serviço |
| description | TEXT | Detalhes do item |
| price_brl | NUMERIC(10,2) | Preço em Reais (R\$) |
| ccepts_community_coin | BOOLEAN | Se aceita a moeda da comunidade |
| stock | INTEGER | Quantidade em estoque |

---

### 4. Tabela: wallets
Carteira digital vinculada a cada usuário para gestão dos saldos.

| Coluna | Tipo | Restrições / Descrição |
| :--- | :--- | :--- |
| id | UUID | **PK** |
| user_id | UUID | **FK** -> users.id (**UNIQUE**) |
| alance_brl | NUMERIC(10,2) | Saldo em Reais (R\$) |
| alance_coin | NUMERIC(10,2) | Saldo na Moeda Comunitária |

---

### 5. Tabela: 	ransactions
Registra toda a movimentação financeira (compras, transferências P2P, cashback e saques).

| Coluna | Tipo | Restrições / Descrição |
| :--- | :--- | :--- |
| id | UUID | **PK** |
| sender_wallet_id | UUID | **FK** -> wallets.id |
| eceiver_wallet_id | UUID | **FK** -> wallets.id |
| mount | NUMERIC(10,2) | Valor movimentado |
| currency_type | VARCHAR(20) | BRL ou COMMUNITY_COIN |
| 	ype | VARCHAR(20) | P2P, PURCHASE, CASHBACK, WITHDRAWAL |
| created_at | TIMESTAMP | Data da transação |
