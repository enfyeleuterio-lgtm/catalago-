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
import {
  auth,
  db,
  AUTHORIZED_ADMIN_EMAIL,
  handleFirestoreError,
  OperationType,
} from './lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

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
  });
  const [bags, setBags] = useState<BagRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('eterna_chique_admin_session');
    } catch {
      return null;
    }
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('eterna_chique_admin_session'));
    } catch {
      return false;
    }
  });
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('eterna_chique_admin_session'));
    } catch {
      return false;
    }
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

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

  // Modals
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Save bag items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('eterna_chique_bag', JSON.stringify(bagItems));
    } catch (e) {
      console.warn('Could not persist bag locally', e);
    }
  }, [bagItems]);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        if (user.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
          setIsAdmin(true);
          setIsAdminView(true);
        } else {
          await signOut(auth);
          alert(
            `Acesso Negado: A conta "${user.email}" não possui permissões de administradora. Apenas ${AUTHORIZED_ADMIN_EMAIL} é autorizada.`
          );
          setIsAdmin(false);
          setIsAdminView(false);
        }
      } else if (!adminToken) {
        setIsAdmin(false);
        setIsAdminView(false);
      }
    });

    return () => unsubscribe();
  }, [adminToken]);

  // Helper to get active token
  const getActiveAuthToken = useCallback(async (): Promise<string> => {
    if (adminToken) return adminToken;
    if (auth.currentUser) {
      try {
        return (await auth.currentUser.getIdToken()) || '';
      } catch {
        return '';
      }
    }
    return '';
  }, [adminToken]);

  // Fetch or Seed Data
  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      // 1. Fetch products from Firestore
      let fetchedProducts: Product[] = [];
      try {
        const prodSnapshot = await getDocs(collection(db, 'products'));
        if (!prodSnapshot.empty) {
          fetchedProducts = prodSnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Product, 'id'>),
          }));
        }
      } catch (err) {
        console.warn('Firestore products fetch warning:', err);
      }

      // If Firestore has no products yet, seed with existing boutique catalog from backend
      if (fetchedProducts.length === 0) {
        try {
          const res = await fetch('/api/catalog');
          if (res.ok) {
            const data = await res.json();
            if (data.products && Array.isArray(data.products) && data.products.length > 0) {
              fetchedProducts = data.products;

              // If admin is authenticated via Firebase, seed to Firestore
              if (auth.currentUser && auth.currentUser.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
                for (const p of fetchedProducts) {
                  try {
                    await setDoc(doc(db, 'products', p.id), {
                      code: p.code,
                      name: p.name,
                      category: p.category,
                      price: p.price,
                      sizes: p.sizes,
                      description: p.description || '',
                      imageUrl: p.imageUrl,
                      status: p.status,
                      createdAt: p.createdAt || new Date().toISOString(),
                      updatedAt: p.updatedAt || new Date().toISOString(),
                    });
                  } catch (seedErr) {
                    console.warn('Error seeding product to Firestore:', seedErr);
                  }
                }
              }
            }
          }
        } catch (fetchErr) {
          console.error('Error fetching fallback catalog:', fetchErr);
        }
      }

      setProducts(fetchedProducts);

      // 2. Fetch settings
      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'store'));
        if (settingsSnap.exists()) {
          setSettings((prev) => ({ ...prev, ...(settingsSnap.data() as StoreSettings) }));
        } else {
          const catRes = await fetch('/api/catalog');
          if (catRes.ok) {
            const catData = await catRes.json();
            if (catData.settings) {
              setSettings((prev) => ({ ...prev, ...catData.settings }));
            }
          }
        }
      } catch (settingsErr) {
        console.warn('Firestore settings fetch warning:', settingsErr);
      }

      // 3. If Admin, fetch bags
      if (isAdmin) {
        const token = await getActiveAuthToken();
        if (token) {
          try {
            const bRes = await fetch('/api/admin/overview', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (bRes.ok) {
              const bData = await bRes.json();
              setBags(bData.bags || []);
            } else if (bRes.status === 401 || bRes.status === 403) {
              // Token expired
              try {
                localStorage.removeItem('eterna_chique_admin_session');
              } catch {}
              setAdminToken(null);
              setIsAdmin(false);
              setIsAdminView(false);
            }
          } catch (e) {
            console.warn('Error fetching admin bags:', e);
          }
        }
      }
    } catch (err) {
      console.error('Error in loadData:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, getActiveAuthToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Bag Operations (Customer)
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

  // Login Success Handler
  const handleLoginSuccess = (token?: string, userEmail?: string) => {
    if (token) {
      try {
        localStorage.setItem('eterna_chique_admin_session', token);
      } catch {}
      setAdminToken(token);
    }
    setIsAdmin(true);
    setIsAdminView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadData();
  };

  // Logout Admin
  const handleLogoutAdmin = async () => {
    try {
      localStorage.removeItem('eterna_chique_admin_session');
    } catch {}
    setAdminToken(null);
    try {
      await signOut(auth);
    } catch {}
    setIsAdmin(false);
    setIsAdminView(false);
  };

  // Save Product (Admin Only)
  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (!isAdmin) {
      alert('Ação bloqueada: Somente a administradora autorizada pode cadastrar ou alterar peças.');
      return;
    }

    try {
      const id = productToEdit ? productToEdit.id : `prod-${Date.now()}`;
      const payload = {
        code: productData.code || 'EC-00',
        name: productData.name || 'Nova Peça',
        category: productData.category || 'Vestido longo',
        price: Number(productData.price) || 0,
        sizes: productData.sizes || ['U'],
        description: productData.description || '',
        imageUrl: productData.imageUrl || '/src/assets/images/blusa_seda_elegante_1793216112591.jpg',
        status: productData.status || 'disponivel',
        createdAt: productToEdit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 1. Save to Firestore if available
      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'products', id), payload, { merge: true });
        } catch (fErr) {
          console.warn('Firestore direct save warning:', fErr);
        }
      }

      // 2. Sync to local backend
      const token = await getActiveAuthToken();
      if (productToEdit) {
        await fetch(`/api/admin/products/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/admin/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id, ...payload }),
        });
      }

      setProductToEdit(null);
      await loadData();
    } catch (err: any) {
      console.error('Error saving product:', err);
    }
  };

  // Quick toggle status for product
  const handleToggleProductStatus = async (product: Product) => {
    if (!isAdmin) return;
    const nextStatus = product.status === 'vendida' ? 'disponivel' : 'vendida';
    try {
      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'products', product.id), {
            status: nextStatus,
            updatedAt: new Date().toISOString(),
          });
        } catch {}
      }

      const token = await getActiveAuthToken();
      await fetch(`/api/admin/products/${product.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      await loadData();
    } catch (err: any) {
      console.error('Error toggling status:', err);
    }
  };

  // Quick delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!isAdmin) return;
    if (!window.confirm('Tem certeza que deseja tirar esta peça do catálogo?')) return;
    try {
      if (auth.currentUser) {
        try {
          await deleteDoc(doc(db, 'products', productId));
        } catch {}
      }

      const token = await getActiveAuthToken();
      await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      await loadData();
    } catch (err: any) {
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
        isAdmin={isAdmin}
        userEmail={currentUser?.email || (isAdmin ? AUTHORIZED_ADMIN_EMAIL : undefined)}
        onOpenAdmin={() => {
          if (isAdmin) {
            setIsAdminView(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        onExitAdmin={() => setIsAdminView(false)}
        onLogout={handleLogoutAdmin}
      />

      <main className="flex-1">
        {/* If Admin is active and in Admin View, display administrative dashboard */}
        {isAdmin && isAdminView && (
          <AdminPanel
            products={products}
            bags={bags}
            settings={settings}
            adminToken={adminToken}
            userEmail={currentUser?.email || AUTHORIZED_ADMIN_EMAIL}
            onRefreshData={loadData}
            onOpenProductModal={(prod) => {
              setProductToEdit(prod || null);
              setIsProductFormOpen(true);
            }}
            onCloseAdmin={() => setIsAdminView(false)}
            onLogout={handleLogoutAdmin}
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
          isAdmin={isAdmin && isAdminView}
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
          if (isAdmin) {
            setIsAdminView(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        isAdmin={isAdmin}
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
