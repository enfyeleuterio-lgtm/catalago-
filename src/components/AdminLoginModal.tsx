import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  auth,
  googleProvider,
  AUTHORIZED_ADMIN_EMAIL,
} from '../lib/firebase';
import {
  signInWithPopup,
  signOut,
} from 'firebase/auth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token?: string, email?: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState(AUTHORIZED_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Google One-Click Login
  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (user.email?.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        await signOut(auth);
        setError(
          `Acesso não autorizado: O e-mail "${user.email}" não tem permissão de administradora. Apenas ${AUTHORIZED_ADMIN_EMAIL} possui acesso.`
        );
        return;
      }

      const token = await user.getIdToken();
      onLoginSuccess(token, user.email);
      onClose();
    } catch (err: any) {
      // Do not use console.error for expected user cancellations or popup blocks
      if (err.code === 'auth/popup-closed-by-user') {
        setError('A janela do Google foi fechada. Você também pode entrar com sua senha abaixo.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('O navegador bloqueou a janela do Google. Digite sua senha de administradora abaixo.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignored
      } else {
        console.warn('Google Sign-in notice:', err.code, err.message);
        setError('Não foi possível autenticar pelo Google no momento. Entre com sua senha abaixo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Email & Password / Passkey Login (Works seamlessly across any browser/iframe)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (email.trim().toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      setError(`Somente a conta autorizada (${AUTHORIZED_ADMIN_EMAIL}) pode acessar a administração.`);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Senha incorreta.');
      }

      onLoginSuccess(data.token, data.email);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#EAE3DE] p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-[#50121E] text-white flex items-center justify-center shadow-xs">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-[#50121E]">
              Acesso da Lojista
            </h3>
            <p className="text-xs text-stone-500">
              Gerenciamento de roupas, preços e pedidos
            </p>
          </div>
        </div>

        {/* Security badge stating authorized admin account */}
        <div className="mb-4 p-3 bg-[#FAF7F5] border border-[#EAE3DE] rounded-xl flex items-start gap-2.5 text-xs text-stone-700">
          <ShieldCheck className="w-4 h-4 text-[#8C6D46] shrink-0 mt-0.5" />
          <div className="leading-tight">
            <span>Acesso restrito exclusivamente à proprietária: </span>
            <strong className="text-[#50121E] font-mono break-all">{AUTHORIZED_ADMIN_EMAIL}</strong>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form: Email & Password (Primary & Most Reliable) */}
        <form onSubmit={handlePasswordLogin} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-stone-700 block mb-1">
              E-mail Autorizado
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enf.yeleuterio@gmail.com"
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#681A28] font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-stone-700 block mb-1">
              Senha de Administradora
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#681A28]"
              />
            </div>
            <p className="text-[10px] text-stone-400 mt-1">
              * Senha padrão inicial: <strong className="text-stone-700">eterna123</strong> (alterável a qualquer momento nas configurações do painel).
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#681A28] hover:bg-[#50121E] text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
          >
            <span>{isLoading ? 'Verificando...' : 'Entrar no Painel com Senha'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-stone-200 w-full"></div>
          <span className="bg-white px-3 text-[11px] text-stone-400 uppercase tracking-wider shrink-0">
            ou entrar com Google
          </span>
        </div>

        {/* Google One-Click Login */}
        <button
          type="button"
          disabled={isLoading}
          onClick={handleGoogleLogin}
          className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 hover:border-[#681A28] rounded-xl font-semibold text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs active:scale-98 disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Conectar com Google</span>
        </button>
      </div>
    </div>
  );
};
