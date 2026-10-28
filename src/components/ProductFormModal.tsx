import React, { useState, useEffect } from 'react';
import { X, Upload, Camera, Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import { Product, ProductCategory, CATEGORIES } from '../types/store';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSave: (productData: Partial<Product>) => Promise<void>;
}

const COMMON_SIZES = ['P', 'M', 'G', 'GG', '36', '38', '40', '42', '44', 'U'];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSave,
}) => {
  if (!isOpen) return null;

  const [code, setCode] = useState(productToEdit?.code || '');
  const [name, setName] = useState(productToEdit?.name || '');
  const [category, setCategory] = useState<ProductCategory>(productToEdit?.category || 'Vestido longo');
  const [price, setPrice] = useState(productToEdit?.price ? String(productToEdit.price) : '');
  const [sizes, setSizes] = useState<string[]>(productToEdit?.sizes || ['P', 'M', 'G']);
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [imageUrl, setImageUrl] = useState(productToEdit?.imageUrl || '');
  const [status, setStatus] = useState<'disponivel' | 'vendida' | 'reservada'>(
    productToEdit?.status || 'disponivel'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customSize, setCustomSize] = useState('');

  // Handle local image upload
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            filename: name ? name.toLowerCase().replace(/\s+/g, '-') : 'peca',
          }),
        });
        const data = await res.json();
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        } else {
          setImageUrl(base64);
        }
      } catch (err) {
        // Fallback to base64
        setImageUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleSize = (sz: string) => {
    if (sizes.includes(sz)) {
      setSizes(sizes.filter((s) => s !== sz));
    } else {
      setSizes([...sizes, sz]);
    }
  };

  const addCustomSize = () => {
    if (customSize.trim() && !sizes.includes(customSize.trim().toUpperCase())) {
      setSizes([...sizes, customSize.trim().toUpperCase()]);
      setCustomSize('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !price) {
      alert('Preencha código, nome e preço.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        category,
        price: parseFloat(price.replace(',', '.')),
        sizes: sizes.length > 0 ? sizes : ['U'],
        description: description.trim(),
        imageUrl: imageUrl.trim() || '/src/assets/images/blusa_seda_elegante_1793216112591.jpg',
        status,
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar peça.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#EAE3DE] max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#EAE3DE] flex items-center justify-between">
          <div>
            <h3 className="text-xl font-display font-bold text-[#50121E]">
              {productToEdit ? 'Editar Peça' : 'Cadastrar Nova Roupa'}
            </h3>
            <p className="text-xs text-stone-500">
              As informações serão salvas na memória e sincronizadas com todos os dispositivos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Código da peça */}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Código da Peça *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: EC-09"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#681A28] uppercase font-mono font-bold"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#681A28]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nome da Roupa */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Nome da Peça *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Vestido Longo Gala Vinho Nobre"
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#681A28]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Valor da Peça */}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Valor (R$) *
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: 249.90"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#681A28] font-mono"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Disponibilidade
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#681A28]"
              >
                <option value="disponivel">Disponível no Catálogo</option>
                <option value="vendida">Peça Vendida / Esgotada</option>
                <option value="reservada">Reservada para Prova</option>
              </select>
            </div>
          </div>

          {/* Tamanhos disponíveis */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1.5">
              Tamanhos Disponíveis
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => toggleSize(sz)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    sizes.includes(sz)
                      ? 'bg-[#50121E] text-white border-[#50121E]'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {sz} {sizes.includes(sz) && '✓'}
                </button>
              ))}
            </div>

            {/* Custom size write-in */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                placeholder="Outro tamanho (ex: 46)..."
                className="px-2.5 py-1 text-xs bg-stone-50 border border-stone-200 rounded-lg w-44"
              />
              <button
                type="button"
                onClick={addCustomSize}
                className="px-2.5 py-1 bg-stone-200 text-stone-700 hover:bg-stone-300 text-xs font-medium rounded-lg"
              >
                + Adicionar
              </button>
            </div>
          </div>

          {/* Foto da Roupa */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 block">
              Foto da Peça *
            </label>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Preview */}
              {imageUrl ? (
                <div className="relative w-28 h-36 bg-stone-100 rounded-xl overflow-hidden border border-stone-300 shrink-0">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                    title="Remover"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-28 h-36 bg-stone-100 rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 shrink-0">
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span className="text-[10px]">Sem foto</span>
                </div>
              )}

              {/* Upload or URL input */}
              <div className="flex-1 space-y-2 w-full">
                <label className="flex items-center justify-center gap-2 w-full py-2.5 border border-stone-300 hover:border-[#681A28] rounded-xl cursor-pointer text-xs font-semibold text-stone-700 hover:text-[#681A28] bg-stone-50 transition-colors">
                  <Camera className="w-4 h-4 text-[#8C6D46]" />
                  <span>Tirar foto com o celular ou anexar imagem</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFile}
                    className="hidden"
                  />
                </label>

                <div className="text-[11px] text-stone-400 text-center">ou informe o link/URL da imagem:</div>

                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... ou caminho da imagem"
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700"
                />
              </div>
            </div>
          </div>

          {/* Descrição / Detalhes do tecido */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Descrição / Tecido / Caimento
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Peça em crepe de alfaiataria, forro acetinado, caimento reto e alongador..."
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#681A28]"
            />
          </div>

          {/* Save Button */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#681A28] hover:bg-[#50121E] text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              {isSubmitting ? 'Salvando...' : productToEdit ? 'Atualizar Peça' : 'Publicar no Catálogo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
