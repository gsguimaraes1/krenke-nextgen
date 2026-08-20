import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, FileDown, Trash2, Calculator, Package, AlertCircle,
  Plus, Edit2, Check, X, Loader2, ImagePlus, Image as ImageIcon,
  User, FileText, ChevronDown, ChevronUp, History as HistoryIcon, FilePlus, Save,
  Download,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import CreatableSelect from 'react-select/creatable';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { CalculatorProduct, QuoteItem, ResellerQuote } from '../../types';

const IPI_RATE = 0.065;
const AVISTA_DISCOUNT_RATE = 0.05;
const MAX_MARGIN = 90; // acima disso a fórmula margem-sobre-venda diverge (1 - margin/100 → 0)
const MAX_PARK_IMAGES = 5;
const LOGO_URL = 'https://cdn.awsli.com.br/2185/2185627/arquivos/krenke-brinquedos-logo-branco-d__fogmt.webp';

// Allowlist fixa p/ cadastrar novas revendas no dropdown "Revendedor Associado"
// (nome manual por enquanto — até automatizar associação revenda <-> login).
// Mesmo padrão hardcoded de api/report-url.js / App.tsx (/relatorio).
const ASSOCIATED_RESELLER_MANAGERS = new Set([
  'ff315d16-e719-485e-8d2f-20df219666c5',
  '1757670c-5ab0-4642-82b3-9acdbfa14701',
  '40bfce8e-fe27-44e2-bda3-cf6273fc6fea',
  'd19952b5-151c-4943-bf74-1a07b199ba75',
]);

const DEFAULT_DISCLAIMER = 'Esta cotação é válida por 30 dias. Preços sujeitos a alteração sem aviso prévio. IPI conforme legislação vigente.\nKrenke Brinquedos Pedagógicos  •  www.krenke.com.br';

function buildFullDisclaimer(name: string, phone: string, email: string): string {
  const today = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  return `À vista 5% desconto sendo 50% no fechamento do pedido via PIX e restante no boleto para 7 dias;
Entrada de 50% e restante no boleto bancário em 3X sem juros e sem desconto.
Obs. Será emitida uma nota do PRODUTO e outra M.O sendo 30% do valor;
Frete, instalação por conta da KRENKE;
Parque conforme as normas NBR 16.071/12;
Proposta válida por 7 dias;
Garantia de 2 anos (contra qualquer defeito de fabricação);
Material como cimento, areia e britas são fornecidos pelo cliente para chumbar.
Prazo de entrega 30 dias a partir da confirmação do pedido e pagamento da entrada.
${name || 'Comercial Krenke'} - Comercial
Krenke Brinquedos Pedagógicos - Matriz
${phone || '(47) 99755-1416'} - ${email || 'vendas@krenke.com.br'}
Guaramirim, ${today}`;
}

interface CartItem extends CalculatorProduct { qty: number }

interface ModelOption { value: string; label: string }
interface ModelGroup { label: string; options: ModelOption[] }

function formatBRL(val: number): string {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function generateQuoteNumber(): string {
  return `KR${Math.floor(100000 + Math.random() * 900000)}`;
}

function loadImageViaCanvas(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function getImageNaturalSize(base64: string): Promise<{ w: number; h: number }> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = base64;
  });
}

// ──────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────
const ProductCalculator: React.FC = () => {
  const { isSuperAdmin, profile, user } = useAuth();
  const [products, setProducts] = useState<CalculatorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quoteNumber, setQuoteNumber] = useState(generateQuoteNumber);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Orçamentos salvos (tabela orcamento_revendas)
  const [savedQuotes, setSavedQuotes] = useState<ResellerQuote[]>([]);
  const [quotesOpen, setQuotesOpen] = useState(false);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [savingQuote, setSavingQuote] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Model name (dropdown com playgrounds do catálogo + texto livre)
  const [modelName, setModelName] = useState('');
  const [modelOptions, setModelOptions] = useState<ModelGroup[]>([]);

  // Revendedor associado (dropdown com pesquisa; cadastro restrito à allowlist)
  const [associatedReseller, setAssociatedReseller] = useState('');
  const [associatedResellerOptions, setAssociatedResellerOptions] = useState<ModelOption[]>([]);
  const [creatingReseller, setCreatingReseller] = useState(false);

  // Client info
  const [clientName, setClientName] = useState('');
  const [clientCnpj, setClientCnpj] = useState('');
  const [clientNumber, setClientNumber] = useState('');
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState<string | null>(null);

  // Margin
  const [margin, setMargin] = useState(0);

  // Forma de pagamento: à vista concede 5% de desconto (sobre o total bruto,
  // antes do IPI); Entrada + 28 dias mantém preço cheio. Ambos têm IPI.
  const [paymentTerm, setPaymentTerm] = useState<'avista' | 'entrada'>('entrada');

  // Oculta preços unitários (tabela, carrinho e PDF) — mostra só os totais.
  const [hideUnitPrices, setHideUnitPrices] = useState(false);

  // Disclaimer
  const [useFullDisclaimer, setUseFullDisclaimer] = useState(false);
  const [disclaimerText, setDisclaimerText] = useState('');

  // Anexos de imagem do parque — SEMPRE locais à sessão, nunca vão pra tabela
  const [parkImages, setParkImages] = useState<string[]>([]);
  const parkImageInputRef = useRef<HTMLInputElement>(null);

  // Admin CRUD state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<Partial<CalculatorProduct>>({});
  const [addingNew, setAddingNew] = useState(false);
  const [newRow, setNewRow] = useState({ code: '', description: '', unit_price: '' });
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('calculator_products')
        .select('*')
        .eq('active', true)
        .order('description');
      if (err) throw err;
      setProducts(data || []);
    } catch (e: any) {
      setError('Erro ao carregar produtos: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Opções do dropdown de modelo: catálogo público, agrupado por categoria.
  // Falha silenciosa — sem opções o campo continua aceitando texto livre.
  const loadModelOptions = async () => {
    try {
      const { data, error: err } = await supabase
        .from('products')
        .select('name, category')
        .order('name');
      if (err) throw err;

      const groups: Record<string, ModelOption[]> = {};
      ((data || []) as { name: string | null; category: string | null }[]).forEach(p => {
        if (!p.name) return;
        const cat = p.category || 'Outros';
        (groups[cat] ||= []).push({ value: p.name, label: p.name });
      });

      setModelOptions(
        Object.entries(groups)
          .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
          .map(([label, options]) => ({ label, options }))
      );
    } catch {
      setModelOptions([]);
    }
  };

  // Opções do dropdown "Revendedor Associado". Falha silenciosa — sem
  // opções o dropdown fica vazio (não bloqueia o resto da calculadora).
  const loadAssociatedResellers = async () => {
    try {
      const { data, error: err } = await supabase
        .from('associated_resellers')
        .select('name')
        .order('name');
      if (err) throw err;
      setAssociatedResellerOptions(
        ((data || []) as { name: string }[]).map(r => ({ value: r.name, label: r.name }))
      );
    } catch {
      setAssociatedResellerOptions([]);
    }
  };

  const canRegisterResellers = isSuperAdmin || (!!user && ASSOCIATED_RESELLER_MANAGERS.has(user.id));

  const handleCreateAssociatedReseller = async (inputValue: string) => {
    const name = inputValue.trim();
    if (!name || !user) return;
    setCreatingReseller(true);
    try {
      const { data, error: err } = await supabase
        .from('associated_resellers')
        .insert({ name, created_by: user.id })
        .select('name')
        .single();
      if (err) throw err;
      setAssociatedResellerOptions(prev =>
        [...prev, { value: data.name, label: data.name }].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
      );
      setAssociatedReseller(data.name);
    } catch (e: any) {
      alert('Erro ao cadastrar revenda: ' + e.message);
    } finally {
      setCreatingReseller(false);
    }
  };

  useEffect(() => { loadProducts(); loadModelOptions(); loadAssociatedResellers(); }, []);

  // Pre-fill disclaimer when toggled on or when profile loads
  useEffect(() => {
    if (useFullDisclaimer) {
      setDisclaimerText(
        buildFullDisclaimer(profile?.full_name || '', profile?.phone || '', user?.email || '')
      );
    }
  }, [useFullDisclaimer, profile, user]);

  const filtered = useMemo(() =>
    products.filter(p =>
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.code.includes(search)
    ), [products, search]);

  const cartMap = useMemo(() => {
    const m: Record<string, CartItem> = {};
    cart.forEach(item => { m[item.id] = item; });
    return m;
  }, [cart]);

  const setQty = (product: CalculatorProduct, qty: number) => {
    const q = Math.max(0, qty);
    if (q === 0) {
      setCart(prev => prev.filter(i => i.id !== product.id));
    } else {
      setCart(prev => {
        const existing = prev.find(i => i.id === product.id);
        if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: q } : i);
        return [...prev, { ...product, qty: q }];
      });
    }
  };

  // Margem sobre o preço de venda (não markup sobre o custo): margem 20%
  // sobre custo R$100 → venda R$125 (lucro R$25 = 20% de R$125, bate com o
  // que foi digitado). Fórmula: venda = custo / (1 - margem/100).
  const marginMult = margin > 0 ? 1 / (1 - Math.min(margin, MAX_MARGIN) / 100) : 1;
  const effectivePrice = (p: number) => p * marginMult;

  const totalBruto = useMemo(() => cart.reduce((s, i) => s + effectivePrice(i.unit_price) * i.qty, 0), [cart, margin]);
  const totalIPI = totalBruto * IPI_RATE;
  // À vista: 5% de desconto sobre o total bruto (não incide sobre o IPI).
  // Entrada + 28 dias: sem desconto. Os dois pagam IPI integral.
  const avistaDiscount = paymentTerm === 'avista' ? totalBruto * AVISTA_DISCOUNT_RATE : 0;
  const totalComIPI = totalBruto - avistaDiscount + totalIPI;

  // ── CNPJ lookup ────────────────────────────────────
  const lookupCnpj = async (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length !== 14) return;
    setCnpjLoading(true);
    setCnpjError(null);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
      if (!res.ok) throw new Error('CNPJ não encontrado');
      const data = await res.json();
      const formatted = digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      setClientCnpj(formatted);
      if (!clientName) setClientName(data.razao_social || '');
    } catch {
      setCnpjError('CNPJ não encontrado');
    } finally {
      setCnpjLoading(false);
    }
  };

  // ── Anexos de imagem (máx. 5, apenas locais — nunca persistidos) ──
  const handleParkImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const valid = files.filter(f => ['image/png', 'image/jpeg'].includes(f.type));
    if (valid.length < files.length) alert('Apenas PNG ou JPG aceitos — arquivos inválidos ignorados.');

    const free = MAX_PARK_IMAGES - parkImages.length;
    if (free <= 0) {
      alert(`Limite de ${MAX_PARK_IMAGES} imagens atingido.`);
      return;
    }
    const toAdd = valid.slice(0, free);
    if (valid.length > free) alert(`Só cabem mais ${free} imagem(ns) — o excedente foi ignorado.`);

    Promise.all(toAdd.map(file => new Promise<string>(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    }))).then(b64s => setParkImages(prev => [...prev, ...b64s].slice(0, MAX_PARK_IMAGES)));

    // permite reanexar o mesmo arquivo depois de remover
    if (parkImageInputRef.current) parkImageInputRef.current.value = '';
  };

  const removeParkImage = (idx: number) =>
    setParkImages(prev => prev.filter((_, i) => i !== idx));

  // ── PDF generation ─────────────────────────────────
  const generatePDF = async () => {
    if (cart.length === 0) return;
    if (!clientName.trim()) {
      alert('Informe o Nome do Cliente antes de exportar o PDF.');
      return;
    }
    setGeneratingPDF(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = 210;
      const margin = 14;
      const contentW = pageW - margin * 2;

      const responsibleName = profile?.full_name || user?.email || '';

      // ── Header background
      doc.setFillColor(49, 39, 131);
      doc.rect(0, 0, pageW, 38, 'F');

      // ── Logo (fetched via canvas, aspect ratio preserved)
      try {
        const logoB64 = await loadImageViaCanvas(LOGO_URL);
        const { w: lW, h: lH } = await getImageNaturalSize(logoB64);
        const maxLW = 54, maxLH = 28;
        const lRatio = lW / lH;
        let drawW = maxLW, drawH = drawW / lRatio;
        if (drawH > maxLH) { drawH = maxLH; drawW = drawH * lRatio; }
        const logoY = 5 + (maxLH - drawH) / 2;
        doc.addImage(logoB64, 'PNG', margin, logoY, drawW, drawH, undefined, 'FAST');
      } catch {
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('KRENKE', margin, 22);
      }

      // ── Quote number + date (top right)
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`Cotação: ${quoteNumber}`, pageW - margin, 16, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(
        new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
        pageW - margin, 23, { align: 'right' }
      );

      // ── Client info block (left side, below header)
      let clientBlockEndY = 40;
      const hasClientInfo = clientName || clientCnpj || clientNumber;
      if (hasClientInfo || responsibleName) {
        let cy = 44;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 100, 120);

        if (clientName) {
          doc.text('CLIENTE:', margin, cy);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(40, 40, 60);
          doc.text(clientName, margin + 18, cy);
          cy += 5;
        }
        if (clientCnpj) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(100, 100, 120);
          doc.text('CNPJ:', margin, cy);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(40, 40, 60);
          doc.text(clientCnpj, margin + 18, cy);
          cy += 5;
        }
        if (clientNumber) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(100, 100, 120);
          doc.text('Nº CLIENTE:', margin, cy);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(40, 40, 60);
          doc.text(clientNumber, margin + 22, cy);
          cy += 5;
        }
        if (responsibleName) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(100, 100, 120);
          doc.text('ELABORADO POR:', margin, cy);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(40, 40, 60);
          doc.text(responsibleName, margin + 30, cy);
          cy += 5;
        }
        clientBlockEndY = cy + 2;
      }

      // ── Subtitle strip
      const subtitleY = clientBlockEndY;
      doc.setFillColor(240, 239, 248);
      doc.rect(0, subtitleY - 2, pageW, 10, 'F');
      doc.setTextColor(49, 39, 131);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('PROPOSTA COMERCIAL — TABELA DE PRODUTOS', margin, subtitleY + 5);

      // ── Table
      let y = subtitleY + 14;

      doc.setFillColor(49, 39, 131);
      doc.rect(margin, y, contentW, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('CÓD.', margin + 2, y + 5.5);
      doc.text('DESCRIÇÃO', margin + 22, y + 5.5);
      doc.text('QTD', margin + contentW - 66, y + 5.5, { align: 'right' });
      if (!hideUnitPrices) {
        doc.text('VL. UNIT.', margin + contentW - 40, y + 5.5, { align: 'right' });
        doc.text('SUBTOTAL', margin + contentW, y + 5.5, { align: 'right' });
      }
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);

      cart.forEach((item, idx) => {
        if (y > 265) { doc.addPage(); y = 16; }
        doc.setFillColor(idx % 2 === 0 ? 255 : 249, idx % 2 === 0 ? 255 : 249, idx % 2 === 0 ? 255 : 253);
        doc.rect(margin, y, contentW, 7.5, 'F');
        doc.setTextColor(70, 70, 70);
        const ep = item.unit_price * marginMult;
        doc.text(item.code, margin + 2, y + 5);
        const desc = item.description.length > 60 ? item.description.substring(0, 57) + '...' : item.description;
        doc.text(desc, margin + 22, y + 5);
        doc.text(String(item.qty), margin + contentW - 66, y + 5, { align: 'right' });
        if (!hideUnitPrices) {
          doc.text(formatBRL(ep), margin + contentW - 40, y + 5, { align: 'right' });
          doc.text(formatBRL(ep * item.qty), margin + contentW, y + 5, { align: 'right' });
        }
        y += 7.5;
      });

      // ── Totals
      y += 5;
      if (y > 258) { doc.addPage(); y = 16; }

      doc.setDrawColor(200, 200, 215);
      doc.setLineWidth(0.3);
      doc.line(margin + contentW / 2, y, margin + contentW, y);
      y += 6;

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text('Total Bruto:', margin + contentW - 40, y, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(49, 39, 131);
      doc.text(formatBRL(totalBruto), margin + contentW, y, { align: 'right' });
      y += 7;

      if (avistaDiscount > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(`Desconto à vista (${(AVISTA_DISCOUNT_RATE * 100).toFixed(0)}%):`, margin + contentW - 40, y, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 130, 60);
        doc.text(`−${formatBRL(avistaDiscount)}`, margin + contentW, y, { align: 'right' });
        y += 7;
      }

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(`IPI (${(IPI_RATE * 100).toFixed(1)}%):`, margin + contentW - 40, y, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text(formatBRL(totalIPI), margin + contentW, y, { align: 'right' });
      y += 4;

      doc.setFillColor(49, 39, 131);
      doc.roundedRect(margin + contentW / 2 - 2, y, contentW / 2 + 2, 11, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(
        paymentTerm === 'avista' ? 'Total à Vista:' : 'Total Ent.+28d:',
        margin + contentW - 40, y + 7.5, { align: 'right' }
      );
      doc.text(formatBRL(totalComIPI), margin + contentW - 1, y + 7.5, { align: 'right' });
      y += 17;

      // ── Disclaimer
      if (y > 270) { doc.addPage(); y = 16; }
      const disclaimerLines = (useFullDisclaimer ? disclaimerText : DEFAULT_DISCLAIMER).split('\n');
      doc.setFontSize(6.5);
      doc.setFont('helvetica', useFullDisclaimer ? 'normal' : 'italic');
      doc.setTextColor(useFullDisclaimer ? 80 : 160, useFullDisclaimer ? 80 : 160, useFullDisclaimer ? 80 : 160);
      for (const line of disclaimerLines) {
        if (y > 278) { doc.addPage(); y = 16; }
        doc.text(line, margin, y);
        y += 4;
      }

      // ── Imagens de referência (todas juntas, sempre no fim da última página)
      if (parkImages.length > 0) {
        y += 4;
        if (y > 230) { doc.addPage(); y = 16; }

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(49, 39, 131);
        doc.text('IMAGENS DE REFERÊNCIA', margin, y);
        y += 6;

        const cellW = (contentW - 6) / 2;   // 2 colunas + 6mm de gutter
        const cellH = 48;
        let col = 0;
        let rowTopY = y;

        for (const img of parkImages) {
          if (col === 0 && rowTopY + cellH > 275) { doc.addPage(); rowTopY = 16; }

          const { w: natW, h: natH } = await getImageNaturalSize(img);
          const ratio = natW / natH;
          let iw = cellW, ih = iw / ratio;
          if (ih > cellH) { ih = cellH; iw = ih * ratio; }

          const cellX = margin + col * (cellW + 6);
          doc.addImage(img, cellX + (cellW - iw) / 2, rowTopY + (cellH - ih) / 2, iw, ih);

          col++;
          if (col === 2) { col = 0; rowTopY += cellH + 6; }
        }
      }

      // ── Page footers
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(49, 39, 131);
        doc.rect(0, 287, pageW, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.text(`${quoteNumber}  •  ${new Date().toLocaleDateString('pt-BR')}`, margin, 293);
        doc.text(`Pág. ${i} / ${pageCount}`, pageW - margin, 293, { align: 'right' });
      }

      doc.save(`${quoteNumber}.pdf`);
    } finally {
      setGeneratingPDF(false);
    }
  };

  // ── Orçamentos salvos (orcamento_revendas) ─────────
  // Nada de imagem aqui: a tabela guarda só dados do orçamento.
  const loadSavedQuotes = async () => {
    if (!user) return;
    setLoadingQuotes(true);
    try {
      const { data, error: err } = await supabase
        .from('orcamento_revendas')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(50);
      if (err) throw err;
      setSavedQuotes((data || []) as ResellerQuote[]);
    } catch (e: any) {
      alert('Erro ao carregar orçamentos: ' + e.message);
    } finally {
      setLoadingQuotes(false);
    }
  };

  /**
   * CSV com 1 linha por item — mesmo padrão do relatório admin (BOM + ';'
   * pra abrir certo, acentuado, no Excel pt-BR). Uma linha por item (não por
   * orçamento) pra já vir pronto pra somar/filtrar na planilha sem precisar
   * abrir cada PDF. `quotes` com 1 item só = export do orçamento selecionado;
   * lista inteira = export de todos os orçamentos salvos.
   */
  const exportQuotesCsv = (quotes: ResellerQuote[], filename: string) => {
    const head = [
      'Nº Orçamento', 'Data', 'Cliente', 'CNPJ/CPF', 'Nº Cliente', 'Modelo',
      'Revendedor Associado', 'Forma de Pagamento', 'Margem (%)',
      'Código do Produto', 'Descrição do Produto', 'Qtd', 'Preço Unit.', 'Subtotal Item',
      'Total do Orçamento (c/ IPI)',
    ];
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const num2 = (v: number) => v.toFixed(2).replace('.', ',');
    const paymentLabel = (p: string | null) => p === 'avista' ? 'À Vista' : 'Entrada + 28 Dias';

    const rows: string[] = [];
    quotes.forEach(q => {
      const date = new Date(q.updated_at).toLocaleString('pt-BR');
      const base = [
        q.quote_number,
        date,
        q.client_name || '',
        q.client_cnpj || '',
        q.client_number || '',
        q.model_name || '',
        q.associated_reseller_name || '',
        paymentLabel(q.payment_term),
        num2(Number(q.margin) || 0),
      ];
      const items = q.items && q.items.length > 0 ? q.items : [null];
      items.forEach(item => {
        rows.push([
          ...base,
          item?.code || '',
          item?.description || '(sem itens)',
          item ? item.qty : '',
          item ? num2(Number(item.unit_price) || 0) : '',
          item ? num2((Number(item.unit_price) || 0) * (Number(item.qty) || 0)) : '',
          num2(Number(q.total_com_ipi) || 0),
        ].map(esc).join(';'));
      });
    });

    // BOM + ';' → abre certo no Excel pt-BR
    const blob = new Blob(['﻿' + [head.map(esc).join(';'), ...rows].join('\r\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSavedQuotesCsv = () =>
    exportQuotesCsv(savedQuotes, `orcamentos-${new Date().toISOString().slice(0, 10)}.csv`);

  const exportSingleQuoteCsv = (q: ResellerQuote, e: React.MouseEvent) => {
    e.stopPropagation(); // não abre/carrega o orçamento ao clicar em exportar
    exportQuotesCsv([q], `orcamento-${q.quote_number}.csv`);
  };

  const handleSaveQuote = async () => {
    if (!user || cart.length === 0) return;
    if (!clientName.trim()) {
      alert('Informe o Nome do Cliente antes de salvar o orçamento.');
      return;
    }
    setSavingQuote(true);
    try {
      const items: QuoteItem[] = cart.map(i => ({
        code: i.code,
        description: i.description,
        unit_price: i.unit_price,
        qty: i.qty,
      }));

      const { error: err } = await supabase
        .from('orcamento_revendas')
        .upsert({
          quote_number: quoteNumber,
          user_id: user.id,
          reseller_name: profile?.full_name || user.email || null,
          associated_reseller_name: associatedReseller || null,
          model_name: modelName || null,
          client_name: clientName || null,
          client_cnpj: clientCnpj || null,
          client_number: clientNumber || null,
          margin,
          payment_term: paymentTerm,
          items,
          total_bruto: totalBruto,
          total_ipi: totalIPI,
          total_com_ipi: totalComIPI,
          use_full_disclaimer: useFullDisclaimer,
          disclaimer_text: useFullDisclaimer ? disclaimerText : null,
        }, { onConflict: 'quote_number' });
      if (err) throw err;

      setSavedAt(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      await loadSavedQuotes();
    } catch (e: any) {
      alert('Erro ao salvar orçamento: ' + e.message);
    } finally {
      setSavingQuote(false);
    }
  };

  /**
   * Repõe o orçamento na calculadora. Itens são reconciliados contra a
   * tabela atual — produto removido do catálogo é descartado, e o preço
   * exibido passa a ser o preço atual, não o congelado.
   *
   * O catálogo tem códigos duplicados entre variantes (ex.: "200565" é usado
   * por 4 telhados diferentes — roto chinês, roto sextavado, roto redondo,
   * redondo cone). Reconciliar só por `code` pega sempre a última variante
   * daquele código (ordem alfabética da query), trocando silenciosamente o
   * item pro produto errado ao reabrir o orçamento — ex.: telhado roto
   * redondo virando "roto sextavado" porque S vem depois na ordenação.
   * Por isso o match prioriza `code` + `description` exata; só cai pro
   * código sozinho quando ele é inequívoco (um único produto com esse
   * código) — caso contrário mantém os dados congelados do item salvo em
   * vez de arriscar resolver pro produto errado.
   */
  const handleLoadQuote = (quote: ResellerQuote) => {
    if (cart.length > 0 && quote.quote_number !== quoteNumber && !savedAt) {
      const ok = confirm('Você tem itens no orçamento atual que ainda não foram salvos. Ao carregar outro orçamento, esses itens serão perdidos. Deseja continuar?');
      if (!ok) return;
    }
    const byCode: Record<string, CalculatorProduct[]> = {};
    products.forEach(p => { (byCode[p.code] ||= []).push(p); });

    const restored: CartItem[] = [];
    const missing: string[] = [];
    const ambiguous: string[] = [];
    (quote.items || []).forEach(item => {
      const candidates = byCode[item.code];
      if (!candidates || candidates.length === 0) {
        missing.push(item.code);
        return;
      }
      const exact = candidates.find(p => p.description === item.description);
      if (exact) {
        restored.push({ ...exact, qty: item.qty });
      } else if (candidates.length === 1) {
        restored.push({ ...candidates[0], qty: item.qty });
      } else {
        // Código ambíguo e a descrição salva não bate com nenhuma variante
        // atual — mantém o item como estava no orçamento (preço congelado)
        // em vez de adivinhar qual das variantes é a certa.
        ambiguous.push(item.description);
        restored.push({
          id: `frozen-${item.code}-${restored.length}`,
          code: item.code,
          description: item.description,
          unit_price: item.unit_price,
          active: true,
          created_at: '',
          updated_at: '',
          qty: item.qty,
        });
      }
    });

    setQuoteNumber(quote.quote_number);
    setAssociatedReseller(quote.associated_reseller_name || '');
    setModelName(quote.model_name || '');
    setClientName(quote.client_name || '');
    setClientCnpj(quote.client_cnpj || '');
    setClientNumber(quote.client_number || '');
    setMargin(Number(quote.margin) || 0);
    setPaymentTerm(quote.payment_term === 'avista' ? 'avista' : 'entrada');
    setUseFullDisclaimer(quote.use_full_disclaimer);
    if (quote.disclaimer_text) setDisclaimerText(quote.disclaimer_text);
    setCart(restored);
    setParkImages([]); // imagens não são persistidas — precisam ser reanexadas
    setSavedAt(null);
    setQuotesOpen(false);

    if (missing.length > 0) {
      alert(
        `Orçamento carregado. ${missing.length} item(ns) não estão mais no catálogo e foram ignorados:\n` +
        missing.join(', ')
      );
    }
    if (ambiguous.length > 0) {
      alert(
        `Orçamento carregado. ${ambiguous.length} item(ns) têm código duplicado no catálogo — mantido o preço salvo no orçamento em vez do preço atual:\n` +
        ambiguous.join(', ')
      );
    }
  };

  const handleNewQuote = () => {
    if (cart.length > 0 && !savedAt) {
      const ok = confirm('Você tem itens no orçamento atual que ainda não foram salvos. Ao iniciar um novo orçamento, esses itens serão perdidos. Deseja continuar?');
      if (!ok) return;
    }
    setQuoteNumber(generateQuoteNumber());
    setCart([]);
    setAssociatedReseller('');
    setModelName('');
    setClientName('');
    setClientCnpj('');
    setClientNumber('');
    setMargin(0);
    setPaymentTerm('entrada');
    setParkImages([]);
    setSavedAt(null);
    setQuotesOpen(false);
  };

  // ── Admin: save edit ───────────────────────────────
  const handleSaveEdit = async (id: string) => {
    setSaving(true);
    try {
      const { error: err } = await supabase
        .from('calculator_products')
        .update({
          code: editRow.code,
          description: editRow.description,
          unit_price: Number(editRow.unit_price),
        })
        .eq('id', id);
      if (err) throw err;
      setEditingId(null);
      await loadProducts();
    } catch (e: any) {
      alert('Erro ao salvar: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Desativar este produto da calculadora?')) return;
    await supabase.from('calculator_products').update({ active: false }).eq('id', id);
    await loadProducts();
  };

  const handleAddNew = async () => {
    if (!newRow.code || !newRow.description || !newRow.unit_price) {
      alert('Preencha todos os campos.');
      return;
    }
    setSaving(true);
    try {
      const { error: err } = await supabase
        .from('calculator_products')
        .insert({ code: newRow.code, description: newRow.description, unit_price: Number(newRow.unit_price) });
      if (err) throw err;
      setAddingNew(false);
      setNewRow({ code: '', description: '', unit_price: '' });
      await loadProducts();
    } catch (e: any) {
      alert('Erro ao adicionar: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ──────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="animate-spin text-[#312783]" size={44} />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4 text-center">
      <AlertCircle size={48} className="text-red-400" />
      <p className="text-red-500 font-bold">{error}</p>
      <button onClick={loadProducts} className="text-[#312783] font-bold underline">Tentar novamente</button>
    </div>
  );

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-[#312783] transition-all';
  const labelCls = 'text-xs font-black text-slate-500 uppercase tracking-wide mb-1 block';

  const modelSelectStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: '42px',
      borderRadius: '0.75rem',
      border: '1px solid #e2e8f0',
      fontWeight: 700,
      fontSize: '0.875rem',
      boxShadow: 'none',
      '&:hover': { borderColor: '#312783' },
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? '#312783' : state.isFocused ? '#f0eff8' : 'white',
      color: state.isSelected ? 'white' : '#1e293b',
      fontWeight: 700,
      fontSize: '0.8125rem',
    }),
    groupHeading: (base: any) => ({
      ...base,
      color: '#312783',
      fontWeight: 900,
      fontSize: '0.6875rem',
      letterSpacing: '0.05em',
    }),
    placeholder: (base: any) => ({ ...base, color: '#94a3b8', fontWeight: 700, fontSize: '0.875rem' }),
    menuPortal: (base: any) => ({ ...base, zIndex: 60 }),
  };

  return (
    <div className="space-y-8">
      {/* ── Top bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-black text-[#312783]">Calculadora de Produtos</h2>
          <p className="text-slate-400 font-bold text-sm mt-1">
            Cotação: <span className="text-[#312783]">{quoteNumber}</span> • IPI {(IPI_RATE * 100).toFixed(1)}%
            {profile?.full_name && <span className="ml-2">• {profile.full_name}</span>}
            {savedAt && <span className="ml-2 text-green-600">• salvo {savedAt}</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => { setQuotesOpen(true); loadSavedQuotes(); }}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-2xl font-bold text-sm hover:border-[#312783] hover:text-[#312783] transition-all shadow-sm"
          >
            <HistoryIcon size={16} /> Orçamentos
          </button>
          <button
            onClick={handleNewQuote}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-2xl font-bold text-sm hover:border-[#312783] hover:text-[#312783] transition-all shadow-sm"
          >
            <FilePlus size={16} /> Novo
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => { setAddingNew(true); setEditingId(null); }}
              className="flex items-center gap-2 bg-white border-2 border-[#312783] text-[#312783] px-4 py-2.5 rounded-2xl font-bold text-sm hover:bg-[#312783] hover:text-white transition-all"
            >
              <Plus size={16} /> Novo Produto
            </button>
          )}
          <div className="relative flex-1 min-w-[220px] lg:w-80 lg:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou código..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-[#312783] transition-all shadow-sm font-bold text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Modal: orçamentos salvos */}
      {quotesOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setQuotesOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
              <HistoryIcon size={18} className="text-[#312783]" />
              <span className="font-black text-slate-700">Orçamentos salvos</span>
              <button
                onClick={exportSavedQuotesCsv}
                disabled={savedQuotes.length === 0}
                className="ml-auto flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl font-bold text-xs hover:border-[#312783] hover:text-[#312783] disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all"
              >
                <Download size={14} /> Exportar CSV
              </button>
              <button onClick={() => setQuotesOpen(false)} className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              {loadingQuotes ? (
                <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#312783]" size={32} /></div>
              ) : savedQuotes.length === 0 ? (
                <p className="text-center text-slate-400 font-bold py-16">Nenhum orçamento salvo ainda.</p>
              ) : (
                <div className="space-y-2">
                  {savedQuotes.map(q => (
                    <div
                      key={q.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleLoadQuote(q)}
                      onKeyDown={e => { if (e.key === 'Enter') handleLoadQuote(q); }}
                      className="w-full text-left rounded-2xl border border-slate-100 px-4 py-3 hover:border-[#312783] hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-black text-[#312783] text-sm tabular-nums shrink-0">{q.quote_number}</span>
                        <span className="font-black text-slate-800 text-sm min-w-0 flex-1 truncate">
                          Cliente: {q.client_name || '— sem cliente informado —'}
                        </span>
                        <span className="text-sm font-black text-slate-700 tabular-nums shrink-0">{formatBRL(Number(q.total_com_ipi))}</span>
                        <button
                          onClick={e => exportSingleQuoteCsv(q, e)}
                          title="Exportar este orçamento em CSV"
                          className="shrink-0 flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-500 px-2.5 py-1 rounded-lg font-bold text-xs hover:border-[#312783] hover:text-[#312783] hover:bg-white transition-all"
                        >
                          <Download size={12} /> CSV
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs font-bold text-slate-400">
                        {q.model_name && <span className="truncate max-w-[200px]">Modelo: {q.model_name}</span>}
                        <span className="truncate max-w-[160px]">Vendedor: {q.reseller_name || '—'}</span>
                        <span className="tabular-nums sm:ml-auto">
                          {new Date(q.updated_at).toLocaleString('pt-BR', {
                            day: '2-digit', month: '2-digit', year: '2-digit',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-400 font-bold">
                Imagens não são armazenadas — ao carregar um orçamento, reanexe os arquivos antes de exportar o PDF.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* ── Product table */}
        <div className="xl:col-span-7 xl:self-start bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Package size={18} className="text-[#312783]" />
            <span className="font-black text-slate-700">Tabela de Produtos</span>
            <span className="ml-auto text-xs text-slate-400 font-bold">{filtered.length} itens</span>
          </div>

          {isSuperAdmin && addingNew && (
            <div className="flex items-center gap-2 px-6 py-3 bg-blue-50 border-b border-blue-100">
              <input
                className="w-24 px-2 py-1.5 rounded-xl border border-blue-200 text-xs font-bold outline-none"
                placeholder="Código"
                value={newRow.code}
                onChange={e => setNewRow(p => ({ ...p, code: e.target.value }))}
              />
              <input
                className="flex-1 px-2 py-1.5 rounded-xl border border-blue-200 text-xs font-bold outline-none"
                placeholder="Descrição"
                value={newRow.description}
                onChange={e => setNewRow(p => ({ ...p, description: e.target.value }))}
              />
              <input
                type="number"
                className="w-28 px-2 py-1.5 rounded-xl border border-blue-200 text-xs font-bold outline-none"
                placeholder="Preço (R$)"
                value={newRow.unit_price}
                onChange={e => setNewRow(p => ({ ...p, unit_price: e.target.value }))}
              />
              <button onClick={handleAddNew} disabled={saving} className="p-1.5 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              </button>
              <button onClick={() => setAddingNew(false)} className="p-1.5 rounded-xl bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="divide-y divide-slate-50 max-h-[75vh] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-20 text-center text-slate-400 font-bold">Nenhum produto encontrado.</div>
            ) : filtered.map(product => {
              const cartItem = cartMap[product.id];
              const qty = cartItem?.qty ?? 0;
              const isEditing = editingId === product.id;

              if (isEditing && isSuperAdmin) {
                return (
                  <div key={product.id} className="flex items-center gap-2 px-6 py-2.5 bg-yellow-50">
                    <input
                      className="w-24 px-2 py-1.5 rounded-xl border border-yellow-300 text-xs font-bold outline-none"
                      value={editRow.code || ''}
                      onChange={e => setEditRow(p => ({ ...p, code: e.target.value }))}
                    />
                    <input
                      className="flex-1 px-2 py-1.5 rounded-xl border border-yellow-300 text-xs font-bold outline-none"
                      value={editRow.description || ''}
                      onChange={e => setEditRow(p => ({ ...p, description: e.target.value }))}
                    />
                    <input
                      type="number"
                      className="w-28 px-2 py-1.5 rounded-xl border border-yellow-300 text-xs font-bold outline-none"
                      value={editRow.unit_price || ''}
                      onChange={e => setEditRow(p => ({ ...p, unit_price: Number(e.target.value) }))}
                    />
                    <button onClick={() => handleSaveEdit(product.id)} disabled={saving} className="p-1.5 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors">
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 rounded-xl bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                );
              }

              return (
                <div key={product.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 text-sm leading-snug line-clamp-2 break-words" title={product.description}>{product.description}</p>
                    <p className="text-xs text-slate-400 font-bold mt-0.5">
                      Cód. {product.code}{!hideUnitPrices && ` • ${formatBRL(effectivePrice(product.unit_price))}`}
                    </p>
                  </div>

                  {isSuperAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => { setEditingId(product.id); setEditRow(product); setAddingNew(false); }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-[#312783] hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setQty(product, qty - 1)}
                      className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-base flex items-center justify-center transition-colors"
                    >−</button>
                    <input
                      type="number"
                      min={0}
                      value={qty === 0 ? '' : qty}
                      placeholder="0"
                      onChange={e => setQty(product, parseInt(e.target.value) || 0)}
                      className="w-12 text-center font-black text-slate-900 text-sm rounded-xl border-2 border-slate-200 focus:border-[#312783] outline-none py-1 transition-all"
                    />
                    <button
                      onClick={() => setQty(product, qty + 1)}
                      className="w-7 h-7 rounded-xl bg-[#312783] hover:bg-[#3f31a1] text-white font-black text-base flex items-center justify-center transition-colors"
                    >+</button>
                  </div>

                  {qty > 0 && !hideUnitPrices && (
                    <div className="w-24 text-right shrink-0">
                      <p className="text-sm font-black text-[#312783] tabular-nums">{formatBRL(effectivePrice(product.unit_price) * qty)}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right panel */}
        <div className="xl:col-span-5 space-y-5">

          {/* Client info */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <User size={18} className="text-[#312783]" />
              <span className="font-black text-slate-700">Dados do Cliente</span>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Revendedor Associado</label>
                <CreatableSelect
                  isClearable
                  isLoading={creatingReseller}
                  isDisabled={creatingReseller}
                  options={associatedResellerOptions}
                  value={associatedReseller ? { value: associatedReseller, label: associatedReseller } : null}
                  onChange={opt => setAssociatedReseller(opt?.value ?? '')}
                  onCreateOption={handleCreateAssociatedReseller}
                  isValidNewOption={input => canRegisterResellers && input.trim().length > 0}
                  placeholder="Selecione a revenda"
                  noOptionsMessage={() => canRegisterResellers ? 'Digite para cadastrar uma nova revenda' : 'Nenhuma revenda cadastrada'}
                  formatCreateLabel={v => `Cadastrar "${v}"`}
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  styles={modelSelectStyles}
                />
              </div>
              <div>
                <label className={labelCls}>Nome do Modelo</label>
                <CreatableSelect
                  isClearable
                  options={modelOptions}
                  value={modelName ? { value: modelName, label: modelName } : null}
                  onChange={opt => setModelName(opt?.value ?? '')}
                  placeholder="Selecione ou digite o nome do modelo"
                  noOptionsMessage={() => 'Digite para criar um nome personalizado'}
                  formatCreateLabel={v => `Usar "${v}"`}
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  styles={modelSelectStyles}
                />
              </div>
              <div>
                <label className={labelCls}>Nome do Cliente <span className="text-red-500">*obrigatório</span></label>
                <input
                  className={inputCls + (!clientName.trim() ? ' border-red-200' : '')}
                  placeholder="Razão social ou nome"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                />
                {!clientName.trim() && (
                  <p className="text-xs text-red-400 font-bold mt-1">
                    Preencha para poder salvar ou exportar o orçamento — é assim que ele aparece no histórico.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>CNPJ</label>
                  <div className="relative">
                    <input
                      className={inputCls + (cnpjError ? ' border-red-300' : '')}
                      placeholder="00.000.000/0001-00"
                      value={clientCnpj}
                      onChange={e => { setClientCnpj(e.target.value); setCnpjError(null); }}
                      onBlur={e => lookupCnpj(e.target.value)}
                    />
                    {cnpjLoading && (
                      <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#312783]" />
                    )}
                  </div>
                  {cnpjError && <p className="text-xs text-red-500 font-bold mt-1">{cnpjError}</p>}
                </div>
                <div>
                  <label className={labelCls}>Nº Cliente</label>
                  <input
                    className={inputCls}
                    placeholder="Ex: 10234"
                    value={clientNumber}
                    onChange={e => setClientNumber(e.target.value)}
                  />
                </div>
              </div>
              {profile?.full_name && (
                <p className="text-xs text-slate-400 font-bold pt-1">
                  Elaborado por: <span className="text-[#312783]">{profile.full_name}</span>
                </p>
              )}
            </div>
          </div>

          {/* Margin */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-6 py-4 flex items-center gap-4">
            <div className="flex-1">
              <label className={labelCls}>Margem</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={MAX_MARGIN}
                  step={0.5}
                  value={margin === 0 ? '' : margin}
                  placeholder="0"
                  onChange={e => setMargin(Math.min(MAX_MARGIN, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-full pr-8 pl-3 py-2.5 rounded-xl border border-slate-200 text-sm font-black outline-none focus:ring-2 focus:ring-[#312783] transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">%</span>
              </div>
            </div>
            {margin > 0 && (
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-400 font-bold">Multiplicador</p>
                <p className="text-sm font-black text-[#312783]">×{marginMult.toFixed(3)}</p>
              </div>
            )}
          </div>
          {margin === 0 && cart.length > 0 && (
            <p className="-mt-2 text-xs font-bold text-orange-500 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-2">
              ⚠ Margem zerada — os preços exibidos são o preço de custo, sem lucro. Confira antes de salvar/exportar.
            </p>
          )}

          {/* Forma de pagamento */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-6 py-4">
            <label className={labelCls}>Forma de Pagamento</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                type="button"
                onClick={() => setPaymentTerm('avista')}
                className={`rounded-xl px-3 py-2.5 text-sm font-black transition-all border-2 ${
                  paymentTerm === 'avista'
                    ? 'bg-[#312783] border-[#312783] text-white'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-[#312783] hover:text-[#312783]'
                }`}
              >
                À Vista
                <span className="block text-[10px] font-bold uppercase tracking-wide opacity-80">−5% + IPI</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentTerm('entrada')}
                className={`rounded-xl px-3 py-2.5 text-sm font-black transition-all border-2 ${
                  paymentTerm === 'entrada'
                    ? 'bg-[#312783] border-[#312783] text-white'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-[#312783] hover:text-[#312783]'
                }`}
              >
                Ent. + 28 Dias
                <span className="block text-[10px] font-bold uppercase tracking-wide opacity-80">valor cheio + IPI</span>
              </button>
            </div>
          </div>

          {/* Cart summary */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 flex-wrap">
              <Calculator size={18} className="text-[#312783] shrink-0" />
              <div className="min-w-0">
                <span className="font-black text-slate-700 block">Resumo</span>
                {modelName && (
                  <span className="text-xs font-bold text-slate-400 truncate block" title={modelName}>{modelName}</span>
                )}
              </div>
              <label className="ml-auto shrink-0 flex items-center gap-1.5 text-xs font-bold text-slate-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideUnitPrices}
                  onChange={e => setHideUnitPrices(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 accent-[#312783]"
                />
                Ocultar valores
              </label>
              {cart.length > 0 && (
                <button
                  onClick={() => { if (confirm('Remover todos os itens do carrinho? Esta ação não pode ser desfeita.')) setCart([]); }}
                  className="ml-auto shrink-0 text-xs text-red-400 hover:text-red-600 font-bold flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={12} /> Limpar
                </button>
              )}
            </div>
            <div className="p-6 space-y-4">
              {cart.length === 0 ? (
                <p className="text-slate-400 font-bold text-sm text-center py-8">Nenhum produto selecionado.</p>
              ) : (
                <>
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-2 -mr-1">
                    {cart.map(item => (
                      <div key={item.id} className="rounded-xl bg-slate-50/70 px-3 py-2.5">
                        <p className="text-[13px] font-black text-slate-700 leading-snug break-words" title={item.description}>
                          {item.description}
                        </p>
                        <div className="flex justify-between items-baseline gap-2 mt-1">
                          <span className="text-xs text-slate-400 font-bold">
                            {hideUnitPrices ? `${item.qty} un.` : `${item.qty}× ${formatBRL(effectivePrice(item.unit_price))}`}
                          </span>
                          {!hideUnitPrices && (
                            <span className="text-sm font-black text-[#312783] shrink-0 tabular-nums">
                              {formatBRL(effectivePrice(item.unit_price) * item.qty)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 pt-4 space-y-2.5">
                    <div className="flex justify-between items-baseline gap-3">
                      <span className="text-sm font-bold text-slate-500 min-w-0 break-words">Total Bruto</span>
                      <span className="font-black text-slate-800 shrink-0 tabular-nums">{formatBRL(totalBruto)}</span>
                    </div>
                    {avistaDiscount > 0 && (
                      <div className="flex justify-between items-baseline gap-3">
                        <span className="text-sm font-bold text-green-600 min-w-0 break-words">Desconto à vista ({(AVISTA_DISCOUNT_RATE * 100).toFixed(0)}%)</span>
                        <span className="font-bold text-green-600 shrink-0 tabular-nums">−{formatBRL(avistaDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline gap-3">
                      <span className="text-sm font-bold text-slate-500 min-w-0 break-words">IPI ({(IPI_RATE * 100).toFixed(1)}%)</span>
                      <span className="font-bold text-slate-600 shrink-0 tabular-nums">{formatBRL(totalIPI)}</span>
                    </div>
                    <div className="bg-[#312783] rounded-2xl px-4 py-3.5 flex justify-between items-baseline gap-3">
                      <span className="text-sm font-black text-white/80 min-w-0 break-words">Total com IPI</span>
                      <span className="font-black text-white text-lg leading-none shrink-0 tabular-nums">{formatBRL(totalComIPI)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setUseFullDisclaimer(v => !v)}
              className="w-full px-6 py-4 flex items-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <FileText size={18} className="text-[#312783]" />
              <span className="font-black text-slate-700">Observações / Disclaimer</span>
              <span className={`ml-auto text-xs font-black px-2.5 py-1 rounded-full transition-colors ${useFullDisclaimer ? 'bg-[#312783] text-white' : 'bg-slate-100 text-slate-500'}`}>
                {useFullDisclaimer ? 'Completo' : 'Padrão'}
              </span>
              {useFullDisclaimer ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {useFullDisclaimer && (
              <div className="px-6 pb-6">
                <p className="text-xs text-slate-400 font-bold mb-2">Edite o texto que será incluído no PDF:</p>
                <textarea
                  className="w-full text-xs font-mono border border-slate-200 rounded-2xl p-3 outline-none focus:ring-2 focus:ring-[#312783] transition-all resize-none"
                  rows={12}
                  value={disclaimerText}
                  onChange={e => setDisclaimerText(e.target.value)}
                />
              </div>
            )}
            {!useFullDisclaimer && (
              <div className="px-6 pb-4">
                <p className="text-xs text-slate-400 font-bold italic">
                  "Esta cotação é válida por 30 dias. Preços sujeitos a alteração sem aviso prévio..."
                </p>
              </div>
            )}
          </div>

          {/* Anexos de imagem — locais à sessão, nunca persistidos */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <ImageIcon size={18} className="text-[#312783]" />
              <span className="font-black text-slate-700">Imagens do Parque</span>
              <span className="text-xs text-slate-400 font-bold ml-auto tabular-nums">
                {parkImages.length}/{MAX_PARK_IMAGES}
              </span>
            </div>
            <div className="p-6 space-y-3">
              {parkImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {parkImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} className="w-full h-28 object-cover rounded-2xl border border-slate-100" />
                      {idx === 0 && (
                        <span className="absolute bottom-2 left-2 text-[10px] font-black uppercase tracking-wide bg-[#312783] text-white px-2 py-0.5 rounded-full">
                          Capa
                        </span>
                      )}
                      <button
                        onClick={() => removeParkImage(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-red-600 transition-all"
                        aria-label={`Remover imagem ${idx + 1}`}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {parkImages.length < MAX_PARK_IMAGES && (
                <label className="flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-[#312783] hover:bg-slate-50 transition-all">
                  <ImagePlus size={26} className="text-slate-300" />
                  <span className="text-sm font-bold text-slate-400">
                    {parkImages.length === 0 ? 'Clique para anexar imagens' : 'Adicionar mais'}
                  </span>
                  <span className="text-xs text-slate-300 font-bold">PNG ou JPG • múltiplas</span>
                  <input
                    ref={parkImageInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={handleParkImage}
                  />
                </label>
              )}

              <p className="text-xs text-slate-400 font-bold">
                Todas as imagens vão juntas, em grade, no fim do PDF.
                Anexos não são salvos junto ao orçamento.
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="space-y-3">
            <button
              onClick={handleSaveQuote}
              disabled={cart.length === 0 || savingQuote}
              className="w-full flex items-center justify-center gap-3 bg-[#312783] text-white font-black py-3.5 rounded-2xl hover:bg-[#3f31a1] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {savingQuote ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {savingQuote ? 'Salvando...' : 'Salvar Orçamento'}
            </button>

            <button
              onClick={generatePDF}
              disabled={cart.length === 0 || generatingPDF}
              className="w-full flex items-center justify-center gap-3 bg-krenke-orange text-white font-black py-4 rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-orange-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FileDown size={20} />
              {generatingPDF ? 'Gerando PDF...' : `Exportar ${quoteNumber}.pdf`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCalculator;
