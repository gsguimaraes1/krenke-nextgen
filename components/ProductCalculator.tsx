import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, FileDown, Trash2, Calculator, Package, AlertCircle,
  Plus, Edit2, Check, X, Loader2, ImagePlus, Image as ImageIcon
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { CalculatorProduct } from '../types';

const IPI_RATE = 0.065;
const LOGO_URL = 'https://cdn.awsli.com.br/2185/2185627/arquivos/krenke-brinquedos-logo-branco-d__fogmt.webp';

interface CartItem extends CalculatorProduct { qty: number }

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
  const { isSuperAdmin } = useAuth();
  const [products, setProducts] = useState<CalculatorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quoteNumber] = useState(generateQuoteNumber);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Park image attachment (not saved to DB)
  const [parkImage, setParkImage] = useState<string | null>(null); // base64
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

  useEffect(() => { loadProducts(); }, []);

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

  const totalBruto = useMemo(() => cart.reduce((s, i) => s + i.unit_price * i.qty, 0), [cart]);
  const totalIPI = totalBruto * IPI_RATE;
  const totalComIPI = totalBruto + totalIPI;

  // ── Park image attachment ──────────────────────────
  const handleParkImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      alert('Apenas PNG ou JPG aceitos.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setParkImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ── PDF generation ─────────────────────────────────
  const generatePDF = async () => {
    if (cart.length === 0) return;
    setGeneratingPDF(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = 210;
      const margin = 14;
      const contentW = pageW - margin * 2;

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

      // ── Park image (right side, preserving aspect ratio)
      let imageEndY = 38;
      if (parkImage) {
        const maxW = 70;
        const maxH = 55;
        const { w: natW, h: natH } = await getImageNaturalSize(parkImage);
        const ratio = natW / natH;
        let imgW = maxW;
        let imgH = imgW / ratio;
        if (imgH > maxH) { imgH = maxH; imgW = imgH * ratio; }
        const imgX = pageW - margin - maxW + (maxW - imgW) / 2;
        const imgY = 42;
        doc.addImage(parkImage, imgX, imgY, imgW, imgH);
        imageEndY = imgY + imgH + 4;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(140, 140, 140);
        doc.text('Imagem de referência do parque', imgX + imgW / 2, imageEndY, { align: 'center' });
        imageEndY += 4;
      }

      // ── Subtitle strip
      const subtitleY = parkImage ? Math.max(42, imageEndY) : 40;
      doc.setFillColor(240, 239, 248);
      doc.rect(0, subtitleY - 2, parkImage ? pageW - margin - 74 : pageW, 10, 'F');
      doc.setTextColor(49, 39, 131);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('PROPOSTA COMERCIAL — TABELA DE PRODUTOS', margin, subtitleY + 5);

      // ── Table
      let y = (parkImage ? imageEndY + 6 : subtitleY + 14);

      doc.setFillColor(49, 39, 131);
      doc.rect(margin, y, contentW, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('CÓD.', margin + 2, y + 5.5);
      doc.text('DESCRIÇÃO', margin + 22, y + 5.5);
      doc.text('QTD', margin + contentW - 66, y + 5.5, { align: 'right' });
      doc.text('VL. UNIT.', margin + contentW - 40, y + 5.5, { align: 'right' });
      doc.text('SUBTOTAL', margin + contentW, y + 5.5, { align: 'right' });
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);

      cart.forEach((item, idx) => {
        if (y > 265) { doc.addPage(); y = 16; }
        doc.setFillColor(idx % 2 === 0 ? 255 : 249, idx % 2 === 0 ? 255 : 249, idx % 2 === 0 ? 255 : 253);
        doc.rect(margin, y, contentW, 7.5, 'F');
        doc.setTextColor(70, 70, 70);
        doc.text(item.code, margin + 2, y + 5);
        // truncate long descriptions
        const desc = item.description.length > 60 ? item.description.substring(0, 57) + '...' : item.description;
        doc.text(desc, margin + 22, y + 5);
        doc.text(String(item.qty), margin + contentW - 66, y + 5, { align: 'right' });
        doc.text(formatBRL(item.unit_price), margin + contentW - 40, y + 5, { align: 'right' });
        doc.text(formatBRL(item.unit_price * item.qty), margin + contentW, y + 5, { align: 'right' });
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
      doc.text('Total com IPI:', margin + contentW - 40, y + 7.5, { align: 'right' });
      doc.text(formatBRL(totalComIPI), margin + contentW - 1, y + 7.5, { align: 'right' });
      y += 17;

      // ── Footer note
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(160, 160, 160);
      doc.text('Esta cotação é válida por 30 dias. Preços sujeitos a alteração sem aviso prévio. IPI conforme legislação vigente.', margin, y);
      y += 4;
      doc.text('Krenke Brinquedos Pedagógicos  •  www.krenke.com.br', margin, y);

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

  return (
    <div className="space-y-8">
      {/* ── Top bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#312783]">Calculadora de Produtos</h2>
          <p className="text-slate-400 font-bold text-sm mt-1">
            Cotação: <span className="text-[#312783]">{quoteNumber}</span> • IPI {(IPI_RATE * 100).toFixed(1)}%
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {isSuperAdmin && (
            <button
              onClick={() => { setAddingNew(true); setEditingId(null); }}
              className="flex items-center gap-2 bg-white border-2 border-[#312783] text-[#312783] px-4 py-2.5 rounded-2xl font-bold text-sm hover:bg-[#312783] hover:text-white transition-all"
            >
              <Plus size={16} /> Novo Produto
            </button>
          )}
          <div className="relative flex-1 md:w-80">
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* ── Product table */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Package size={18} className="text-[#312783]" />
            <span className="font-black text-slate-700">Tabela de Produtos</span>
            <span className="ml-auto text-xs text-slate-400 font-bold">{filtered.length} itens</span>
          </div>

          {/* Add new row (admin) */}
          {isSuperAdmin && addingNew && (
            <div className="flex items-center gap-2 px-5 py-3 bg-blue-50 border-b border-blue-100">
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

          <div className="divide-y divide-slate-50 max-h-[580px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-20 text-center text-slate-400 font-bold">Nenhum produto encontrado.</div>
            ) : filtered.map(product => {
              const cartItem = cartMap[product.id];
              const qty = cartItem?.qty ?? 0;
              const isEditing = editingId === product.id;

              if (isEditing && isSuperAdmin) {
                return (
                  <div key={product.id} className="flex items-center gap-2 px-5 py-2.5 bg-yellow-50">
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
                <div key={product.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 text-sm leading-tight truncate">{product.description}</p>
                    <p className="text-xs text-slate-400 font-bold mt-0.5">
                      Cód. {product.code} • {formatBRL(product.unit_price)}
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

                  {qty > 0 && (
                    <div className="w-24 text-right shrink-0">
                      <p className="text-sm font-black text-[#312783]">{formatBRL(product.unit_price * qty)}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right panel: totals + image + export */}
        <div className="space-y-5">
          {/* Cart summary */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Calculator size={18} className="text-[#312783]" />
              <span className="font-black text-slate-700">Resumo</span>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="ml-auto text-xs text-red-400 hover:text-red-600 font-bold flex items-center gap-1 transition-colors">
                  <Trash2 size={12} /> Limpar
                </button>
              )}
            </div>
            <div className="p-5 space-y-3">
              {cart.length === 0 ? (
                <p className="text-slate-400 font-bold text-sm text-center py-8">Nenhum produto selecionado.</p>
              ) : (
                <>
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-slate-700 leading-tight line-clamp-2">{item.description}</p>
                          <p className="text-xs text-slate-400 font-bold">{item.qty}× {formatBRL(item.unit_price)}</p>
                        </div>
                        <p className="text-xs font-black text-[#312783] shrink-0">{formatBRL(item.unit_price * item.qty)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 pt-4 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-500">Total Bruto</span>
                      <span className="font-black text-slate-800">{formatBRL(totalBruto)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-500">IPI ({(IPI_RATE * 100).toFixed(1)}%)</span>
                      <span className="font-bold text-slate-600">{formatBRL(totalIPI)}</span>
                    </div>
                    <div className="bg-[#312783] rounded-2xl p-3.5 flex justify-between items-center">
                      <span className="text-sm font-black text-white/80">Total com IPI</span>
                      <span className="font-black text-white text-lg">{formatBRL(totalComIPI)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Park image attachment */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <ImageIcon size={18} className="text-[#312783]" />
              <span className="font-black text-slate-700">Imagem do Parque</span>
              <span className="text-xs text-slate-400 font-bold ml-auto">PNG / JPG</span>
            </div>
            <div className="p-5">
              {parkImage ? (
                <div className="relative">
                  <img src={parkImage} className="w-full h-36 object-cover rounded-2xl" />
                  <button
                    onClick={() => { setParkImage(null); if (parkImageInputRef.current) parkImageInputRef.current.value = ''; }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                  <p className="text-xs text-slate-400 font-bold text-center mt-2">Imagem será incluída no PDF</p>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-[#312783] hover:bg-slate-50 transition-all">
                  <ImagePlus size={28} className="text-slate-300" />
                  <span className="text-sm font-bold text-slate-400">Clique para anexar imagem</span>
                  <span className="text-xs text-slate-300 font-bold">PNG ou JPG</span>
                  <input
                    ref={parkImageInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={handleParkImage}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Export button */}
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
  );
};

export default ProductCalculator;
