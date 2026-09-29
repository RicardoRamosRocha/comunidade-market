# ??? Arquitetura e Modelagem do Banco de Dados

## ??? Esquema do Banco de Dados (PostgreSQL)

### 1. Tabela: \users\
- \id\ (UUID, PK)
- \
ame\ (VARCHAR)
- \email\ (VARCHAR, UNIQUE)
- \password_hash\ (VARCHAR)
- \ole\ (ENUM: 'CLIENT', 'SELLER', 'ADMIN')
- \is_community_member\ (BOOLEAN)
- \created_at\ (TIMESTAMP)

### 2. Tabela: \stores\
- \id\ (UUID, PK)
- \user_id\ (UUID, FK -> users.id)
- \store_name\ (VARCHAR)
- \description\ (TEXT)
- \phone\ (VARCHAR)
- \ddress\ (TEXT)
- \status\ (ENUM: 'PENDING', 'APPROVED', 'BLOCKED')

### 3. Tabela: \products\
- \id\ (UUID, PK)
- \store_id\ (UUID, FK -> stores.id)
- \	itle\ (VARCHAR)
- \description\ (TEXT)
- \price_brl\ (DECIMAL)
- \ccepts_community_coin\ (BOOLEAN)
- \stock\ (INT)

### 4. Tabela: \wallets\
- \id\ (UUID, PK)
- \user_id\ (UUID, FK -> users.id, UNIQUE)
- \alance_brl\ (DECIMAL)
- \alance_coin\ (DECIMAL)

### 5. Tabela: \	ransactions\
- \id\ (UUID, PK)
- \sender_wallet_id\ (UUID, FK -> wallets.id)
- \eceiver_wallet_id\ (UUID, FK -> wallets.id)
- \mount\ (DECIMAL)
- \currency_type\ (ENUM: 'BRL', 'COMMUNITY_COIN')
- \	ype\ (ENUM: 'P2P', 'PURCHASE', 'CASHBACK', 'WITHDRAWAL')
- \created_at\ (TIMESTAMP)
