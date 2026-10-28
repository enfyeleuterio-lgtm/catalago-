import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  auth,
  googleProvider,
  AUTHORIZED_ADMIN_EMAIL,
} from '../lib/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const [authMode, setAuthMode] = useState<'google' | 'email'>('google');
  const [email, setEmail] = useState(AUTHORIZED_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

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

      onLoginSuccess();
      onClose();
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('A janela de login do Google foi fechada antes de concluir.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Solicitação cancelada.');
      } else {
        setError(err.message || 'Falha ao autenticar com o Google. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Email & Password Login
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (email.trim().toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      setError(`Somente a conta autorizada (${AUTHORIZED_ADMIN_EMAIL}) pode acessar a administração.`);
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      if (user.email?.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        await signOut(auth);
        setError('Conta não autorizada.');
        return;
      }

      onLoginSuccess();
      onClose();
    } catch (err: any) {
      console.error('Email login error:', err);
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setError('E-mail ou senha incorretos. Verifique e tente novamente.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Muitas tentativas sem sucesso. Aguarde alguns minutos ou redefina sua senha.');
      } else {
        setError(err.message || 'Erro ao fazer login com e-mail e senha.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Password Reset
  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Informe seu e-mail para receber o link de redefinição.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResetSent(false);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Não foi possível enviar o e-mail de redefinição.');
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
              Autenticação segura via Firebase Authentication
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

        {resetSent && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="leading-relaxed">
              Link de redefinição de senha enviado para <strong>{email}</strong>. Verifique sua caixa de entrada e spam.
            </span>
          </div>
        )}

        {/* Primary Recommended Auth: Google One-Click Login */}
        <div className="space-y-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-200 hover:border-[#681A28] rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-xs active:scale-98 disabled:opacity-50"
          >
            {/* Google G icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>{isLoading ? 'Autenticando...' : 'Entrar com Google (Recomendado)'}</span>
          </button>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-stone-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] text-stone-400 uppercase tracking-wider shrink-0">
              ou com e-mail e senha
            </span>
          </div>

          {/* Email / Password Option */}
          {authMode === 'email' ? (
            <form onSubmit={handleEmailPasswordLogin} className="space-y-3">
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
                    className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#681A28]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-stone-700">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={isLoading}
                    className="text-[11px] text-[#681A28] hover:underline font-medium"
                  >
                    Esqueci a senha
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#681A28]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#681A28] hover:bg-[#50121E] text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                <span>{isLoading ? 'Verificando...' : 'Entrar com E-mail'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAuthMode('email')}
              className="w-full text-center text-xs text-stone-500 hover:text-stone-800 transition-colors py-1"
            >
              Prefere entrar digitando e-mail e senha? <span className="text-[#681A28] font-semibold underline">Clique aqui</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
