import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { Wallet, Search, CheckCircle, Utensils, Wrench, Shirt, ArrowUpRight, LogOut } from 'lucide-react';

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

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('maria@email.com');
  const [password, setPassword] = useState('senha123123');
  const [receiverWalletId, setReceiverWalletId] = useState('');
  const [transferAmount, setTransferAmount] = useState('25.00');
  const [message, setMessage] = useState('');

 // 1. Função para procurar/atualizar os saldos sem destruir os dados do utilizador
async function fetchWallet() {
  try {
    const response = await api.get('/wallet/me');
    
    setUser((prevUser) => {
      // Se não houver utilizador no estado, devolve nulo para não quebrar a aplicação
      if (!prevUser) return null;
      
      return {
        ...prevUser,
        wallet: response.data, // Anexa balanceBrl e balanceCoin vindos da API
      };
    });
  } catch (err) {
    console.error("Erro ao buscar carteira:", err);
  }
}

// 2. Auto-login e restauração da sessão ao recarregar a página (F5)
useEffect(() => {
  async function loadUserSession() {
    const token = localStorage.getItem('@comunidade:token');
    
    if (token) {
      // Configura o cabeçalho Bearer Token no Axios para todas as chamadas futuros
      api.defaults.headers.Authorization = `Bearer ${token}`;
      
      try {
        // Busca a carteira para validar o token na API
        const walletRes = await api.get('/wallet/me');
        
        // Reconstrói a sessão do utilizador no estado do React
        setUser({
          id: walletRes.data.userId || '',
          name: 'Maria Silva', // Dados da sessão ativa
          email: 'maria@email.com',
          wallet: walletRes.data,
        });
      } catch (error) {
        // Se o token estiver expirado ou for inválido, limpa o LocalStorage
        console.error("Sessão inválida ou token expirado:", error);
        localStorage.removeItem('@comunidade:token');
        setUser(null);
      }
    }
  }

  loadUserSession();
}, []);

  // 2. Função de Login corrigida
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      setMessage('');
      
      // Envia credenciais
      const response = await api.post('/auth/login', { email, password });
      
      const { token, user: userData } = response.data;

      // Salva e define o token nas requisições do Axios
      localStorage.setItem('@comunidade:token', token);
      api.defaults.headers.Authorization = `Bearer ${token}`;

      // Define o usuário no estado (isso fará o React renderizar a tela principal)
      setUser(userData);

      // Busca os saldos no endpoint /wallet/me
      const walletRes = await api.get('/wallet/me');
      
      // Atualiza o usuário incluindo a carteira
      setUser({
        ...userData,
        wallet: walletRes.data,
      });

    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.error || 'Erro ao realizar login.');
    }
  }

  // Logout
  function handleLogout() {
    localStorage.removeItem('@comunidade:token');
    setUser(null);
  }

  // Executar Transferência P2P
  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    try {
      setMessage('');

      // Envia a requisição usando os dados do formulário
      await api.post('/wallet/transfer', {
        receiverWalletId: receiverWalletId.trim(), // ou destinationId.trim() dependendo do nome da sua variável no useState
        amount: Number(transferAmount),             // converte o valor digitado no input para número
        currencyType: 'BRL',
      });

      setMessage('Transferência realizada com sucesso!');
      await fetchWallet(); // Atualiza o saldo na tela
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.error || 'Erro na transferência.');
    }
  }

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
            <h1 className="text-xl font-bold flex items-center gap-2">
              Comunidade
            </h1>
            <p className="text-xs text-emerald-100">Juntos somos mais fortes</p>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-emerald-600 rounded-lg transition" title="Sair">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Barra de Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar produtos ou serviços..."
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
                R$ {Number(user?.wallet?.balanceBrl || 0).toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Moeda Social</span>
              <span className="text-xl font-bold text-amber-500">
                🪙 {Number(user?.wallet?.balanceCoin || 0).toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
          {/* Form de Transferência Integrado */}
          <form onSubmit={handleTransfer} className="pt-2 space-y-3">
            <span className="text-xs font-semibold text-slate-600 block">Transferência P2P Rápida</span>
            <input
              type="text"
              placeholder="ID da Carteira do Destinatário"
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

        {/* Categorias */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Categorias</h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-2 rounded-xl text-xs font-medium">
              <Utensils size={14} /> Comida
            </button>
            <button className="flex items-center gap-1.5 bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-medium">
              <Wrench size={14} /> Serviços
            </button>
            <button className="flex items-center gap-1.5 bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-medium">
              <Shirt size={14} /> Moda
            </button>
          </div>
        </div>

        {/* Produtos em Destaque */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Produtos em Destaque</h2>
          <div className="space-y-3">
            {/* Card Produto 1 */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex gap-3 items-center">
              <div className="w-20 h-20 bg-slate-200 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl">
                🍞
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 text-sm">Pão Artesanal Caseiro</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  Padaria Graça <CheckCircle size={12} className="text-emerald-500 fill-emerald-100" />
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">R$ 15,00</span>
                  <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-md font-medium">
                    Aceita Moeda Social
                  </span>
                </div>
              </div>
            </div>

            {/* Card Produto 2 */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex gap-3 items-center">
              <div className="w-20 h-20 bg-slate-200 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl">
                ⚡
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 text-sm">Manutenção Elétrica Residencial</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  Silva Elétrica <CheckCircle size={12} className="text-emerald-500 fill-emerald-100" />
                </p>
                <div className="mt-2">
                  <span className="font-bold text-sm text-slate-900">R$ 120,00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}