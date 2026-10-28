import React, { useState } from 'react';
import {
  ShoppingBag,
  Package,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Edit2,
  MessageCircle,
  Save,
  Check,
  AlertCircle,
  LogOut,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Product, BagRequest, StoreSettings, BagStatus } from '../types/store';
import {
  db,
  auth,
  AUTHORIZED_ADMIN_EMAIL,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

interface AdminPanelProps {
  products: Product[];
  bags: BagRequest[];
  settings: StoreSettings;
  userEmail?: string | null;
  onRefreshData: () => Promise<void>;
  onOpenProductModal: (product?: Product) => void;
  onCloseAdmin: () => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  bags,
  settings,
  userEmail,
  onRefreshData,
  onOpenProductModal,
  onCloseAdmin,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'bags' | 'settings'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Settings form states
  const [brandName, setBrandName] = useState(settings.brandName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [aboutText, setAboutText] = useState(settings.aboutText);
  const [instagramHandle, setInstagramHandle] = useState(settings.instagramHandle);
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [whatsappFormatted, setWhatsappFormatted] = useState(settings.whatsappFormatted);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Quick product status toggle (Disponível <-> Vendida)
  const handleToggleProductStatus = async (product: Product) => {
    const nextStatus = product.status === 'vendida' ? 'disponivel' : 'vendida';
    try {
      // 1. Update in Firestore with security rules validation
      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, {
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      });

      // 2. Sync with local backend
      const token = await auth.currentUser?.getIdToken();
      await fetch(`/api/admin/products/${product.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      await onRefreshData();
    } catch (err: any) {
      console.error('Error toggling product status:', err);
      handleFirestoreError(err, OperationType.UPDATE, `products/${product.id}`);
    }
  };

  // Delete product ("quando vender a roupa, tirar essa peça")
  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja tirar a peça "${name}" do catálogo?`)) {
      return;
    }
    try {
      // 1. Delete from Firestore
      const productRef = doc(db, 'products', productId);
      await deleteDoc(productRef);

      // 2. Sync with local backend
      const token = await auth.currentUser?.getIdToken();
      await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      await onRefreshData();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
    }
  };

  // Update bag request status
  const handleUpdateBagStatus = async (bagId: string, status: BagStatus) => {
    try {
      // 1. Update in Firestore
      const bagRef = doc(db, 'bags', bagId);
      await updateDoc(bagRef, { status });

      // 2. Sync with local backend
      const token = await auth.currentUser?.getIdToken();
      await fetch(`/api/admin/bags/${bagId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      await onRefreshData();
    } catch (err: any) {
      console.error('Error updating bag status:', err);
      handleFirestoreError(err, OperationType.UPDATE, `bags/${bagId}`);
    }
  };

  // Delete bag request
  const handleDeleteBag = async (bagId: string) => {
    if (!window.confirm(`Excluir o registro da sacola #${bagId}?`)) return;
    try {
      // 1. Delete from Firestore
      const bagRef = doc(db, 'bags', bagId);
      await deleteDoc(bagRef);

      // 2. Sync with local backend
      const token = await auth.currentUser?.getIdToken();
      await fetch(`/api/admin/bags/${bagId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      await onRefreshData();
    } catch (err: any) {
      console.error('Error deleting bag:', err);
      handleFirestoreError(err, OperationType.DELETE, `bags/${bagId}`);
    }
  };

  // Save store settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError(null);
    setSettingsSuccess(false);

    try {
      const updatedSettings = {
        brandName: brandName.trim(),
        tagline: tagline.trim(),
        aboutText: aboutText.trim(),
        instagramHandle: instagramHandle.trim(),
        instagramUrl: instagramUrl.trim(),
        whatsappNumber: whatsappNumber.trim(),
        whatsappFormatted: whatsappFormatted.trim(),
        logoUrl: settings.logoUrl,
      };

      // 1. Save to Firestore
      const settingsRef = doc(db, 'settings', 'store');
      await setDoc(settingsRef, updatedSettings, { merge: true });

      // 2. Sync with backend
      const token = await auth.currentUser?.getIdToken();
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedSettings),
      });

      setSettingsSuccess(true);
      await onRefreshData();
      setTimeout(() => setSettingsSuccess(false), 2500);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setSettingsError(err.message || 'Erro ao salvar configurações.');
    }
  };

  // Filter products for admin view
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'Todas' && p.category !== selectedCategory) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    }
    return true;
  });

  const availableCount = products.filter((p) => p.status === 'disponivel').length;
  const soldCount = products.filter((p) => p.status === 'vendida').length;
  const newBagsCount = bags.filter((b) => b.status === 'nova').length;

  return (
    <div className="bg-white border-b border-[#EAE3DE] shadow-sm mb-8 animate-in fade-in duration-200">
      {/* Top Admin Banner */}
      <div className="bg-[#50121E] text-white px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span className="font-bold text-sm">Área Administrativa · Eterna Chique</span>
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 text-xs font-mono text-[#E6C687]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{userEmail || AUTHORIZED_ADMIN_EMAIL}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCloseAdmin}
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 transition-colors"
          >
            Visualizar como Cliente
          </button>
          <button
            onClick={onLogout}
            className="text-xs bg-red-950/40 hover:bg-red-900/60 text-white px-3 py-1.5 rounded-lg border border-red-400/30 transition-colors flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4">
        <div className="flex items-center gap-2 border-b border-[#EAE3DE] pb-px">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'products'
                ? 'border-[#50121E] text-[#50121E] bg-[#FAF7F5]'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Peças do Catálogo ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bags')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 relative ${
              activeTab === 'bags'
                ? 'border-[#50121E] text-[#50121E] bg-[#FAF7F5]'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Sacolas de Prova ({bags.length})</span>
            {newBagsCount > 0 && (
              <span className="bg-[#E6C687] text-[#50121E] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {newBagsCount} nova
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'settings'
                ? 'border-[#50121E] text-[#50121E] bg-[#FAF7F5]'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Configurações & Contatos</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {/* ----------------- TAB 1: PEÇAS DO CATÁLOGO ----------------- */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Quick Metrics & Actions Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FAF7F5] p-4 rounded-xl border border-[#EAE3DE]">
              <div className="flex items-center gap-4 text-xs font-medium text-stone-700">
                <div>
                  Total: <strong className="text-[#50121E]">{products.length} peças</strong>
                </div>
                <span>·</span>
                <div>
                  Disponíveis: <strong className="text-emerald-700">{availableCount}</strong>
                </div>
                <span>·</span>
                <div>
                  Vendidas / Esgotadas: <strong className="text-stone-500">{soldCount}</strong>
                </div>
              </div>

              <button
                onClick={() => onOpenProductModal()}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#681A28] hover:bg-[#50121E] text-white text-xs font-semibold rounded-lg shadow-xs transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Nova Roupa</span>
              </button>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Buscar por código ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3.5 py-2 text-xs bg-white border border-[#EAE3DE] rounded-lg sm:w-72"
              />

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['Todas', 'Blusa', 'Short', 'Calça', 'Saias', 'Vestido longo', 'Vestido curto', 'Macaquinho', 'Conjunto'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-[#50121E] text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products List Table / Cards */}
            <div className="border border-[#EAE3DE] rounded-xl overflow-hidden divide-y divide-[#EAE3DE] bg-white">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-500">
                  Nenhuma peça encontrada com os filtros aplicados.
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const isSold = p.status === 'vendida';
                  return (
                    <div
                      key={p.id}
                      className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-14 h-16 bg-stone-100 rounded-lg overflow-hidden shrink-0 border border-stone-200 relative">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className={`w-full h-full object-cover ${isSold ? 'grayscale' : ''}`}
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#50121E] bg-[#50121E]/10 px-2 py-0.5 rounded">
                              {p.code}
                            </span>
                            <span className="text-[11px] text-stone-500">{p.category}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isSold
                                  ? 'bg-stone-200 text-stone-700'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isSold ? 'Vendida / Tirada' : 'Disponível'}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-stone-900 truncate mt-1">
                            {p.name}
                          </h4>

                          <div className="flex items-center gap-2 text-xs text-stone-600 mt-0.5">
                            <span className="font-mono font-bold text-[#50121E]">
                              R$ {p.price.toFixed(2).replace('.', ',')}
                            </span>
                            <span>·</span>
                            <span>Tam: {p.sizes.join(', ')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Management Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => handleToggleProductStatus(p)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                            isSold
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          {isSold ? 'Tornar Disponível' : 'Marcar como Vendida'}
                        </button>

                        <button
                          onClick={() => onOpenProductModal(p)}
                          className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg flex items-center gap-1"
                          title="Tirar peça definitivamente do sistema"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Tirar Peça</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ----------------- TAB 2: SACOLAS DE PROVA RECEBIDAS ----------------- */}
        {activeTab === 'bags' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#FAF7F5] p-4 rounded-xl border border-[#EAE3DE]">
              <div>
                <h3 className="text-sm font-bold text-[#50121E]">
                  Propostas de Sacola de Prova Enviadas pelas Clientes
                </h3>
                <p className="text-xs text-stone-500">
                  Protegidas pelas regras do banco de dados (acessíveis apenas por você).
                </p>
              </div>
              <span className="text-xs font-bold text-[#50121E] bg-white px-3 py-1.5 rounded-lg border border-[#EAE3DE]">
                Total: {bags.length} sacolas
              </span>
            </div>

            {bags.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-[#EAE3DE] p-8">
                <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-stone-700">Nenhuma sacola recebida ainda</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Assim que suas clientes adicionarem roupas na sacola e solicitarem a prova,
                  elas aparecerão listadas aqui com todas as fotos, tamanhos e contato.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bags.map((bag) => {
                  const cleanCustomerPhone = bag.customerPhone.replace(/\D/g, '');
                  const customerZapUrl = `https://wa.me/${cleanCustomerPhone}?text=${encodeURIComponent(
                    `Olá, ${bag.customerName}! Aqui é da Eterna Chique. Recebi seu pedido de Mala de Prova #${bag.id}. Podemos combinar a entrega? ✨`
                  )}`;

                  return (
                    <div
                      key={bag.id}
                      className="bg-white rounded-xl border border-[#EAE3DE] p-4 sm:p-5 shadow-xs space-y-4"
                    >
                      {/* Bag Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#50121E]">
                              #{bag.id}
                            </span>
                            <span className="text-xs text-stone-400">·</span>
                            <span className="text-xs text-stone-500">
                              {new Date(bag.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <div className="text-base font-bold text-stone-900 mt-0.5">
                            {bag.customerName}
                          </div>
                          <div className="text-xs text-stone-600 flex items-center gap-2 mt-0.5">
                            <span>WhatsApp: {bag.customerPhone}</span>
                            <a
                              href={customerZapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#25D366] font-semibold hover:underline"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Conversar no Zap</span>
                            </a>
                          </div>
                        </div>

                        {/* Status Select & Delete */}
                        <div className="flex items-center gap-2">
                          <select
                            value={bag.status}
                            onChange={(e) => handleUpdateBagStatus(bag.id, e.target.value as BagStatus)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border focus:outline-none ${
                              bag.status === 'nova'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : bag.status === 'separada'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : bag.status === 'em_prova'
                                ? 'bg-purple-50 text-purple-800 border-purple-300'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            <option value="nova">Nova Sacola</option>
                            <option value="separada">Peças Separadas</option>
                            <option value="em_prova">Mala em Prova com a Cliente</option>
                            <option value="finalizada">Prova Finalizada</option>
                          </select>

                          <button
                            onClick={() => handleDeleteBag(bag.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-100 transition-colors"
                            title="Excluir Sacola"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Items in the bag */}
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                          Peças Propostas para Prova ({bag.items.length}):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {bag.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2.5 p-2 bg-stone-50 rounded-lg border border-stone-200"
                            >
                              <div className="w-12 h-14 bg-stone-200 rounded overflow-hidden shrink-0">
                                <img
                                  src={it.imageUrl}
                                  alt={it.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-stone-900 truncate">
                                  {it.name}
                                </div>
                                <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                                  <span className="font-mono text-[#50121E] font-bold">{it.code}</span>
                                  <span>·</span>
                                  <span>Tam {it.size}</span>
                                </div>
                                <div className="text-xs font-mono font-semibold text-[#50121E]">
                                  R$ {it.price.toFixed(2).replace('.', ',')}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer uploaded image / Notes */}
                      {(bag.customerImage || bag.customerNotes) && (
                        <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#EAE3DE] flex flex-col sm:flex-row items-start gap-4">
                          {bag.customerImage && (
                            <div>
                              <span className="text-[11px] font-bold text-stone-700 block mb-1">
                                Foto Enviada pela Cliente:
                              </span>
                              <div className="w-24 h-24 rounded-lg overflow-hidden border border-[#50121E]/30 bg-white">
                                <img
                                  src={bag.customerImage}
                                  alt="Foto enviada pela cliente"
                                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                  onClick={() => window.open(bag.customerImage, '_blank')}
                                  title="Clique para ampliar"
                                />
                              </div>
                            </div>
                          )}

                          {bag.customerNotes && (
                            <div className="flex-1">
                              <span className="text-[11px] font-bold text-stone-700 block mb-1">
                                Observações da Cliente:
                              </span>
                              <p className="text-xs text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200 leading-relaxed">
                                {bag.customerNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Total Amount */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                        <span className="text-stone-500">Valor Total das Peças na Mala:</span>
                        <span className="text-base font-bold text-[#50121E] font-mono">
                          R$ {bag.totalAmount.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB 3: CONFIGURAÇÕES DA LOJA ----------------- */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="max-w-2xl bg-white p-6 rounded-xl border border-[#EAE3DE] space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#50121E]">
                Configurações da Boutique Eterna Chique
              </h3>
              <p className="text-xs text-stone-500">
                Altere seus contatos, links e frase do catálogo.
              </p>
            </div>

            {settingsSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Configurações salvas e sincronizadas com sucesso!</span>
              </div>
            )}

            {settingsError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{settingsError}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Nome da Marca
              </label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#681A28]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Frase de Destaque (Tagline) *
              </label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Ex: A elegância que transcende o tempo."
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#681A28]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Texto de Apresentação da Loja
              </label>
              <textarea
                rows={3}
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#681A28]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Instagram (@handle) *
                </label>
                <input
                  type="text"
                  required
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  placeholder="@eternachique.oficial"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#681A28]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Link Completo do Instagram
                </label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#681A28]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Número do WhatsApp (com DDI e DDD) *
                </label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="Ex: 5511999999999"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#681A28]"
                />
                <span className="text-[10px] text-stone-400">Somente números, ex: 5511999999999</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Exibição Formatada do WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={whatsappFormatted}
                  onChange={(e) => setWhatsappFormatted(e.target.value)}
                  placeholder="Ex: (11) 99999-9999"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#681A28]"
                />
              </div>
            </div>

            {/* Authentication status box */}
            <div className="pt-3 border-t border-stone-100 p-3 bg-stone-50 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-stone-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Autenticação ativa e protegida via Firebase</span>
              </div>
              <span className="font-mono text-[11px] text-[#50121E] font-semibold">{userEmail}</span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#681A28] hover:bg-[#50121E] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configurações</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
