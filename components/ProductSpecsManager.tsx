import React, { useState, useEffect } from 'react';

interface ProductSpecsManagerProps {
    value: string;
    onChange: (html: string) => void;
    productDescription?: string;
}

interface SpecFields {
    tamanho: string;
    area: string;
    altura: string;
    peso: string;
    cubagem: string;
    norma: string;
    idade: string;
}

const ProductSpecsManager: React.FC<ProductSpecsManagerProps> = ({ value, onChange, productDescription }) => {
    const [fields, setFields] = useState<SpecFields>({
        tamanho: '',
        area: '',
        altura: '',
        peso: '',
        cubagem: '',
        norma: 'NBR 16.071/21',
        idade: '03 a 12 Anos'
    });

    // Tentar extrair os dados do HTML existente se possível
    useEffect(() => {
        if (!value) return;

        const parseValue = () => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(value, 'text/html');
            const rows = doc.querySelectorAll('tr');
            const newFields: Partial<SpecFields> = {};

            rows.forEach(row => {
                const label = row.querySelector('th')?.textContent?.trim().toLowerCase();
                const content = row.querySelector('td');
                const text = content?.textContent?.trim() || '';

                if (label?.includes('tamanho')) newFields.tamanho = text;
                else if (label?.includes('área')) newFields.area = text;
                else if (label?.includes('altura')) newFields.altura = text;
                else if (label?.includes('peso')) newFields.peso = text;
                else if (label?.includes('cubagem')) newFields.cubagem = text;
                else if (label?.includes('norma')) newFields.norma = text;
                else if (label?.includes('idade')) newFields.idade = text;
            });

            if (Object.keys(newFields).length > 0) {
                setFields(prev => ({ ...prev, ...newFields }));
            }
        };

        parseValue();
    }, []); // Só roda uma vez ao montar para carregar os dados iniciais

    const generateHTML = (currentFields: SpecFields) => {
        const html = `
<div class="krenke-product-container">
  ${productDescription ? `
  <div class="krenke-desc">
    <p>${productDescription}</p>
  </div>` : ''}

  <table class="krenke-specs-table">
    <tbody>
      <tr>
        <th>Tamanho do Brinquedo</th>
        <td>${currentFields.tamanho}</td>
      </tr>
      <tr>
        <th>Área Necessária (c/ Circulação)</th>
        <td><span class="highlight-area">${currentFields.area}</span></td>
      </tr>
      <tr>
        <th>Altura das Torres</th>
        <td>${currentFields.altura}</td>
      </tr>
      <tr>
        <th>Peso Total</th>
        <td>${currentFields.peso}</td>
      </tr>
      <tr>
        <th>Cubagem</th>
        <td>${currentFields.cubagem}</td>
      </tr>
      <tr>
        <th>Norma de Segurança</th>
        <td><span class="highlight-orange">${currentFields.norma}</span></td>
      </tr>
      <tr>
        <th>Idade Recomendada</th>
        <td>${currentFields.idade}</td>
      </tr>
    </tbody>
  </table>
</div>`.trim();

        onChange(html);
    };

    const handleFieldChange = (key: keyof SpecFields, val: string) => {
        const newFields = { ...fields, [key]: val };
        setFields(newFields);
        generateHTML(newFields);
    };

    // Atualiza o HTML quando a descrição do produto muda
    useEffect(() => {
        generateHTML(fields);
    }, [productDescription]);

    return (
        <div className="bg-white rounded-2xl border p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b pb-4">
                <h3 className="font-bold text-krenke-blue flex items-center gap-2">
                    🛠️ Parâmetros Técnicos
                </h3>
                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold uppercase">Modo Estruturado</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Tamanho do Brinquedo</label>
                    <input
                        type="text"
                        value={fields.tamanho}
                        onChange={e => handleFieldChange('tamanho', e.target.value)}
                        placeholder="Ex: 11,00m x 5,00m"
                        className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-krenke-orange/20"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Área Necessária (c/ Circulação)</label>
                    <input
                        type="text"
                        value={fields.area}
                        onChange={e => handleFieldChange('area', e.target.value)}
                        placeholder="Ex: 13,50m x 9,00m (112m²)"
                        className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-krenke-orange/20 font-bold text-krenke-blue"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Altura das Torres</label>
                    <input
                        type="text"
                        value={fields.altura}
                        onChange={e => handleFieldChange('altura', e.target.value)}
                        placeholder="Ex: 1,20m / 1,40m"
                        className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-krenke-orange/20"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Peso Total</label>
                    <input
                        type="text"
                        value={fields.peso}
                        onChange={e => handleFieldChange('peso', e.target.value)}
                        placeholder="Ex: 619,94 KG"
                        className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-krenke-orange/20"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Cubagem</label>
                    <input
                        type="text"
                        value={fields.cubagem}
                        onChange={e => handleFieldChange('cubagem', e.target.value)}
                        placeholder="Ex: 10,82 m³"
                        className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-krenke-orange/20"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Norma de Segurança</label>
                    <input
                        type="text"
                        value={fields.norma}
                        onChange={e => handleFieldChange('norma', e.target.value)}
                        className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-krenke-orange/20 text-orange-700 font-bold"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Idade Recomendada</label>
                    <input
                        type="text"
                        value={fields.idade}
                        onChange={e => handleFieldChange('idade', e.target.value)}
                        className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-krenke-orange/20"
                    />
                </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <p className="text-[10px] text-orange-700 font-medium">
                    💡 <strong>Dica:</strong> Os valores acima serão formatados automaticamente na tabela padrão da Krenke.
                    A descrição do produto também será incluída no topo do card de especificações.
                </p>
            </div>
        </div>
    );
};

export default ProductSpecsManager;
