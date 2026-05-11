import React, { useState, useEffect } from 'react';

interface ProductSpecsManagerProps {
    value: string;
    onChange: (html: string) => void;
    productDescription?: string;
    enabledFields?: string[]; // IDs dos campos habilitados
}

interface SpecFields {
    tamanho: string;
    dimensoesSeguranca: string;
    areaMinima: string;
    areaSeguranca: string;
    criancas: string;
    altura: string;
    peso: string;
    cubagem: string;
    norma: string;
    idade: string;
}

const ALL_FIELDS = [
    { id: 'tamanho', label: 'Tamanho do Brinquedo', placeholder: 'Ex: 11,00m x 5,00m' },
    { id: 'dimensoesSeguranca', label: 'Dimensões de Segurança', placeholder: 'Ex: 13,50m x 9,00m', highlight: 'blue' },
    { id: 'areaMinima', label: 'Área Mínima', placeholder: 'Ex: 112m²' },
    { id: 'areaSeguranca', label: 'Área de Segurança', placeholder: 'Ex: 150m²' },
    { id: 'criancas', label: 'Crianças Simultâneas', placeholder: 'Ex: 25' },
    { id: 'altura', label: 'Altura das Torres', placeholder: 'Ex: 1,20m / 1,40m' },
    { id: 'peso', label: 'Peso Total', placeholder: 'Ex: 619,94 KG' },
    { id: 'cubagem', label: 'Cubagem', placeholder: 'Ex: 10,82 m³' },
    { id: 'norma', label: 'Norma de Segurança', placeholder: '', highlight: 'orange' },
    { id: 'idade', label: 'Idade Recomendada', placeholder: '' },
];

const ProductSpecsManager: React.FC<ProductSpecsManagerProps> = ({ value, onChange, productDescription, enabledFields }) => {
    const [fields, setFields] = useState<SpecFields>({
        tamanho: '',
        dimensoesSeguranca: '',
        areaMinima: '',
        areaSeguranca: '',
        criancas: '',
        altura: '',
        peso: '',
        cubagem: '',
        norma: 'NBR 16.071/21',
        idade: '5 a 12 anos'
    });

    // Filtra os campos habilitados (se não informado, habilita todos)
    const activeFields = enabledFields && enabledFields.length > 0 
        ? ALL_FIELDS.filter(f => enabledFields.includes(f.id))
        : ALL_FIELDS;

    // Tentar extrair os dados do HTML existente se possível
    useEffect(() => {
        if (!value) return;

        const parseValue = () => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(value, 'text/html');
            const rows = doc.querySelectorAll('tr');
            const newFields: Partial<SpecFields> = {};

            rows.forEach(row => {
                const th = row.querySelector('th');
                const td = row.querySelector('td');
                
                let label = th?.textContent?.trim().toLowerCase() || '';
                let text = td?.textContent?.trim() || '';

                // Suporte para formato "quebrado" onde rótulo e valor estão no mesmo TD
                if (!th && td) {
                    const fullText = td.textContent?.trim() || '';
                    // Tenta encontrar qual campo começa com o texto desta célula
                    const foundField = ALL_FIELDS.find(f => 
                        fullText.toLowerCase().startsWith(f.label.toLowerCase())
                    );
                    
                    if (foundField) {
                        label = foundField.label.toLowerCase();
                        text = fullText.substring(foundField.label.length).trim();
                    }
                }

                if (label.includes('tamanho')) newFields.tamanho = text;
                else if (label.includes('área necessária') || label.includes('dimensões de segurança')) newFields.dimensoesSeguranca = text;
                else if (label.includes('área mínima')) newFields.areaMinima = text;
                else if (label.includes('área de segurança')) newFields.areaSeguranca = text;
                else if (label.includes('crianças') || label.includes('simultân')) newFields.criancas = text;
                else if (label.includes('altura')) newFields.altura = text;
                else if (label.includes('peso')) newFields.peso = text;
                else if (label.includes('cubagem')) newFields.cubagem = text;
                else if (label.includes('norma')) newFields.norma = text;
                else if (label.includes('idade')) newFields.idade = text;
            });

            if (Object.keys(newFields).length > 0) {
                setFields(prev => ({ ...prev, ...newFields }));
            }
        };

        parseValue();
    }, []); // Só roda uma vez ao montar para carregar os dados iniciais

    const generateHTML = (currentFields: SpecFields) => {
        const rowsHTML = activeFields.map(field => {
            const val = currentFields[field.id as keyof SpecFields];
            if (!val) return ''; 
            
            let displayVal = val;
            if (field.highlight === 'blue') displayVal = `<span class="highlight-area">${val}</span>`;
            if (field.highlight === 'orange') displayVal = `<span class="highlight-orange">${val}</span>`;

            return `
      <tr>
        <th>${field.label}</th>
        <td>${displayVal}</td>
      </tr>`;
        }).join('');

        const html = `
<div class="krenke-product-container">
  ${productDescription ? `
  <div class="krenke-desc">
    <p>${productDescription}</p>
  </div>` : ''}

  <table class="krenke-specs-table">
    <tbody>${rowsHTML}
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

    // Atualiza o HTML quando a descrição do produto muda ou quando os campos ativos mudam
    useEffect(() => {
        generateHTML(fields);
    }, [productDescription, enabledFields]);


    return (
        <div className="bg-white rounded-2xl border p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b pb-4">
                <h3 className="font-bold text-krenke-blue flex items-center gap-2">
                    🛠️ Parâmetros Técnicos
                </h3>
                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold uppercase">Modo Estruturado</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeFields.map(field => (
                    <div key={field.id} className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">{field.label}</label>
                        <input
                            type="text"
                            value={fields[field.id as keyof SpecFields]}
                            onChange={e => handleFieldChange(field.id as keyof SpecFields, e.target.value)}
                            placeholder={field.placeholder}
                            className={`w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-krenke-orange/20 ${
                                field.highlight === 'blue' ? 'font-bold text-krenke-blue' : 
                                field.highlight === 'orange' ? 'text-orange-700 font-bold' : ''
                            }`}
                        />
                    </div>
                ))}
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
