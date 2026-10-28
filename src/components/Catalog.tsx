import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Sparkles, Plus } from 'lucide-react';
import { Product, ProductCategory, CATEGORIES } from '../types/store';
import { ProductCard } from './ProductCard';

interface CatalogProps {
  products: Product[];
  whatsappNumber: string;
  onAddToBag: (product: Product, size: string) => void;
  onViewDetails: (product: Product) => void;
  isAdmin?: boolean;
  onToggleStatus?: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onOpenNewProductModal?: () => void;
}

export const Catalog: React.FC<CatalogProps> = ({
  products,
  whatsappNumber,
  onAddToBag,
  onViewDetails,
  isAdmin,
  onToggleStatus,
  onEditProduct,
  onDeleteProduct,
  onOpenNewProductModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hideSold, setHideSold] = useState<boolean>(false);

  // Filter products by category, search (name or code), and availability
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'Todas' && p.category !== selectedCategory) {
        return false;
      }

      // Search query (matches name or code or category)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchCode = p.code.toLowerCase().includes(query);
        const matchName = p.name.toLowerCase().includes(query);
        const matchCategory = p.category.toLowerCase().includes(query);
        if (!matchCode && !matchName && !matchCategory) {
          return false;
        }
      }

      // Hide sold toggle (unless in admin mode where owner wants to see everything)
      if (hideSold && p.status === 'vendida') {
        return false;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery, hideSold]);

  return (
    <section id="catalogo" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-[#EAE3DE]">
        <div>
          <div className="text-xs uppercase tracking-widest text-[#8C6D46] font-semibold mb-1">
            Coleção Eterna Chique
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#50121E]">
            Catálogo Exclusivo
          </h2>
          <p className="text-stone-600 text-sm mt-1 max-w-xl">
            Escolha as peças que deseja experimentar. Adicione à sua sacola e solicite sua
            mala de prova diretamente no WhatsApp.
          </p>
        </div>

        {/* Admin Quick Add */}
        {isAdmin && onOpenNewProductModal && (
          <button
            onClick={onOpenNewProductModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#681A28] hover:bg-[#50121E] text-white text-xs font-semibold rounded-lg shadow-sm transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Nova Roupa</span>
          </button>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-4 mb-8">
        {/* Search & Quick Toggles */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou código (ex: EC-01)..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#EAE3DE] rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#681A28]/20 focus:border-[#681A28]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-stone-600 ml-auto">
            <label className="flex items-center gap-2 cursor-pointer select-none bg-white border border-[#EAE3DE] px-3 py-2 rounded-xl">
              <input
                type="checkbox"
                checked={hideSold}
                onChange={(e) => setHideSold(e.target.checked)}
                className="rounded text-[#681A28] focus:ring-[#681A28]"
              />
              <span>Apenas peças disponíveis</span>
            </label>
          </div>
        </div>

        {/* Category Navigation (Horizontal scrollable on mobile) */}
        <div id="categorias" className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none pt-1">
          <button
            onClick={() => setSelectedCategory('Todas')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              selectedCategory === 'Todas'
                ? 'bg-[#50121E] text-white shadow-sm'
                : 'bg-white text-stone-700 border border-[#EAE3DE] hover:bg-stone-50'
            }`}
          >
            Todas as Peças ({products.length})
          </button>

          {CATEGORIES.map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#50121E] text-white shadow-sm'
                    : 'bg-white text-stone-700 border border-[#EAE3DE] hover:bg-stone-50'
                }`}
              >
                {cat} <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToBag={onAddToBag}
              onViewDetails={onViewDetails}
              whatsappNumber={whatsappNumber}
              isAdmin={isAdmin}
              onToggleStatus={onToggleStatus}
              onEditProduct={onEditProduct}
              onDeleteProduct={onDeleteProduct}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#EAE3DE] p-8 max-w-md mx-auto">
          <Sparkles className="w-8 h-8 text-[#8C6D46] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#50121E]">Nenhuma peça encontrada</h3>
          <p className="text-xs text-stone-500 mt-1 mb-4">
            Não encontramos nenhuma roupa com os filtros selecionados. Tente buscar por outro termo
            ou categoria.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('Todas');
              setSearchQuery('');
              setHideSold(false);
            }}
            className="px-4 py-2 bg-[#681A28] text-white text-xs font-semibold rounded-lg hover:bg-[#50121E] transition-colors"
          >
            Ver Todas as Roupas
          </button>
        </div>
      )}
    </section>
  );
};
