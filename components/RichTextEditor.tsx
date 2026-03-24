import React, { useMemo } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Configuração para permitir classes arbitrárias no Quill (como 'highlight orange')
const Parchment = Quill.import('parchment');
const CustomClass = new Parchment.ClassAttributor('custom-class', 'class', {
    scope: Parchment.Scope.INLINE
});
Quill.register(CustomClass, true);

// Habilita suporte a tabelas se disponível no Quill 2.x
const Table = Quill.import('modules/table');
Quill.register('modules/table', Table, true);

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    label?: string;
    placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, label, placeholder }) => {
    const [isCodeMode, setIsCodeMode] = React.useState(false);

    // Função para formatar o HTML de forma legível e limpar entidades
    const formatHTML = (html: string) => {
        if (!html) return '';

        let formatted = html
            .replace(/&nbsp;/g, ' ') // Converte nbsp para espaços normais
            .replace(/></g, '>\n<')   // Tenta quebrar linhas minimamente entre tags
            // Garante que tags de bloco comecem em nova linha para legibilidade
            .replace(/(<(?:p|h1|h2|h3|h4|h5|h6|ul|ol|li|table|thead|tbody|tr|th|td|div|section|article|header|footer|br|hr)[^>]*>)/gi, '\n$1')
            .replace(/(<\/(?:p|h1|h2|h3|h4|h5|h6|ul|ol|li|table|thead|tbody|tr|th|td|div|section|article|header|footer)>)/gi, '$1\n')
            .replace(/\n\s*\n/g, '\n') // Remove excesso de linhas vazias
            .trim();

        return formatted;
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                ['link', 'clean'],
                ['table'],
                ['code-block']
            ],
            handlers: {
                table: function () {
                    // @ts-ignore
                    this.quill.getModule('table').insertTable(3, 3);
                }
            }
        },
        table: true,
        clipboard: {
            matchVisual: false // Mantém a fidelidade do que foi colado
        }
    }), []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'color', 'background',
        'link', 'code-block',
        'table', 'table-row', 'table-cell', 'table-header', 'custom-class'
    ];

    const handleToggleMode = (codeMode: boolean) => {
        if (codeMode && !isCodeMode) {
            onChange(formatHTML(value));
        }
        setIsCodeMode(codeMode);
    };

    return (
        <div className="space-y-4">
            <style>{`
                /* Estilos para tabelas dentro do editor Visual */
                .ql-editor table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1rem 0;
                    border: 1px solid #e2e8f0 !important;
                }
                .ql-editor th, .ql-editor td {
                    border: 1px solid #e2e8f0 !important;
                    padding: 0.75rem 1rem !important;
                    text-align: left;
                    min-width: 50px;
                }
                .ql-editor th {
                    background-color: #f8fafc;
                    font-weight: 600;
                }
                
                /* Estilos para os spans com classes customizadas */
                .highlight {
                    font-weight: 700;
                }
                .highlight.orange {
                    color: #F39200 !important;
                }
                .highlight.blue {
                    color: #1e40af !important;
                }
                
                /* Melhorias no Scroll do Quill */
                .ql-container.ql-snow {
                    border: none !important;
                }
                .ql-editor {
                    min-height: 400px;
                    font-family: inherit;
                    font-size: 0.95rem;
                    line-height: 1.6;
                }
            `}</style>

            <div className="flex items-center justify-between">
                {label && <label className="text-sm font-black text-gray-400 uppercase tracking-wider">{label}</label>}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => handleToggleMode(false)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${!isCodeMode ? 'bg-white text-krenke-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        VISUAL
                    </button>
                    <button
                        type="button"
                        onClick={() => handleToggleMode(true)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${isCodeMode ? 'bg-white text-krenke-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        CÓDIGO HTML
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm transition-all focus-within:ring-2 focus-within:ring-krenke-orange/20">
                {!isCodeMode ? (
                    <ReactQuill
                        theme="snow"
                        value={value}
                        onChange={onChange}
                        modules={modules}
                        formats={formats}
                        placeholder={placeholder || 'Escreva o conteúdo aqui...'}
                        className="min-h-[400px]"
                    />
                ) : (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Cole seu código HTML aqui..."
                        className="w-full min-h-[500px] p-6 font-mono text-sm bg-gray-900 text-gray-100 outline-none resize-y leading-relaxed"
                        spellCheck={false}
                    />
                )}
            </div>
            {isCodeMode && (
                <div className="flex flex-col gap-2">
                    <p className="text-[10px] text-gray-400 font-medium bg-gray-50 p-3 rounded-lg border border-dashed text-center">
                        ⚠️ No modo de código, a estrutura HTML é preservada. Use para tabelas complexas ou estilos específicos.
                    </p>
                    <button
                        type="button"
                        onClick={() => onChange(formatHTML(value))}
                        className="text-[10px] text-krenke-blue font-bold hover:underline self-center bg-blue-50 px-4 py-2 rounded-full"
                    >
                        ✨ REFORMATAR CÓDIGO PARA EDIÇÃO
                    </button>
                </div>
            )}
        </div>
    );
};

export default RichTextEditor;
