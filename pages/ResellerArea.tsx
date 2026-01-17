import React, { useState, useEffect } from 'react';
import { Package, Search, ChevronRight, X, Info, Download, Filter, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CSVRow {
    Código: string;
    CATEGORIA: string;
    "Nome do Produto": string;
    Imagem: string;
    Qtd: string;
    Focco: string;
    Componentes: string;
    "Peso Individual": string;
    "Peso + Qtd": string;
    "R$ Peso": string;
    Complexidade: string;
    "R$ + Complexidade": string;
}

interface Product {
    id: string;
    code: string;
    name: string;
    category: string;
    image: string;
    totalPrice: number;
    totalWeight: number;
    components: {
        focco: string;
        name: string;
        qty: number;
        price: number;
        weight: number;
    }[];
}

const ResellerArea: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [filterCategory, setFilterCategory] = useState('Todos');

    const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT5i6eL3aEB3VBopQT8eq3Rk_AG6RAa3WZOsiXxUxW1_AV3gdnuAnVwuRvm6XfBOaCEBZ7v2P5YVFBd/pub?gid=1430498949&single=true&output=csv";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(CSV_URL);
                const csvText = await response.text();
                const rows = parseCSV(csvText);
                const groupedProducts = groupProducts(rows);
                setProducts(groupedProducts);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching reseller data:", err);
                setError("Não foi possível carregar os dados do catálogo.");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const parseCSV = (csv: string): CSVRow[] => {
        const lines = csv.split('\n');
        const header = lines[0].split(',');
        const result: CSVRow[] = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            // Simple CSV parser that handles quotes
            const values: string[] = [];
            let current = '';
            let inQuotes = false;

            for (let j = 0; j < lines[i].length; j++) {
                const char = lines[i][j];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());

            const obj: any = {};
            header.forEach((h, index) => {
                obj[h.trim()] = values[index] || '';
            });
            result.push(obj);
        }
        return result;
    };

    const parseCurrency = (val: string): number => {
        if (!val) return 0;
        // Remove "R$", spaces, and replace comma with dot
        const clean = val.replace(/R\$/g, '').replace(/\./g, '').replace(/,/g, '.').replace(/\s+/g, '').replace(/[^\d.]/g, '');
        return parseFloat(clean) || 0;
    };

    const parseWeight = (val: string): number => {
        if (!val) return 0;
        const clean = val.replace(/,/g, '.').replace(/\s+/g, '').replace(/[^\d.]/g, '');
        return parseFloat(clean) || 0;
    };

    const groupProducts = (rows: CSVRow[]): Product[] => {
        const map = new Map<string, Product>();

        rows.forEach(row => {
            const code = row.Código;
            const name = row["Nome do Produto"];
            const category = row.CATEGORIA;
            const key = `${code}-${name}`;

            if (!map.has(key)) {
                map.set(key, {
                    id: key,
                    code,
                    name,
                    category,
                    image: row.Imagem || 'https://via.placeholder.com/400?text=Sem+Imagem',
                    totalPrice: 0,
                    totalWeight: 0,
                    components: []
                });
            }

            const product = map.get(key)!;
            const componentPrice = parseCurrency(row["R$ + Complexidade"]);
            const componentWeight = parseWeight(row["Peso + Qtd"]);

            product.totalPrice += componentPrice;
            product.totalWeight += componentWeight;

            product.components.push({
                focco: row.Focco,
                name: row.Componentes,
                qty: parseInt(row.Qtd) || 0,
                price: componentPrice,
                weight: componentWeight
            });
        });

        return Array.from(map.values());
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const formatWeight = (val: number) => {
        return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kg';
    };

    const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.includes(search);
        const matchesCategory = filterCategory === 'Todos' || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-krenke-orange border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-bold">Carregando catálogo revendedor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[110] overflow-y-auto" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-black/70 transition-opacity" onClick={() => setSelectedProduct(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full animate-fade-in-up">
                            <div className="absolute top-4 right-4 z-10">
                                <button onClick={() => setSelectedProduct(null)} className="bg-white/80 hover:bg-white text-gray-400 hover:text-gray-500 rounded-full p-2 backdrop-blur-sm shadow-sm transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 md:p-8">
                                <div className="grid md:grid-cols-3 gap-8 mb-8">
                                    <div className="md:col-span-1">
                                        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center mb-4">
                                            <img src={selectedProduct.image} alt={selectedProduct.name} className="max-w-full max-h-full object-contain" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                                <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">Preço Sugerido</p>
                                                <p className="text-2xl font-black text-krenke-orange">{formatCurrency(selectedProduct.totalPrice)}</p>
                                            </div>
                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Peso Total</p>
                                                <p className="text-xl font-bold text-blue-900">{formatWeight(selectedProduct.totalWeight)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <div className="mb-6">
                                            <span className="inline-block py-1 px-3 rounded-full bg-purple-100 text-krenke-purple text-xs font-bold uppercase mb-2">
                                                {selectedProduct.category}
                                            </span>
                                            <h2 className="text-3xl font-black text-gray-900">{selectedProduct.name}</h2>
                                            <p className="text-gray-500 font-medium">Código: {selectedProduct.code}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <Package size={20} className="text-krenke-orange" />
                                                Componentes do Produto
                                            </h3>
                                            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                                                        <tr>
                                                            <th className="px-4 py-3">Código</th>
                                                            <th className="px-4 py-3">Componente</th>
                                                            <th className="px-4 py-3 text-center">Qtd</th>
                                                            <th className="px-4 py-3 text-right">Peso</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {selectedProduct.components.map((comp, i) => (
                                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-4 py-3 text-gray-500 font-mono">{comp.focco}</td>
                                                                <td className="px-4 py-3 font-medium text-gray-800">{comp.name}</td>
                                                                <td className="px-4 py-3 text-center text-gray-600">{comp.qty}</td>
                                                                <td className="px-4 py-3 text-right text-gray-500">{formatWeight(comp.weight)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex gap-3">
                                            <button className="flex-1 bg-krenke-purple text-white font-bold py-4 rounded-xl hover:bg-opacity-90 transition-all shadow-lg flex items-center justify-center gap-2">
                                                <Download size={20} />
                                                Ficha Técnica
                                            </button>
                                            <button className="flex-1 bg-krenke-orange text-white font-bold py-4 rounded-xl hover:bg-opacity-90 transition-all shadow-lg flex items-center justify-center gap-2">
                                                Pedir via WhatsApp
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Banner */}
            <div className="bg-white border-b border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 mb-2">
                                <Link to="/" className="hover:text-krenke-orange transition-colors">Home</Link>
                                <ChevronRight size={14} />
                                <span className="text-krenke-orange font-bold">Área do Revendedor</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-2">Tabela de Preços Revenda</h1>
                            <p className="text-gray-600 max-w-xl">Acesse preços exclusivos, pesos detalhados e componentes de toda nossa linha de produtos.</p>
                        </div>

                        <div className="bg-krenke-purple p-6 rounded-2xl shadow-xl text-white flex flex-col items-center md:items-start gap-1">
                            <p className="text-purple-200 text-xs font-bold uppercase tracking-widest">Tabela Vigente</p>
                            <p className="text-2xl font-black tracking-tight">JANEIRO 2026</p>
                            <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-white/10 rounded-full text-xs">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                Sincronizado via Cloud
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-10">
                    <div className="flex-grow relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por código ou nome do produto..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white focus:ring-2 focus:ring-krenke-orange outline-none transition-all shadow-sm text-gray-700"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <div className="relative min-w-[200px]">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                className="w-full pl-12 pr-10 py-4 rounded-2xl border border-gray-200 bg-white appearance-none focus:ring-2 focus:ring-krenke-orange outline-none transition-all shadow-sm font-bold text-gray-700 cursor-pointer"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronRight size={18} className="rotate-90 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {error ? (
                    <div className="bg-red-50 border border-red-100 p-8 rounded-2xl text-center">
                        <p className="text-red-600 font-bold mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="py-20 text-center animate-fade-in">
                        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <Search size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Nenhum produto encontrado</h3>
                        <p className="text-gray-500">Tente ajustar sua busca ou filtro.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                        {filteredProducts.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => setSelectedProduct(p)}
                                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer flex flex-col h-full"
                            >
                                {/* Image Section */}
                                <div className="relative aspect-square overflow-hidden bg-gray-50 p-6">
                                    <img
                                        src={p.image}
                                        alt={p.name}
                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-krenke-purple border border-gray-100 shadow-sm">
                                            #{p.code}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-6 flex flex-col flex-grow">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{p.category}</p>
                                    <h3 className="text-lg font-black text-gray-900 leading-tight mb-4 group-hover:text-krenke-orange transition-colors line-clamp-2">
                                        {p.name}
                                    </h3>

                                    <div className="mt-auto space-y-4">
                                        <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Preço Sugerido</span>
                                                <span className="text-xl font-black text-krenke-orange">{formatCurrency(p.totalPrice)}</span>
                                            </div>
                                            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-krenke-orange group-hover:bg-krenke-orange group-hover:text-white transition-all transform group-hover:rotate-45">
                                                <ChevronRight size={20} strokeWidth={3} />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Package size={14} className="text-blue-500" />
                                                {p.components.length} Itens
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Info size={14} className="text-purple-500" />
                                                {formatWeight(p.totalWeight)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Action Button for Mobile */}
            <div className="fixed bottom-6 right-6 md:hidden z-50">
                <button className="w-14 h-14 bg-green-500 text-white rounded-full shadow-2xl flex items-center justify-center">
                    <Download size={24} />
                </button>
            </div>
        </div>
    );
};

export default ResellerArea;
