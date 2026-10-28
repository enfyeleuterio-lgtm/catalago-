import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  Camera,
  Image as ImageIcon,
  CheckCircle,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { BagItem } from '../types/store';

interface BagDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: BagItem[];
  onUpdateQuantity: (productId: string, size: string, delta: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onClearBag: () => void;
  whatsappNumber: string;
}

export const BagDrawer: React.FC<BagDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearBag,
  whatsappNumber,
}) => {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [customerImageBase64, setCustomerImageBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBagId, setSubmittedBagId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalAmount = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const totalPieces = items.reduce((acc, it) => acc + it.quantity, 0);

  // Handle customer image upload (inspiration outfit / question photo)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Por favor escolha uma foto com menos de 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCustomerImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Por favor preencha seu Nome e WhatsApp para contato.');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('Sua sacola está vazia. Adicione ao menos uma peça.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let customerUploadedUrl: string | undefined = undefined;

      // If customer attached an image, upload it first
      if (customerImageBase64) {
        try {
          const uploadRes = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: customerImageBase64,
              filename: 'cliente-inspiracao',
            }),
          });
          const uploadData = await uploadRes.json();
          if (uploadData.imageUrl) {
            customerUploadedUrl = uploadData.imageUrl;
          }
        } catch (err) {
          console.warn('Could not save customer reference image to server:', err);
        }
      }

      // Submit bag to server database
      const res = await fetch('/api/bag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerNotes,
          customerImage: customerUploadedUrl || customerImageBase64 || undefined,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar sacola.');
      }

      setSubmittedBagId(data.bagId);

      // Open WhatsApp directly
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
      }

      // Clear bag from client state after successful submission
      onClearBag();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao registrar sacola. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#FAF7F5] h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-[#EAE3DE] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#EAE3DE] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#50121E] text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-[#50121E]">
                Sacola de Prova
              </h2>
              <span className="text-[11px] text-stone-500">
                {totalPieces} {totalPieces === 1 ? 'peça selecionada' : 'peças selecionadas'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
            aria-label="Fechar Sacola"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {submittedBagId ? (
            <div className="py-12 px-4 text-center space-y-4 bg-white rounded-2xl border border-[#EAE3DE] shadow-xs">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-display font-bold text-[#50121E]">
                Sacola Enviada com Sucesso!
              </h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                Registramos seu pedido de prova <strong>#{submittedBagId}</strong>. Nossa consultora
                já recebeu seus itens e entrará em contato para combinar a entrega da sua mala!
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSubmittedBagId(null);
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-[#681A28] text-white text-xs font-semibold rounded-lg hover:bg-[#50121E] transition-colors"
                >
                  Continuar Navegando
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#50121E]">Sua sacola está vazia</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Navegue pelo nosso catálogo e clique em "Sacola" nas peças que você quer
                experimentar em casa.
              </p>
              <button
                onClick={onClose}
                className="mt-3 px-4 py-2 bg-[#681A28] text-white text-xs font-semibold rounded-lg hover:bg-[#50121E] transition-colors"
              >
                Ver Roupas
              </button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-semibold uppercase tracking-wider text-stone-700">
                    Peças para Prova:
                  </span>
                  <button
                    onClick={onClearBag}
                    className="text-stone-400 hover:text-red-600 transition-colors"
                  >
                    Esvaziar sacola
                  </button>
                </div>

                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="flex gap-3 bg-white p-3 rounded-xl border border-[#EAE3DE] shadow-xs"
                  >
                    {/* Item Thumbnail */}
                    <div className="w-16 h-20 bg-stone-100 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-stone-900 truncate">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.productId, item.size)}
                            className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono font-bold text-[#50121E]">{item.code}</span>
                          <span>·</span>
                          <span className="bg-stone-100 px-1.5 py-0.5 rounded text-[10px] font-semibold text-stone-700">
                            Tam {item.size}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-bold text-[#50121E] font-mono">
                          R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                        </span>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1 bg-stone-100 rounded-md p-0.5">
                          <button
                            onClick={() => onUpdateQuantity(item.productId, item.size, -1)}
                            className="w-5 h-5 flex items-center justify-center text-stone-600 hover:bg-white rounded transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold px-1 min-w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.productId, item.size, 1)}
                            className="w-5 h-5 flex items-center justify-center text-stone-600 hover:bg-white rounded transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Image Upload (Send clothes photo) */}
              <div className="bg-white p-4 rounded-xl border border-[#EAE3DE] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#8C6D46]" />
                    <span className="text-xs font-bold text-stone-800">
                      Enviar foto da roupa ou inspiração
                    </span>
                  </div>
                  {customerImageBase64 && (
                    <button
                      type="button"
                      onClick={() => setCustomerImageBase64(null)}
                      className="text-[11px] text-red-600 hover:underline"
                    >
                      Remover foto
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-stone-500 leading-tight">
                  Viu uma roupa no nosso Instagram ou tem uma foto de referência? Você pode nos
                  enviar junto com a sacola!
                </p>

                {customerImageBase64 ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-[#50121E]">
                    <img
                      src={customerImageBase64}
                      alt="Foto enviada"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-stone-200 hover:border-[#681A28] rounded-xl cursor-pointer text-xs font-medium text-stone-600 hover:text-[#681A28] transition-colors">
                    <ImageIcon className="w-4 h-4" />
                    <span>Tirar foto ou anexar imagem</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Customer Contact Form */}
              <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-[#EAE3DE] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  Seus Dados para Agendamento da Prova:
                </span>

                {errorMessage && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Mariana Silva"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#681A28]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    WhatsApp com DDD *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#681A28]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    Observações / Bairro para Entrega (opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Ex: Gostaria de experimentar na sexta à tarde ou combinar no WhatsApp..."
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#681A28]"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                >
                  <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
                  <span>
                    {isSubmitting ? 'Preparando Proposta...' : 'Solicitar Mala de Prova no WhatsApp'}
                  </span>
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer Subtotal */}
        {!submittedBagId && items.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-[#EAE3DE] space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Peças selecionadas:</span>
              <span className="font-semibold text-stone-900">{totalPieces} itens</span>
            </div>

            <div className="flex items-center justify-between text-sm sm:text-base font-bold text-[#50121E]">
              <span>Valor Total Proposto:</span>
              <span className="font-mono tabular-nums text-lg">
                R$ {totalAmount.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <p className="text-[10px] text-stone-500 text-center pt-1">
              ✨ Sem compromisso de compra! Você experimenta na sua casa e escolhe o que levar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
