import React, { useState } from 'react';
import { ShoppingBag, Eye, MessageCircle, Check, Tag } from 'lucide-react';
import { Product } from '../types/store';

interface ProductCardProps {
  product: Product;
  onAddToBag: (product: Product, size: string) => void;
  onViewDetails: (product: Product) => void;
  whatsappNumber: string;
  isAdmin?: boolean;
  onToggleStatus?: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToBag,
  onViewDetails,
  whatsappNumber,
  isAdmin,
  onToggleStatus,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'U');
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const isSold = product.status === 'vendida';
  const isReserved = product.status === 'reservada';

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSold) return;
    onAddToBag(product, selectedSize);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 1600);
  };

  const cleanPhone = whatsappNumber.replace(/\D/g, '');
  const directWhatsappText = encodeURIComponent(
    `Olá, Eterna Chique! Gostei da peça *${product.name}* (Código: *${product.code}* - R$ ${product.price
      .toFixed(2)
      .replace('.', ',')}). Ainda está disponível no tamanho ${selectedSize}?`
  );
  const directWhatsappUrl = `https://wa.me/${cleanPhone}?text=${directWhatsappText}`;

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group relative flex flex-col bg-white rounded-xl border border-[#EAE3DE] overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isSold ? 'grayscale contrast-75 opacity-75' : ''
          }`}
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Code & Category Tag */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          <span className="bg-[#50121E] text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm tracking-wide">
            {product.code}
          </span>
        </div>

        {/* Status Overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center p-4">
            <span className="bg-[#681A28] text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded shadow">
              Peça Vendida / Esgotada
            </span>
          </div>
        )}
        {isReserved && !isSold && (
          <div className="absolute top-3 right-3 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
            Reservada
          </div>
        )}

        {/* Hover View overlay button */}
        {!isSold && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="bg-white/95 text-stone-900 text-xs font-medium px-3.5 py-2 rounded-lg shadow-md flex items-center gap-1.5 backdrop-blur-sm">
              <Eye className="w-3.5 h-3.5" />
              Ver Detalhes
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category kicker */}
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8C6D46] mb-1">
            {product.category}
          </div>

          {/* Product Name */}
          <h3 className="text-base font-semibold text-stone-900 group-hover:text-[#681A28] transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Description preview */}
          {product.description && (
            <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Size Selector */}
        <div className="pt-2 border-t border-stone-100 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-stone-500 font-medium">Valor:</span>
            <span className="text-lg font-bold text-[#50121E] font-mono tabular-nums">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {/* Sizes available */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <span className="text-[11px] text-stone-500 mr-1">Tam:</span>
              <div className="flex flex-wrap gap-1">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-6 h-6 px-1.5 text-[11px] font-medium rounded transition-all ${
                      selectedSize === sz
                        ? 'bg-[#50121E] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
            {/* Add to Sacola button */}
            <button
              type="button"
              disabled={isSold}
              onClick={handleAdd}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all ${
                isSold
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : isAddedRecently
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#681A28] hover:bg-[#50121E] text-white shadow-xs active:scale-95'
              }`}
            >
              {isAddedRecently ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Na Sacola!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Sacola</span>
                </>
              )}
            </button>

            {/* Direct WhatsApp button */}
            <a
              href={directWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg border border-[#25D366]/40 text-stone-800 hover:bg-[#25D366]/10 hover:border-[#25D366] transition-colors"
              title="Perguntar sobre esta peça no WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Owner / Admin Management controls */}
        {isAdmin && (
          <div
            className="mt-2 pt-2 border-t border-dashed border-[#50121E]/20 bg-[#FAF7F5] -mx-4 -mb-4 p-3 rounded-b-xl flex items-center justify-between gap-1 text-[11px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onToggleStatus && onToggleStatus(product)}
              className={`px-2 py-1 rounded font-medium border ${
                isSold
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
            >
              {isSold ? 'Reativar' : 'Marcar Vendida'}
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onEditProduct && onEditProduct(product)}
                className="px-2 py-1 rounded font-medium text-stone-700 bg-white border border-stone-300 hover:bg-stone-50"
              >
                Editar
              </button>
              <button
                onClick={() => onDeleteProduct && onDeleteProduct(product.id)}
                className="px-2 py-1 rounded font-medium text-red-700 bg-red-50 border border-red-200 hover:bg-red-100"
                title="Tirar peça do catálogo"
              >
                Tirar Peça
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
