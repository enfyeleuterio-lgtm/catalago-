import React, { useState } from 'react';
import { X, ShoppingBag, MessageCircle, Check, Sparkles } from 'lucide-react';
import { Product } from '../types/store';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToBag: (product: Product, size: string) => void;
  whatsappNumber: string;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToBag,
  whatsappNumber,
}) => {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'U');
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const isSold = product.status === 'vendida';

  const handleAdd = () => {
    if (isSold) return;
    onAddToBag(product, selectedSize);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 1600);
  };

  const cleanPhone = whatsappNumber.replace(/\D/g, '');
  const directWhatsappText = encodeURIComponent(
    `Olá, Eterna Chique! Quero informações sobre a peça:\n` +
      `• *${product.name}*\n` +
      `• Código: *${product.code}*\n` +
      `• Categoria: ${product.category}\n` +
      `• Tamanho desejado: ${selectedSize}\n` +
      `• Valor: R$ ${product.price.toFixed(2).replace('.', ',')}`
  );
  const directWhatsappUrl = `https://wa.me/${cleanPhone}?text=${directWhatsappText}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#EAE3DE] flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 hover:bg-white text-stone-700 rounded-full flex items-center justify-center shadow-md transition-all"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="md:w-1/2 bg-stone-100 relative min-h-[320px] md:min-h-full">
          <img
            src={product.imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover ${isSold ? 'grayscale contrast-75' : ''}`}
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-[#50121E] text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-md tracking-wide">
              {product.code}
            </span>
          </div>

          {isSold && (
            <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[2px] flex items-center justify-center p-6">
              <span className="bg-[#681A28] text-white text-sm font-bold uppercase tracking-widest px-4 py-2 rounded shadow">
                Peça Vendida / Esgotada
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#8C6D46] font-semibold">
                {product.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#50121E] mt-1 leading-snug">
                {product.name}
              </h2>
            </div>

            <div className="flex items-baseline gap-3 py-2 border-y border-stone-100">
              <span className="text-sm text-stone-500">Valor da peça:</span>
              <span className="text-2xl font-bold text-[#50121E] font-mono tabular-nums">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {product.description && (
              <div>
                <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Detalhes da Peça
                </h4>
                <p className="text-sm text-stone-600 leading-relaxed font-light">
                  {product.description}
                </p>
              </div>
            )}

            {/* Size selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
                  Escolha o Tamanho para Prova:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-10 h-10 px-3 text-xs font-semibold rounded-lg border transition-all ${
                        selectedSize === sz
                          ? 'bg-[#50121E] text-white border-[#50121E] shadow-sm'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mala de prova reminder */}
            <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#EAE3DE] text-xs text-stone-600 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#8C6D46] shrink-0 mt-0.5" />
              <span>
                Coloque na sacola para solicitar a <strong>Mala de Prova</strong>. Você
                experimenta no seu tempo e só fica com o que amar.
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-6 space-y-2.5">
            <button
              disabled={isSold}
              onClick={handleAdd}
              className={`w-full py-3.5 px-4 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all ${
                isSold
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : isAddedRecently
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#681A28] hover:bg-[#50121E] text-white active:scale-98'
              }`}
            >
              {isAddedRecently ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Adicionada à Sacola!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Colocar na Sacola de Prova ({selectedSize})</span>
                </>
              )}
            </button>

            <a
              href={directWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 text-sm font-semibold rounded-xl border border-[#25D366] text-[#1E7E34] hover:bg-[#25D366]/10 flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Tirar Dúvida no WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
