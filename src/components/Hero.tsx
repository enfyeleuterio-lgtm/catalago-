import React from 'react';
import { ArrowDown, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { PublicStoreSettings } from '../types/store';

interface HeroProps {
  settings: PublicStoreSettings;
}

export const Hero: React.FC<HeroProps> = ({ settings }) => {
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Olá, Eterna Chique! Gostaria de saber mais sobre as peças do catálogo.`
  )}`;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF7F5] via-[#F4ECE7] to-[#FAF7F5] border-b border-[#EAE3DE] py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Brand Statement & CTA */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#681A28]/10 text-[#681A28] text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#681A28]" />
              <span>Coleção Primavera & Atemporal</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-[#50121E] tracking-tight leading-[1.1] text-balance">
              {settings.tagline}
            </h1>

            <p className="text-base sm:text-lg text-stone-700 leading-relaxed max-w-xl font-normal">
              {settings.aboutText}
            </p>

            {/* Value propositions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full py-2 text-xs font-medium text-stone-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D46] shrink-0" />
                <span>Cortes & Tecidos Nobres</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D46] shrink-0" />
                <span>Mala de Prova a Domicílio</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D46] shrink-0" />
                <span>Atendimento Direto no Zap</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#catalogo"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#681A28] hover:bg-[#50121E] text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all"
              >
                <span>Explorar Coleção</span>
                <ArrowDown className="w-4 h-4" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
                <span>Falar com a Consultora</span>
              </a>
            </div>
          </div>

          {/* Right Column: Hero Visual Feature */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border-4 border-white/80 bg-stone-100">
                <img
                  src="/src/assets/images/vestido_longo_luxo_1793216112203.jpg"
                  alt="Vestido Gala Eterna Chique"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#50121E]/75 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="text-xs uppercase tracking-widest text-[#E6C687] font-semibold">
                    Destaque da Semana
                  </div>
                  <div className="text-xl font-display font-bold">
                    Vestido Longo Gala Vinho Nobre
                  </div>
                  <div className="text-sm font-medium text-white/90">
                    Cód. EC-05 · R$ 429,90
                  </div>
                </div>
              </div>

              {/* Decorative brand emblem badge */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-5 bg-[#FAF7F5] border border-[#EAE3DE] p-3 rounded-xl shadow-lg flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#50121E] flex items-center justify-center overflow-hidden">
                  <img
                    src={settings.logoUrl}
                    alt="Logo"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#50121E]">Eterna Chique</div>
                  <div className="text-[11px] text-stone-500">Moda & Elegância</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
