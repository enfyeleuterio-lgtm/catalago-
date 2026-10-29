import React from 'react';
import { ShoppingBag, Instagram, Phone, Lock, Sparkles, LogOut, ShieldCheck } from 'lucide-react';
import { PublicStoreSettings } from '../types/store';

interface HeaderProps {
  settings: PublicStoreSettings;
  bagCount: number;
  onOpenBag: () => void;
  isAdmin: boolean;
  userEmail?: string | null;
  onOpenAdmin: () => void;
  onExitAdmin: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  bagCount,
  onOpenBag,
  isAdmin,
  userEmail,
  onOpenAdmin,
  onExitAdmin,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F5]/95 backdrop-blur-md border-b border-[#EAE3DE] transition-all">
      {/* Top micro-bar with store contact & social info */}
      <div className="bg-[#50121E] text-[#F8F3ED] text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 tracking-wide font-light text-[11px] sm:text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E6C687]" />
            <span className="truncate">{settings.tagline}</span>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0">
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#E6C687] transition-colors"
              title="Instagram Eterna Chique"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{settings.instagramHandle}</span>
            </a>
            <span className="text-stone-500">·</span>
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#E6C687] transition-colors"
              title="WhatsApp Atendimento"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{settings.whatsappFormatted}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main 3-Zone Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Wordmark with Butterfly Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E6C687]/60 shadow-sm bg-[#50121E] shrink-0">
            <img
              src={settings.logoUrl}
              alt="Logo Eterna Chique"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <a
              href="#"
              className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#50121E] leading-none hover:opacity-90 transition-opacity"
            >
              Eterna Chique
            </a>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C6D46] font-medium mt-0.5">
              Boutique Exclusiva
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-700">
          <a href="#catalogo" className="hover:text-[#681A28] transition-colors whitespace-nowrap">
            Catálogo
          </a>
          <a href="#categorias" className="hover:text-[#681A28] transition-colors whitespace-nowrap">
            Categorias
          </a>
          <a href="#sacola-como-funciona" className="hover:text-[#681A28] transition-colors whitespace-nowrap">
            Mala de Prova
          </a>
          <a href="#contato" className="hover:text-[#681A28] transition-colors whitespace-nowrap">
            Atendimento
          </a>
        </nav>

        {/* Zone 3: Actions - Bag and Admin Access */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#50121E] hover:bg-[#681A28] rounded-xl transition-all shadow-xs"
                title="Abrir Painel de Administração"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#E6C687]" />
                <span>Painel Lojista</span>
              </button>
              <button
                onClick={onLogout}
                className="p-2 text-stone-500 hover:text-red-700 hover:bg-stone-100 rounded-xl transition-colors"
                title="Sair da Conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#50121E] bg-[#FAF7F5] hover:bg-[#F3EAE4] border border-[#50121E]/30 rounded-xl transition-all shadow-xs active:scale-95"
              title="Acesso com Senha da Lojista"
            >
              <Lock className="w-3.5 h-3.5 text-[#681A28] shrink-0" />
              <span className="font-bold text-[#50121E]">Área da Lojista</span>
            </button>
          )}

          {/* Sacola Button */}
          <button
            onClick={onOpenBag}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#681A28] hover:bg-[#50121E] rounded-xl shadow-xs transition-all transform active:scale-95"
            aria-label="Abrir Sacola de Prova"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {bagCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#E6C687] text-[#50121E] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {bagCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Sacola</span>
            {bagCount > 0 && <span className="sm:hidden font-bold">({bagCount})</span>}
          </button>
        </div>
      </div>
    </header>
  );
};
