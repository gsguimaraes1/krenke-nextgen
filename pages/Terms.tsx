import React from 'react';
import { Gavel, CheckCircle, AlertTriangle, ShieldAlert, BookOpen, Scaling } from 'lucide-react';

const TermSection = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-krenke-purple/10 rounded-lg flex items-center justify-center text-krenke-purple">
                <Icon size={24} />
            </div>
            <h2 className="text-2xl font-black text-krenke-purple uppercase tracking-tight">{title}</h2>
        </div>
        <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-4">
            {children}
        </div>
    </div>
);

const TermsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-12 pb-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-krenke-orange/5 text-krenke-orange text-xs font-bold uppercase tracking-widest mb-4">
                        <Gavel size={14} /> Contrato de Uso do Site
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-krenke-purple mb-6 uppercase tracking-tighter">
                        Termos de <span className="text-krenke-orange">Uso</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto italic">
                        Ao navegar neste site, você concorda com os termos e condições descritos abaixo.
                    </p>
                    <div className="w-24 h-1.5 bg-krenke-orange mx-auto mt-8 rounded-full"></div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 md:p-12 border border-slate-100">

                    <TermSection title="1. Aceitação dos Termos" icon={CheckCircle}>
                        <p>
                            Ao acessar o site da Krenke Brinquedos, o usuário declara ter lido, compreendido e aceitado todos os termos vigentes. Este site é destinado a fornecer informações sobre nossos produtos e facilitar o canal de vendas B2B e B2C.
                        </p>
                    </TermSection>

                    <TermSection title="2. Propriedade Intelectual" icon={BookOpen}>
                        <p>
                            Todo o conteúdo deste site — incluindo textos, imagens dos produtos, vídeos dos playgrounds, logotipos e design — é de propriedade exclusiva da <strong>Krenke Brinquedos Pedagógicos LTDA</strong> ou de seus licenciados.
                        </p>
                        <p className="font-bold text-red-600 italic">
                            É terminantemente proibida a cópia, reprodução ou uso comercial de nossas imagens sem autorização prévia por escrito.
                        </p>
                    </TermSection>

                    <TermSection title="3. Uso de Formulários e Orçamentos" icon={Scaling}>
                        <p>
                            O usuário compromete-se a fornecer dados verídicos ao solicitar orçamentos. A Krenke reserva-se o direito de:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Validar as informações de contato antes de emitir propostas comerciais.</li>
                            <li>Ajustar preços e disponibilidades de produtos sem aviso prévio, prevalecendo sempre o valor da cotação formal enviada por nossos consultores.</li>
                            <li>Cancelar solicitações que apresentem dados manifestamente falsos ou mal-intencionados.</li>
                        </ul>
                    </TermSection>

                    <TermSection title="4. Limitação de Responsabilidade" icon={AlertTriangle}>
                        <p>
                            A Krenke envida seus maiores esforços para manter as informações precisas e atualizadas. No entanto, não nos responsabilizamos por:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Interrupções técnicas temporárias no acesso ao site.</li>
                            <li>Variações de tonalidade nas cores exibidas nas fotos dos produtos (que podem variar conforme o monitor).</li>
                            <li>Mau uso do site por parte de terceiros ou danos causados por malwares externos.</li>
                        </ul>
                    </TermSection>

                    <TermSection title="5. Modificações e Foro" icon={ShieldAlert}>
                        <p>
                            Podemos atualizar estes termos periodicamente para refletir mudanças legais ou comerciais. O uso continuado do site após alterações constitui aceitação dos novos termos.
                        </p>
                        <p className="mt-4">
                            Para dirimir quaisquer controvérsias oriundas deste termo, as partes elegem o foro da Comarca de <strong>Guaramirim/SC</strong>, local de nossa matriz, com exclusão de qualquer outro.
                        </p>
                    </TermSection>

                </div>
            </div>
        </div>
    );
};

export default TermsPage;
