import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Save, Upload, Search, Edit2 } from 'lucide-react';

const AdminPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [editForm, setEditForm] = useState<Partial<Product>>({});
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/products');
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setEditForm({ ...product });
        setMessage(null);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        try {
            const response = await fetch('http://localhost:3001/api/products/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...editForm, originalId: selectedProduct.id }),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Produto atualizado com sucesso!' });
                fetchProducts();
                // Update selection to match new ID if it changed
                if (editForm.id) {
                    setSelectedProduct(prev => prev ? { ...prev, id: editForm.id! } : null);
                }
            } else {
                const err = await response.json();
                setMessage({ type: 'error', text: err.error || 'Erro ao atualizar produto.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Erro de conexão com o servidor.' });
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        const formData = new FormData();
        formData.append('image', e.target.files[0]);

        try {
            const response = await fetch('http://localhost:3001/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.success) {
                setEditForm(prev => ({ ...prev, image: data.path }));
                setMessage({ type: 'success', text: `Imagem ${data.filename} enviada!` });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Erro ao enviar imagem.' });
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center">Carregando painel admin...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-krenke-blue">Painel Administrativo</h1>
                        <p className="text-gray-500">Gerenciamento de Produtos</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar produto..."
                            className="pl-10 pr-4 py-2 border rounded-xl w-80 focus:ring-2 focus:ring-krenke-orange outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                {message && (
                    <div className={`p-4 rounded-xl mb-6 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* List Section */}
                    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                        <div className="p-6 border-b bg-gray-50/50">
                            <h2 className="font-bold flex items-center gap-2"><Edit2 size={20} /> Lista de Produtos</h2>
                        </div>
                        <div className="h-[600px] overflow-y-auto">
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    onClick={() => handleEdit(product)}
                                    className={`p-4 border-b hover:bg-orange-50 cursor-pointer transition-colors ${selectedProduct?.id === product.id ? 'bg-orange-50 border-l-4 border-l-krenke-orange' : ''}`}
                                >
                                    <div className="font-bold text-gray-800">{product.name}</div>
                                    <div className="text-xs text-gray-400 mt-1">ID: {product.id} | {product.category}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Edit Section */}
                    <div className="bg-white rounded-2xl shadow-sm border p-8">
                        {selectedProduct ? (
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <h2 className="text-xl font-bold text-krenke-blue mb-6">Editando Produto</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-600">Código (ID)</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-krenke-orange font-mono text-sm bg-gray-50"
                                            value={editForm.id || ''}
                                            onChange={(e) => setEditForm({ ...editForm, id: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-600">Nome do Produto</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-krenke-orange"
                                            value={editForm.name || ''}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">Descrição Curta</label>
                                    <textarea
                                        rows={3}
                                        className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-krenke-orange"
                                        value={editForm.description || ''}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">Caminho da Imagem Principal</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-grow p-3 border rounded-xl outline-none focus:ring-2 focus:ring-krenke-orange"
                                            value={editForm.image || ''}
                                            onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                                        />
                                        <label className="bg-gray-100 p-3 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors">
                                            <Upload size={20} />
                                            <input type="file" className="hidden" onChange={handleImageUpload} />
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">Especificações (HTML)</label>
                                    <textarea
                                        rows={8}
                                        className="w-full p-3 border rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-krenke-orange"
                                        value={editForm.specs || ''}
                                        onChange={(e) => setEditForm({ ...editForm, specs: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-krenke-orange text-white font-black rounded-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
                                >
                                    <Save size={20} /> SALVAR ALTERAÇÕES
                                </button>
                            </form>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                                <Edit2 size={64} className="opacity-20" />
                                <p>Selecione um produto na lista para editar</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
