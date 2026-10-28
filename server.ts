import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product, BagRequest, StoreSettings, PublicStoreSettings } from './src/types/store.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Ensure data and uploads directory exist
const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const UPLOADS_DIR = path.resolve(__dirname, 'public', 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Default initial catalog
const DEFAULT_SETTINGS: StoreSettings = {
  brandName: 'Eterna Chique',
  tagline: 'A elegância que transcende o tempo.',
  aboutText: 'Peças pensadas para mulheres que valorizam sofisticação, cortes nobres e caimento impecável. Escolha suas peças e solicite sua sacola de prova para experimentar.',
  instagramHandle: '@eternachique.oficial',
  instagramUrl: 'https://instagram.com/eternachique.oficial',
  whatsappNumber: '5511999999999',
  whatsappFormatted: '(11) 99999-9999',
  logoUrl: '/src/assets/images/eterna_chique_butterfly_logo_1793216109879.jpg',
  adminPasswordHash: 'eterna123',
};

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    code: 'EC-01',
    name: 'Blusa Seda Champagne & Vinho',
    category: 'Blusa',
    price: 189.90,
    sizes: ['P', 'M', 'G'],
    description: 'Blusa refinada em seda pura com detalhes e punhos em tom vinho nobre. Botões perolados e caimento impecável.',
    imageUrl: '/src/assets/images/blusa_seda_elegante_1793216112591.jpg',
    status: 'disponivel',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    code: 'EC-02',
    name: 'Short Alfaiataria Linho com Cinto',
    category: 'Short',
    price: 169.90,
    sizes: ['36', '38', '40', '42'],
    description: 'Short de cintura alta com pregas frontais e cinto fininho estruturado. Tecido nobre de linho misto encorpado.',
    imageUrl: '/src/assets/images/short_alfaiataria_luxo_1793216127227.jpg',
    status: 'disponivel',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    code: 'EC-03',
    name: 'Calça Pantalona Alfaiataria Vinho',
    category: 'Calça',
    price: 249.90,
    sizes: ['36', '38', '40', '42', '44'],
    description: 'Pantalona fluida com vinco clássico e cós anatômico. Corte alongador em crepe alfaiataria de alta gramatura.',
    imageUrl: '/src/assets/images/calca_pantalona_vinho_1793216127922.jpg',
    status: 'disponivel',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    code: 'EC-04',
    name: 'Saia Midi Plissada Acetinada',
    category: 'Saias',
    price: 219.90,
    sizes: ['P', 'M', 'G'],
    description: 'Saia midi com plissado permanente delicado e acabamento acetinado com brilho sutil. Movimento gracioso e feminino.',
    imageUrl: '/src/assets/images/saia_midi_plissada_1793216128399.jpg',
    status: 'disponivel',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    code: 'EC-05',
    name: 'Vestido Longo Gala Vinho Nobre',
    category: 'Vestido longo',
    price: 429.90,
    sizes: ['P', 'M', 'G', 'GG'],
    description: 'Vestido longo majestoso com decote transpassado e drapeado escultural na cintura. Tecido fluido acetinado toque de seda.',
    imageUrl: '/src/assets/images/vestido_longo_luxo_1793216112203.jpg',
    status: 'disponivel',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-6',
    code: 'EC-06',
    name: 'Vestido Curto Cocktail Plissado',
    category: 'Vestido curto',
    price: 289.90,
    sizes: ['P', 'M', 'G'],
    description: 'Vestido curto elegante com decote canoa e saia em pregas finas estruturadas. Perfeito para coquetéis e jantares sofisticados.',
    imageUrl: '/src/assets/images/vestido_curto_elegante_1793216113250.jpg',
    status: 'disponivel',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-7',
    code: 'EC-07',
    name: 'Macaquinho Alfaiataria Tuxedo',
    category: 'Macaquinho',
    price: 269.90,
    sizes: ['P', 'M', 'G'],
    description: 'Macaquinho com gola smoking sofisticada, mangas longas e faixa ajustável de amarração na cintura. Sofisticação e praticidade.',
    imageUrl: '/src/assets/images/macaquinho_chique_1793216128376.jpg',
    status: 'disponivel',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-8',
    code: 'EC-08',
    name: 'Conjunto Alfaiataria Blazer & Calça',
    category: 'Conjunto',
    price: 489.90,
    sizes: ['P', 'M', 'G'],
    description: 'Conjunto atemporal de blazer estruturado com forro acetinado acompanhado de calça clássica. Elegância definitiva.',
    imageUrl: '/src/assets/images/conjunto_alfaiataria_1793216111923.jpg',
    status: 'disponivel',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface DatabaseSchema {
  settings: StoreSettings;
  products: Product[];
  bags: BagRequest[];
}

let dbData: DatabaseSchema = {
  settings: DEFAULT_SETTINGS,
  products: DEFAULT_PRODUCTS,
  bags: [],
};

// Load or initialize database
function loadDatabase() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      dbData = {
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
        products: Array.isArray(parsed.products) ? parsed.products : DEFAULT_PRODUCTS,
        bags: Array.isArray(parsed.bags) ? parsed.bags : [],
      };
      console.log(`[Store] Loaded ${dbData.products.length} products and ${dbData.bags.length} bags from storage.`);
    } else {
      saveDatabase();
      console.log('[Store] Initialized default database and saved to disk.');
    }
  } catch (err) {
    console.error('[Store] Error loading database:', err);
    saveDatabase();
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Store] Error saving database:', err);
  }
}

loadDatabase();

// In-memory active admin tokens
const activeTokens = new Set<string>();

// Middleware to parse JSON with large payloads (for image base64 uploads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static public folder (includes uploads)
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(path.resolve(__dirname, 'public')));

// Admin authentication middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Acesso não autorizado. Faça login com a senha.' });
    return;
  }
  const token = authHeader.substring(7);
  if (!activeTokens.has(token)) {
    res.status(403).json({ error: 'Sessão expirada ou inválida.' });
    return;
  }
  next();
}

// -----------------------------------------------------------------------------
// PUBLIC API ENDPOINTS
// -----------------------------------------------------------------------------

// 1. Get public catalog
app.get('/api/catalog', (req: Request, res: Response) => {
  const publicSettings: PublicStoreSettings = {
    brandName: dbData.settings.brandName,
    tagline: dbData.settings.tagline,
    aboutText: dbData.settings.aboutText,
    instagramHandle: dbData.settings.instagramHandle,
    instagramUrl: dbData.settings.instagramUrl,
    whatsappNumber: dbData.settings.whatsappNumber,
    whatsappFormatted: dbData.settings.whatsappFormatted,
    logoUrl: dbData.settings.logoUrl,
  };

  res.json({
    settings: publicSettings,
    products: dbData.products,
  });
});

// 2. Submit customer bag (Sacola de Prova)
app.post('/api/bag', (req: Request, res: Response) => {
  const { customerName, customerPhone, customerNotes, customerImage, items } = req.body;

  if (!customerName || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Preencha seu nome, WhatsApp e adicione ao menos uma peça à sacola.' });
    return;
  }

  const totalAmount = items.reduce((acc: number, item: any) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

  const bagId = `SAC-${Math.floor(1000 + Math.random() * 9000)}`;
  const newBag: BagRequest = {
    id: bagId,
    customerName: String(customerName).trim(),
    customerPhone: String(customerPhone).trim(),
    customerNotes: customerNotes ? String(customerNotes).trim() : undefined,
    customerImage: customerImage || undefined,
    items: items.map((it: any) => ({
      productId: String(it.productId || ''),
      code: String(it.code || ''),
      name: String(it.name || ''),
      category: it.category,
      price: Number(it.price) || 0,
      size: String(it.size || 'U'),
      quantity: Number(it.quantity) || 1,
      imageUrl: String(it.imageUrl || ''),
    })),
    totalAmount,
    status: 'nova',
    createdAt: new Date().toISOString(),
  };

  dbData.bags.unshift(newBag);
  saveDatabase();

  // Generate WhatsApp message content for direct contact
  const storePhone = dbData.settings.whatsappNumber.replace(/\D/g, '');
  let messageText = `Olá, *${dbData.settings.brandName}*! ✨\n`;
  messageText += `Gostaria de experimentar as seguintes peças da minha *Sacola de Prova* (${bagId}):\n\n`;

  newBag.items.forEach((item, index) => {
    messageText += `${index + 1}. *${item.name}*\n`;
    messageText += `   • Código: ${item.code}\n`;
    messageText += `   • Tamanho: ${item.size}\n`;
    messageText += `   • Valor: R$ ${item.price.toFixed(2).replace('.', ',')}\n\n`;
  });

  messageText += `*Valor Total Estimado:* R$ ${totalAmount.toFixed(2).replace('.', ',')}\n`;
  messageText += `*Cliente:* ${newBag.customerName}\n`;
  messageText += `*WhatsApp:* ${newBag.customerPhone}\n`;

  if (newBag.customerNotes) {
    messageText += `*Observação:* ${newBag.customerNotes}\n`;
  }
  if (newBag.customerImage) {
    messageText += `*(Enviei também uma foto de referência anexada na sacola)*\n`;
  }

  const encodedMessage = encodeURIComponent(messageText);
  const whatsappUrl = `https://wa.me/${storePhone}?text=${encodedMessage}`;

  res.json({
    success: true,
    bagId,
    bag: newBag,
    whatsappUrl,
  });
});

// 3. Upload image (used by admin for clothes photos, and by customer to send inspiration clothes photos)
app.post('/api/upload-image', (req: Request, res: Response) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      res.status(400).json({ error: 'Dados da imagem não fornecidos.' });
      return;
    }

    // Extract mime type and base64 payload
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = 'jpg';

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(imageBase64, 'base64');
    }

    const cleanName = filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '') : 'peca';
    const uniqueFilename = `${Date.now()}-${cleanName}.${ext}`;
    const destinationPath = path.join(UPLOADS_DIR, uniqueFilename);

    fs.writeFileSync(destinationPath, buffer);
    const imageUrl = `/uploads/${uniqueFilename}`;

    res.json({ success: true, imageUrl });
  } catch (err: any) {
    console.error('[Upload] Error saving image:', err);
    res.status(500).json({ error: 'Falha ao processar imagem.' });
  }
});

// -----------------------------------------------------------------------------
// ADMIN API ENDPOINTS (Protected with password)
// -----------------------------------------------------------------------------

// Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password || String(password).trim() !== dbData.settings.adminPasswordHash) {
    res.status(401).json({ error: 'Senha incorreta. Verifique e tente novamente.' });
    return;
  }

  const token = `token-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  activeTokens.add(token);

  res.json({
    success: true,
    token,
    message: 'Acesso autorizado.',
  });
});

// Admin data overview
app.get('/api/admin/overview', requireAdmin, (req: Request, res: Response) => {
  res.json({
    settings: dbData.settings,
    products: dbData.products,
    bags: dbData.bags,
  });
});

// Create product
app.post('/api/admin/products', requireAdmin, (req: Request, res: Response) => {
  const { code, name, category, price, sizes, description, imageUrl, status } = req.body;

  if (!code || !name || !category || price === undefined) {
    res.status(400).json({ error: 'Código, nome, categoria e preço são obrigatórios.' });
    return;
  }

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    code: String(code).trim().toUpperCase(),
    name: String(name).trim(),
    category,
    price: parseFloat(price) || 0,
    sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : ['U'],
    description: description ? String(description).trim() : '',
    imageUrl: imageUrl ? String(imageUrl).trim() : '/src/assets/images/blusa_seda_elegante_1793216112591.jpg',
    status: status === 'vendida' || status === 'reservada' ? status : 'disponivel',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dbData.products.unshift(newProduct);
  saveDatabase();

  res.status(201).json({ success: true, product: newProduct });
});

// Update product
app.put('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = dbData.products.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Peça não encontrada.' });
    return;
  }

  const prev = dbData.products[index];
  const updated: Product = {
    ...prev,
    ...req.body,
    id: prev.id, // prevent id change
    price: req.body.price !== undefined ? parseFloat(req.body.price) || 0 : prev.price,
    updatedAt: new Date().toISOString(),
  };

  dbData.products[index] = updated;
  saveDatabase();

  res.json({ success: true, product: updated });
});

// Delete product ("quando vender a roupa, tirar essa peça")
app.delete('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = dbData.products.length;
  dbData.products = dbData.products.filter((p) => p.id !== id);

  if (dbData.products.length === initialLength) {
    res.status(404).json({ error: 'Peça não encontrada para exclusão.' });
    return;
  }

  saveDatabase();
  res.json({ success: true, message: 'Peça removida com sucesso.' });
});

// Toggle status of a product (Disponível <-> Vendida)
app.patch('/api/admin/products/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const product = dbData.products.find((p) => p.id === id);

  if (!product) {
    res.status(404).json({ error: 'Peça não encontrada.' });
    return;
  }

  product.status = status;
  product.updatedAt = new Date().toISOString();
  saveDatabase();

  res.json({ success: true, product });
});

// Update bag request status
app.patch('/api/admin/bags/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const bag = dbData.bags.find((b) => b.id === id);

  if (!bag) {
    res.status(404).json({ error: 'Sacola não encontrada.' });
    return;
  }

  bag.status = status;
  saveDatabase();

  res.json({ success: true, bag });
});

// Delete bag request
app.delete('/api/admin/bags/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  dbData.bags = dbData.bags.filter((b) => b.id !== id);
  saveDatabase();
  res.json({ success: true, message: 'Sacola excluída.' });
});

// Update settings (WhatsApp, Instagram, Tagline, Password)
app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const { brandName, tagline, aboutText, instagramHandle, instagramUrl, whatsappNumber, whatsappFormatted, newPassword } = req.body;

  if (brandName) dbData.settings.brandName = String(brandName).trim();
  if (tagline !== undefined) dbData.settings.tagline = String(tagline).trim();
  if (aboutText !== undefined) dbData.settings.aboutText = String(aboutText).trim();
  if (instagramHandle !== undefined) dbData.settings.instagramHandle = String(instagramHandle).trim();
  if (instagramUrl !== undefined) dbData.settings.instagramUrl = String(instagramUrl).trim();
  if (whatsappNumber !== undefined) dbData.settings.whatsappNumber = String(whatsappNumber).trim();
  if (whatsappFormatted !== undefined) dbData.settings.whatsappFormatted = String(whatsappFormatted).trim();

  if (newPassword && String(newPassword).trim().length >= 4) {
    dbData.settings.adminPasswordHash = String(newPassword).trim();
  }

  saveDatabase();

  res.json({ success: true, settings: dbData.settings });
});

// -----------------------------------------------------------------------------
// FRONTEND MOUNTING & SERVER START
// -----------------------------------------------------------------------------

async function startServer() {
  if (!isProduction) {
    // Dynamic import vite in dev mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production: serve built static files from /dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Eterna Chique Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Eterna Chique Server] Failed to start:', err);
  process.exit(1);
});
