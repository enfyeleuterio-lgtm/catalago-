import React from 'react';
import { Instagram, Phone, Lock, Sparkles, Heart } from 'lucide-react';
import { PublicStoreSettings } from '../types/store';

interface FooterProps {
  settings: PublicStoreSettings;
  onOpenAdmin: () => void;
  isAdmin: boolean;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenAdmin, isAdmin }) => {
  const cleanPhone = settings.whatsappNumber.replace(/\D/g, '');

  return (
    <footer id="contato" className="bg-[#2B0910] text-[#FAF7F5] border-t border-[#50121E]">
      {/* How Mala de Prova Works Section */}
      <div id="sacola-como-funciona" className="border-b border-white/10 py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-widest text-[#E6C687] font-semibold">
              Experiência Eterna Chique
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
              Como Funciona a Mala de Prova?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 mt-2 font-light">
              Mais comodidade, conforto e carinho para você experimentar as peças no seu tempo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#E6C687]/20 text-[#E6C687] flex items-center justify-center mx-auto text-sm font-bold font-mono">
                01
              </div>
              <h4 className="text-base font-display font-bold text-white">Escolha no Catálogo</h4>
              <p className="text-xs text-stone-300 leading-relaxed font-light">
                Navegue pelas blusas, vestidos, shorts, calças e conjuntos. Adicione as peças e
                tamanhos desejados na sua <strong>Sacola de Prova</strong>.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#E6C687]/20 text-[#E6C687] flex items-center justify-center mx-auto text-sm font-bold font-mono">
                02
              </div>
              <h4 className="text-base font-display font-bold text-white">Envie no WhatsApp</h4>
              <p className="text-xs text-stone-300 leading-relaxed font-light">
                Finalize sua proposta de sacola. Ela chega organizada no nosso WhatsApp e no
                nosso sistema para combinarmos o melhor horário.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#E6C687]/20 text-[#E6C687] flex items-center justify-center mx-auto text-sm font-bold font-mono">
                03
              </div>
              <h4 className="text-base font-display font-bold text-white">Experimente em Casa</h4>
              <p className="text-xs text-stone-300 leading-relaxed font-light">
                Receba a mala de prova no conforto do seu lar. Prove com seus sapatos e
                acessórios, e fique apenas com o que você amar!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-[#E6C687]/60 shadow bg-[#50121E]">
                <img
                  src={settings.logoUrl}
                  alt="Logo Eterna Chique"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-2xl font-display font-bold text-white leading-none block">
                  Eterna Chique
                </span>
                <span className="text-[10px] tracking-widest uppercase text-[#E6C687]">
                  Boutique Feminina
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-light max-w-sm">
              "{settings.tagline}"
            </p>
          </div>

          {/* Social & Contact */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-xs uppercase tracking-widest text-[#E6C687] font-semibold">
              Canais de Atendimento
            </div>
            <div className="space-y-2.5 text-xs text-stone-300">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#E6C687] transition-colors"
              >
                <Instagram className="w-4 h-4 text-[#E6C687]" />
                <span>Instagram: {settings.instagramHandle}</span>
              </a>

              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#E6C687] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#E6C687]" />
                <span>WhatsApp: {settings.whatsappFormatted}</span>
              </a>
            </div>
          </div>

          {/* Owner Access */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs uppercase tracking-widest text-[#E6C687] font-semibold">
              Área da Lojista
            </div>
            <p className="text-xs text-stone-400 font-light">
              Exclusivo para a dona da loja gerenciar peças, preços, fotos e pedidos.
            </p>
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium border border-white/10 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-[#E6C687]" />
              <span>{isAdmin ? 'Painel Aberto' : 'Acessar com Senha'}</span>
            </button>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-3">
          <div>
            © {new Date().getFullYear()} Eterna Chique. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-1 text-stone-400">
            <span>Feito com</span>
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>para a mulher contemporânea</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
