import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Catalog } from './components/Catalog';
import { ProductModal } from './components/ProductModal';
import { BagDrawer } from './components/BagDrawer';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { ProductFormModal } from './components/ProductFormModal';
import { Footer } from './components/Footer';
import { Product, BagItem, BagRequest, StoreSettings, PublicStoreSettings } from './types/store';

const DEFAULT_PUBLIC_SETTINGS: PublicStoreSettings = {
  brandName: 'Eterna Chique',
  tagline: 'A elegância que transcende o tempo.',
  aboutText: 'Peças pensadas para mulheres que valorizam sofisticação, cortes nobres e caimento impecável. Escolha suas peças e solicite sua sacola de prova para experimentar.',
  instagramHandle: '@eternachique.oficial',
  instagramUrl: 'https://instagram.com/eternachique.oficial',
  whatsappNumber: '5511999999999',
  whatsappFormatted: '(11) 99999-9999',
  logoUrl: '/src/assets/images/eterna_chique_butterfly_logo_1793216109879.jpg',
};

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    ...DEFAULT_PUBLIC_SETTINGS,
    adminPasswordHash: 'eterna123',
  });
  const [bags, setBags] = useState<BagRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Bag State
  const [bagItems, setBagItems] = useState<BagItem[]>(() => {
    try {
      const saved = localStorage.getItem('eterna_chique_bag');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isBagOpen, setIsBagOpen] = useState(false);

  // Admin Mode State
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('eterna_chique_admin_token');
    } catch {
      return null;
    }
  });
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Modals
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Save bag items to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('eterna_chique_bag', JSON.stringify(bagItems));
    } catch (e) {
      console.warn('Could not persist bag locally', e);
    }
  }, [bagItems]);

  // Load public catalog or admin overview
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (adminToken) {
        // If logged in, fetch admin overview
        const res = await fetch('/api/admin/overview', {
          headers: { Authorization: `Bearer ${adminToken}` },
        });

        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setBags(data.bags || []);
          if (data.settings) setSettings(data.settings);
          setIsAdminView(true);
          setIsLoading(false);
          return;
        } else if (res.status === 401 || res.status === 403) {
          // Token expired or invalid
          localStorage.removeItem('eterna_chique_admin_token');
          setAdminToken(null);
          setIsAdminView(false);
        }
      }

      // Public catalog fallback
      const catRes = await fetch('/api/catalog');
      if (catRes.ok) {
        const catData = await catRes.json();
        setProducts(catData.products || []);
        if (catData.settings) {
          setSettings((prev) => ({ ...prev, ...catData.settings }));
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Bag Operations
  const handleAddToBag = (product: Product, size: string) => {
    setBagItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.productId === product.id && it.size === size
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        return copy;
      }
      return [
        ...prev,
        {
          productId: product.id,
          code: product.code,
          name: product.name,
          category: product.category,
          price: product.price,
          size,
          quantity: 1,
          imageUrl: product.imageUrl,
        },
      ];
    });
  };

  const handleUpdateQuantity = (productId: string, size: string, delta: number) => {
    setBagItems((prev) =>
      prev
        .map((it) => {
          if (it.productId === productId && it.size === size) {
            const newQty = it.quantity + delta;
            return newQty > 0 ? { ...it, quantity: newQty } : null;
          }
          return it;
        })
        .filter(Boolean) as BagItem[]
    );
  };

  const handleRemoveFromBag = (productId: string, size: string) => {
    setBagItems((prev) =>
      prev.filter((it) => !(it.productId === productId && it.size === size))
    );
  };

  const handleClearBag = () => {
    setBagItems([]);
    try {
      localStorage.removeItem('eterna_chique_bag');
    } catch {}
  };

  // Admin Log In
  const handleLoginSuccess = (token: string) => {
    try {
      localStorage.setItem('eterna_chique_admin_token', token);
    } catch {}
    setAdminToken(token);
    setIsAdminView(true);
  };

  const handleLogoutAdmin = () => {
    try {
      localStorage.removeItem('eterna_chique_admin_token');
    } catch {}
    setAdminToken(null);
    setIsAdminView(false);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (!adminToken) return;

    if (productToEdit) {
      // Update
      const res = await fetch(`/api/admin/products/${productToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(productData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao atualizar.');
      }
    } else {
      // Create
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(productData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao cadastrar.');
      }
    }

    setProductToEdit(null);
    await loadData();
  };

  // Quick toggle status for product
  const handleToggleProductStatus = async (product: Product) => {
    if (!adminToken) return;
    const nextStatus = product.status === 'vendida' ? 'disponivel' : 'vendida';
    try {
      const res = await fetch(`/api/admin/products/${product.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  // Quick delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!adminToken) return;
    if (!window.confirm('Tem certeza que deseja tirar esta peça do catálogo?')) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const totalPiecesInBag = bagItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F5] text-stone-900">
      {/* Header */}
      <Header
        settings={settings}
        bagCount={totalPiecesInBag}
        onOpenBag={() => setIsBagOpen(true)}
        isAdmin={!!adminToken && isAdminView}
        onOpenAdmin={() => {
          if (adminToken) {
            setIsAdminView(true);
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        onExitAdmin={() => setIsAdminView(false)}
      />

      <main className="flex-1">
        {/* If Admin is active and currently in admin view, show full panel */}
        {adminToken && isAdminView && (
          <AdminPanel
            products={products}
            bags={bags}
            settings={settings}
            adminToken={adminToken}
            onRefreshData={loadData}
            onOpenProductModal={(prod) => {
              setProductToEdit(prod || null);
              setIsProductFormOpen(true);
            }}
            onCloseAdmin={() => setIsAdminView(false)}
          />
        )}

        {/* Hero Section */}
        <Hero settings={settings} />

        {/* Catalog Section */}
        <Catalog
          products={products}
          whatsappNumber={settings.whatsappNumber}
          onAddToBag={handleAddToBag}
          onViewDetails={(prod) => setViewingProduct(prod)}
          isAdmin={!!adminToken && isAdminView}
          onToggleStatus={handleToggleProductStatus}
          onEditProduct={(prod) => {
            setProductToEdit(prod);
            setIsProductFormOpen(true);
          }}
          onDeleteProduct={handleDeleteProduct}
          onOpenNewProductModal={() => {
            setProductToEdit(null);
            setIsProductFormOpen(true);
          }}
        />
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenAdmin={() => {
          if (adminToken) {
            setIsAdminView(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        isAdmin={!!adminToken && isAdminView}
      />

      {/* Modals & Drawers */}
      <ProductModal
        product={viewingProduct}
        onClose={() => setViewingProduct(null)}
        onAddToBag={handleAddToBag}
        whatsappNumber={settings.whatsappNumber}
      />

      <BagDrawer
        isOpen={isBagOpen}
        onClose={() => setIsBagOpen(false)}
        items={bagItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromBag}
        onClearBag={handleClearBag}
        whatsappNumber={settings.whatsappNumber}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <ProductFormModal
        isOpen={isProductFormOpen}
        onClose={() => {
          setIsProductFormOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
