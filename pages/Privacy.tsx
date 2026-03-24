import React from 'react';
import { Shield, Lock, Eye, FileText, Scale, Bell } from 'lucide-react';

const PolicySection = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-krenke-orange/10 rounded-lg flex items-center justify-center text-krenke-orange">
                <Icon size={24} />
            </div>
            <h2 className="text-2xl font-black text-krenke-purple uppercase tracking-tight">{title}</h2>
        </div>
        <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-4">
            {children}
        </div>
    </div>
);

const PrivacyPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-12 pb-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-krenke-purple/5 text-krenke-purple text-xs font-bold uppercase tracking-widest mb-4">
                        <Lock size={14} /> Atualizado em Janeiro de 2026
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-krenke-purple mb-6 uppercase tracking-tighter">
                        Política de <span className="text-krenke-orange">Privacidade</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto italic">
                        Sua privacidade é nossa prioridade. Entenda como protegemos seus dados e garantimos sua segurança digital.
                    </p>
                    <div className="w-24 h-1.5 bg-krenke-orange mx-auto mt-8 rounded-full"></div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 md:p-12 border border-slate-100">

                    <PolicySection title="1. Coleta de Informações" icon={Eye}>
                        <p>
                            A Krenke Brinquedos coleta informações para fornecer melhores serviços a todos os nossos usuários. Coletamos informações das seguintes formas:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Informações fornecidas por você:</strong> Nome, e-mail, telefone e empresa através de formulários de orçamento ou contato.</li>
                            <li><strong>Informações de Publicidade (Ads):</strong> Utilizamos cookies e tecnologias semelhantes para fornecer anúncios mais relevantes através do Google Ads e redes sociais.</li>
                            <li><strong>Dados de Navegação:</strong> Endereço IP, tipo de navegador, páginas visitadas e tempo de permanência através do Google Analytics e Google Tag Manager.</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="2. Uso dos Dados e LGPD" icon={Shield}>
                        <p>
                            Todos os seus dados são tratados em estrita conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>. O tratamento dos dados tem as seguintes finalidades:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Processar e responder solicitações de orçamentos personalizados.</li>
                            <li>Envio de comunicações de marketing e novidades (sempre com opção de opt-out).</li>
                            <li>Análise de tráfego para melhoria contínua da experiência do usuário no site.</li>
                            <li>Prevenção contra fraudes e garantia da segurança dos nossos serviços.</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="3. Marketing e Publicidade Digital" icon={Bell}>
                        <p>
                            Para otimizar nossos investimentos em anúncios, utilizamos ferramentas que podem coletar dados para remarketing:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Google Ads:</strong> Exibimos anúncios baseados em suas visitas anteriores ao nosso site.</li>
                            <li><strong>Meta Pixel:</strong> Ativamos recursos de audiência personalizada para usuários que demonstraram interesse em nossos produtos.</li>
                            <li><strong>Cookie Opt-out:</strong> Você pode ajustar suas preferências através das configurações do seu navegador ou gerenciadores de cookies de terceiros.</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="4. Compartilhamento de Informações" icon={Scale}>
                        <p>
                            Não compartilhamos informações pessoais com empresas, organizações ou indivíduos externos à Krenke Brinquedos, exceto nas seguintes circunstâncias:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Com o seu consentimento explícito.</li>
                            <li>Para processamento externo por fornecedores de serviços confiáveis (como nosso sistema CRM), sob nossas instruções e em conformidade com nossa Política de Privacidade.</li>
                            <li>Por motivos legais, para cumprir qualquer lei, regulamentação ou processo judicial aplicável.</li>
                        </ul>
                    </PolicySection>

                    <PolicySection title="5. Seus Direitos" icon={FileText}>
                        <p>
                            De acordo com a LGPD, você tem o direito de:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Confirmar a existência de tratamento de seus dados.</li>
                            <li>Acessar seus dados pessoais.</li>
                            <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
                            <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários.</li>
                            <li>Revogar o consentimento a qualquer momento.</li>
                        </ul>
                        <p className="mt-6 p-4 bg-slate-50 border-l-4 border-krenke-purple rounded-r-lg italic">
                            Para exercer seus direitos, entre em contato através do e-mail: <strong>privacidade@krenke.com.br</strong>
                        </p>
                    </PolicySection>

                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
