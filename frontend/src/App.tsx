import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { Wallet, Search, CheckCircle, Utensils, Wrench, Shirt, ArrowUpRight, ArrowDownLeft, LogOut, PlusCircle, X, Store as StoreIcon, Layers, History, ShoppingBag } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  wallet?: {
    id: string;
    balanceBrl: number;
    balanceCoin: number;
  };
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  priceBrl: number;
  priceCoin?: number | null;
  acceptsCommunityCoin: boolean;
  stock: number;
  store: {
    id: string;
    name: string;
    category: string;
  };
}

interface TransactionItem {
  id: string;
  senderWalletId: string;
  receiverWalletId: string;
  amount: number;
  currencyType: 'BRL' | 'COMMUNITY_COIN';
  type: 'P2P' | 'PURCHASE';
  createdAt: string;
}

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [email, setEmail] = useState('maria@email.com');
  const [password, setPassword] = useState('123456');
  const [receiverWalletId, setReceiverWalletId] = useState('');
  const [transferAmount, setTransferAmount] = useState('25.00');
  const [message, setMessage] = useState('');

  // Estados dos Modais
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productPrice, setProductPrice] = useState('15.00');
  const [productAcceptsCoin, setProductAcceptsCoin] = useState(true);
  const [productStock, setProductStock] = useState('10');
  const [productMessage, setProductMessage] = useState('');

  const [selectedProductForPurchase, setSelectedProductForPurchase] = useState<Product | null>(null);
  const [purchaseCurrency, setPurchaseCurrency] = useState<'BRL' | 'COMMUNITY_COIN'>('BRL');
  const [purchaseMessage, setPurchaseMessage] = useState('');

  async function fetchWallet() {
    try {
      const response = await api.get('/wallet/me');
      setUser((prev) => (prev ? { ...prev, wallet: response.data } : null));
    } catch (err) {
      console.error('Erro ao buscar carteira:', err);
    }
  }

  async function fetchProducts() {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    }
  }

  async function fetchTransactions() {
    try {
      const response = await api.get('/wallet/transactions');
      setTransactions(response.data.transactions || []);
    } catch (err) {
      console.error('Erro ao carregar histórico de transações:', err);
    }
  }

  useEffect(() => {
    async function loadUserSession() {
      const token = localStorage.getItem('@comunidade:token');
      if (token) {
        api.defaults.headers.Authorization = `Bearer ${token}`;
        try {
          const walletRes = await api.get('/wallet/me');
          setUser({
            id: walletRes.data.userId || '',
            name: 'Maria Silva',
            email: 'maria@email.com',
            wallet: walletRes.data,
          });
          await fetchProducts();
          await fetchTransactions();
        } catch (error) {
          console.error('Sessão expirada:', error);
          localStorage.removeItem('@comunidade:token');
          setUser(null);
        }
      }
    }
    loadUserSession();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      setMessage('');
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('@comunidade:token', response.data.token);
      api.defaults.headers.Authorization = `Bearer ${response.data.token}`;
      setUser({
        id: response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        wallet: response.data.user.wallet,
      });
      await fetchProducts();
      await fetchTransactions();
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Erro ao realizar login.');
    }
  }

  function handleLogout() {
    localStorage.removeItem('@comunidade:token');
    setUser(null);
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    try {
      setMessage('');
      await api.post('/wallet/transfer', {
        receiverWalletId,
        amount: Number(transferAmount),
        currencyType: 'BRL',
      });
      setMessage('Transferência realizada com sucesso!');
      await fetchWallet();
      await fetchTransactions();
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Erro na transferência.');
    }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    try {
      setProductMessage('');
      await api.post('/products', {
        name: productName,
        description: productDesc,
        priceBrl: Number(productPrice),
        acceptsCommunityCoin: productAcceptsCoin,
        stock: Number(productStock),
      });

      setProductMessage('Produto cadastrado com sucesso!');
      setProductName('');
      setProductDesc('');
      await fetchProducts();
      setTimeout(() => {
        setIsProductModalOpen(false);
        setProductMessage('');
      }, 1500);
    } catch (err: any) {
      setProductMessage(err.response?.data?.error || 'Erro ao cadastrar produto. Verifique se você já possui uma loja.');
    }
  }

  async function handleConfirmPurchase() {
    if (!selectedProductForPurchase) return;
    try {
      setPurchaseMessage('');
      await api.post('/products/purchase', {
        productId: selectedProductForPurchase.id,
        currencyType: purchaseCurrency,
      });

      setPurchaseMessage('Compra realizada com sucesso!');
      await fetchWallet();
      await fetchProducts();
      await fetchTransactions();
      setTimeout(() => {
        setSelectedProductForPurchase(null);
        setPurchaseMessage('');
      }, 1500);
    } catch (err: any) {
      setPurchaseMessage(err.response?.data?.error || 'Erro ao realizar compra.');
    }
  }

  function normalizeText(text: string | null | undefined): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  const filteredProducts = products.filter((product) => {
    const categoryFilter = normalizeText(selectedCategory);
    const storeCategory = normalizeText(product.store?.category);
    const productName = normalizeText(product.name);
    const productDesc = normalizeText(product.description);

    let matchesCategory = true;
    if (selectedCategory) {
      if (categoryFilter === 'alimentacao') {
        matchesCategory =
          storeCategory.includes('alimentacao') ||
          storeCategory.includes('comida') ||
          storeCategory.includes('padaria') ||
          productName.includes('pao') ||
          productName.includes('bolo') ||
          productName.includes('comida');
      } else if (categoryFilter === 'servicos') {
        matchesCategory =
          storeCategory.includes('servico') ||
          storeCategory.includes('manutencao') ||
          productName.includes('corte') ||
          productName.includes('servico');
      } else if (categoryFilter === 'moda') {
        matchesCategory =
          storeCategory.includes('moda') ||
          storeCategory.includes('roupa') ||
          productName.includes('camisa') ||
          productName.includes('vestido');
      } else {
        matchesCategory =
          storeCategory.includes(categoryFilter) ||
          productName.includes(categoryFilter) ||
          productDesc.includes(categoryFilter);
      }
    }

    const searchQueryNormalized = normalizeText(searchQuery);
    const matchesSearch = searchQueryNormalized
      ? productName.includes(searchQueryNormalized) ||
        normalizeText(product.store?.name).includes(searchQueryNormalized)
      : true;

    return matchesCategory && matchesSearch;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Comunidade Market</h1>
            <p className="text-slate-500 text-sm">Entre para acessar seu saldo e o marketplace</p>
          </div>

          {message && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium p-2.5 rounded-lg transition"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      {/* Header Topo */}
      <header className="bg-emerald-700 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">Comunidade Market</h1>
            <p className="text-xs text-emerald-100">Juntos somos mais fortes</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsProductModalOpen(true)}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition shadow-sm"
              title="Anunciar Produto"
            >
              <PlusCircle size={16} />
              <span>Novo Produto</span>
            </button>
            <button onClick={handleLogout} className="p-2 hover:bg-emerald-600 rounded-lg transition" title="Sair">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Barra de Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar produtos ou serviços..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
          />
        </div>

        {/* Card de Saldo Misto */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold tracking-wider uppercase">
            <Wallet size={16} className="text-emerald-600" />
            Sua Carteira
          </div>
          <div className="flex items-baseline justify-between border-b pb-3">
            <div>
              <span className="text-xs text-slate-400 block">Saldo BRL</span>
              <span className="text-2xl font-bold text-slate-900">
                R$ {Number(user.wallet?.balanceBrl || 0).toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Moeda Social</span>
              <span className="text-xl font-bold text-amber-500">
                🪙 {Number(user.wallet?.balanceCoin || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Form de Transferência Integrado */}
          <form onSubmit={handleTransfer} className="pt-2 space-y-3">
            <span className="text-xs font-semibold text-slate-600 block">Transferência P2P Rápida</span>
            <input
              type="text"
              placeholder="ID da Carteira / E-mail do Destinatário"
              value={receiverWalletId}
              onChange={(e) => setReceiverWalletId(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                placeholder="Valor R$"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="w-1/2 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
              <button
                type="submit"
                className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1 transition"
              >
                Transferir <ArrowUpRight size={14} />
              </button>
            </div>
          </form>

          {message && (
            <p className="text-xs text-center font-medium text-emerald-600 bg-emerald-50 p-2 rounded-lg">
              {message}
            </p>
          )}
        </div>

        {/* Card de Extrato de Movimentações */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2 text-slate-700 text-xs font-bold tracking-wider uppercase">
              <History size={16} className="text-emerald-600" />
              Últimas Movimentações
            </div>
            <span className="text-[10px] text-slate-400">{transactions.length} registros</span>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {transactions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Nenhuma movimentação realizada ainda.</p>
            ) : (
              transactions.map((tx) => {
                const isSentByMe = tx.senderWalletId === user.wallet?.id;
                const isCoin = tx.currencyType === 'COMMUNITY_COIN';

                return (
                  <div key={tx.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSentByMe ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {tx.type === 'PURCHASE' ? (
                          <ShoppingBag size={16} />
                        ) : isSentByMe ? (
                          <ArrowUpRight size={16} />
                        ) : (
                          <ArrowDownLeft size={16} />
                        )}
                      </div>
                      <div>
                        <strong className="block text-slate-800">
                          {tx.type === 'PURCHASE'
                            ? isSentByMe ? 'Compra no Marketplace' : 'Venda no Marketplace'
                            : isSentByMe ? 'Transferência Enviada' : 'Transferência Recebida'}
                        </strong>
                        <span className="text-[10px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleDateString('pt-BR')} às {new Date(tx.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className={`text-right font-bold ${isSentByMe ? 'text-slate-700' : 'text-emerald-600'}`}>
                      {isSentByMe ? '-' : '+'} {isCoin ? `🪙 ${Number(tx.amount).toFixed(2)}` : `R$ ${Number(tx.amount).toFixed(2)}`}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Categorias com Filtro Ativo */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">Categorias</h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-emerald-600 hover:underline font-medium"
              >
                Limpar filtro
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                selectedCategory === null
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <Layers size={14} /> Todos
            </button>
            <button
              onClick={() => setSelectedCategory(selectedCategory === 'Alimentação' ? null : 'Alimentação')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                selectedCategory === 'Alimentação'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }`}
            >
              <Utensils size={14} /> Alimentação
            </button>
            <button
              onClick={() => setSelectedCategory(selectedCategory === 'Serviços' ? null : 'Serviços')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                selectedCategory === 'Serviços'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <Wrench size={14} /> Serviços
            </button>
            <button
              onClick={() => setSelectedCategory(selectedCategory === 'Moda' ? null : 'Moda')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                selectedCategory === 'Moda'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <Shirt size={14} /> Moda
            </button>
          </div>
        </div>

        {/* Produtos em Destaque (Filtrados) */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            {selectedCategory ? `Produtos em ${selectedCategory}` : 'Produtos no Marketplace'}
          </h2>
          <div className="space-y-3">
            {filteredProducts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 bg-white rounded-xl border border-slate-200">
                Nenhum produto encontrado nesta categoria.
              </p>
            ) : (
              filteredProducts.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex gap-3 items-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl font-bold">
                    <StoreIcon size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 text-sm">{item.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      {item.store?.name || 'Loja Local'} <CheckCircle size={12} className="text-emerald-500 fill-emerald-100" />
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">R$ {Number(item.priceBrl).toFixed(2)}</span>
                        {item.acceptsCommunityCoin && (
                          <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-md font-medium">
                            Aceita Moeda Social
                          </span>
                        )}
                      </div>

                      {/* Botão de Compra Direta */}
                      <button
                        onClick={() => {
                          setSelectedProductForPurchase(item);
                          setPurchaseCurrency(item.acceptsCommunityCoin ? 'COMMUNITY_COIN' : 'BRL');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modal de Cadastro de Produto */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-slate-800 mb-1">Cadastrar Novo Produto</h2>
            <p className="text-xs text-slate-500 mb-4">Anuncie um novo produto ou serviço na sua loja</p>

            {productMessage && (
              <div className={`p-2.5 rounded-lg text-xs font-medium mb-4 ${
                productMessage.includes('sucesso') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
              }`}>
                {productMessage}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nome do Produto/Serviço</label>
                <input
                  type="text"
                  placeholder="Ex: Pão Doce, Corte de Cabelo"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Descrição</label>
                <textarea
                  placeholder="Descreva detalhes do item..."
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Estoque Inicial</label>
                  <input
                    type="number"
                    value={productStock}
                    onChange={(e) => setProductStock(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="acceptsCoin"
                  checked={productAcceptsCoin}
                  onChange={(e) => setProductAcceptsCoin(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="acceptsCoin" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Aceitar Moeda Social Comunitária
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-2.5 rounded-lg transition mt-2"
              >
                Salvar e Publicar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Compra */}
      {selectedProductForPurchase && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedProductForPurchase(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-slate-800 mb-1">Confirmar Compra</h2>
            <p className="text-xs text-slate-500 mb-4">
              Você está comprando: <strong className="text-slate-700">{selectedProductForPurchase.name}</strong>
            </p>

            {purchaseMessage && (
              <div className={`p-2.5 rounded-lg text-xs font-medium mb-4 ${
                purchaseMessage.includes('sucesso') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
              }`}>
                {purchaseMessage}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPurchaseCurrency('BRL')}
                    className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition ${
                      purchaseCurrency === 'BRL'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Pagar em Reais</span>
                    <strong className="text-sm">R$ {Number(selectedProductForPurchase.priceBrl).toFixed(2)}</strong>
                  </button>

                  {selectedProductForPurchase.acceptsCommunityCoin && (
                    <button
                      type="button"
                      onClick={() => setPurchaseCurrency('COMMUNITY_COIN')}
                      className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition ${
                        purchaseCurrency === 'COMMUNITY_COIN'
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Moeda Social</span>
                      <strong className="text-sm">
                        🪙 {Number(selectedProductForPurchase.priceCoin || selectedProductForPurchase.priceBrl).toFixed(2)}
                      </strong>
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={handleConfirmPurchase}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-2.5 rounded-lg transition"
              >
                Confirmar e Pagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;