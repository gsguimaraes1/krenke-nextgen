import React, { useState, useEffect, useMemo, forwardRef } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { Document, Page, pdfjs } from 'react-pdf';
// @ts-ignore
import HTMLFlipBook from 'react-pageflip';
import { X, Send, Loader2, Phone, MapPin, User, Download, Mail } from 'lucide-react';
import Select from 'react-select';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { getStoredUTMs } from '../lib/utm-tracker';
import { TranslatableText } from '../components/TranslatableText';
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string;


// Configuração necessária para o PDF.js funcionar (CDN da Mozilla)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const normalizeText = (text: string) =>
    text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

const CustomPhoneInput = forwardRef<HTMLInputElement, any>((props, ref) => (
    <input
        {...props}
        ref={ref}
        className="w-full bg-transparent outline-none font-black text-gray-900 placeholder:text-gray-300"
    />
));

const CatalogLeadForm: React.FC<{ onSuccess: () => void; pdfUrl: string }> = ({ onSuccess, pdfUrl }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [cities, setCities] = useState<{ value: string, label: string }[]>([]);
    const [selectedCity, setSelectedCity] = useState<{ value: string, label: string } | null>(null);
    const [citySearch, setCitySearch] = useState('');
    const [phone, setPhone] = useState<string | undefined>('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [utms, setUtms] = useState<any>({});
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const turnstileRef = React.useRef<TurnstileInstance>(null);

    useEffect(() => {
        setUtms(getStoredUTMs());
        const fetchInitialData = async () => {
            try {
                const res = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome');
                const data = await res.json();
                const formatted = data.map((city: any) => {
                    const uf = city.microrregiao?.mesorregiao?.UF?.sigla ||
                        city['regiao-imediata']?.['regiao-intermediaria']?.UF?.sigla ||
                        '';
                    return {
                        value: `${city.nome} - ${uf}`,
                        label: `${city.nome} - ${uf}`
                    };
                });
                setCities(formatted);
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };
        fetchInitialData();
    }, []);

    const displayedCities = useMemo(() => {
        if (!citySearch) return cities.slice(0, 20);
        const search = normalizeText(citySearch);
        return cities
            .filter(city => normalizeText(city.label).includes(search))
            .slice(0, 50);
    }, [cities, citySearch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        if (!name || name.length < 3) {
            setSubmitError('Por favor, insira seu nome completo.');
            setIsSubmitting(false);
            return;
        }

        if (!email || !email.includes('@')) {
            setSubmitError('Por favor, insira um e-mail válido.');
            setIsSubmitting(false);
            return;
        }

        if (!phone || !isValidPhoneNumber(phone)) {
            setSubmitError('Por favor, insira um telefone válido.');
            setIsSubmitting(false);
            return;
        }

        if (!selectedCity) {
            setSubmitError('Por favor, selecione sua cidade.');
            setIsSubmitting(false);
            return;
        }

        try {
            const leadData = {
                name,
                email,
                phone,
                city: selectedCity.value,
                page_url: window.location.href,
                ...utms
            };

            // Server-side submission: Turnstile verification, insert and webhook
            // dispatch all happen in /api/submit-lead (service role).
            const resp = await fetch('/api/submit-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ captchaToken, form_type: 'catalogo', lead: leadData }),
            });
            if (!resp.ok) {
                const j = await resp.json().catch(() => ({} as any));
                throw new Error(j.error || 'Erro ao enviar. Tente novamente.');
            }

            localStorage.setItem('krenke_catalog_authorized', 'true');
            onSuccess();
        } catch (err: any) {
            setSubmitError('Erro ao processar: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl mx-auto bg-white rounded-[2.5rem] shadow-premium overflow-hidden p-8 md:p-12 border border-slate-100"
        >
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-orange-50 text-vibrant-orange rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <User size={32} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter"><TranslatableText>Identifique-se para acessar</TranslatableText></h2>
                <p className="text-gray-500 font-medium text-sm mt-2"><TranslatableText>Preencha os dados abaixo para liberar o catálogo completo.</TranslatableText></p>
            </div>

            <form id="form_cat" onSubmit={handleSubmit} className="space-y-6 text-left">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 flex items-center gap-2">
                        <User size={12} /> <TranslatableText>Nome Completo</TranslatableText>
                    </label>
                    <input
                        id="form-catalog-name"
                        name="form_fields[name]"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Seu Nome"
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-vibrant-orange rounded-xl outline-none font-bold text-gray-900 transition-all"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 flex items-center gap-2">
                        <Mail size={12} /> <TranslatableText>E-mail Corporativo</TranslatableText>
                    </label>
                    <input
                        type="email"
                        id="form-catalog-email"
                        name="form_fields[email]"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="exemplo@empresa.com.br"
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-vibrant-orange rounded-xl outline-none font-bold text-gray-900 transition-all"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 flex items-center gap-2">
                        <Phone size={12} /> <TranslatableText>WhatsApp</TranslatableText>
                    </label>
                    <PhoneInput
                        international
                        defaultCountry="BR"
                        value={phone}
                        onChange={setPhone}
                        name="form_fields[telefone]"
                        placeholder="(00) 00000-0000"
                        inputComponent={CustomPhoneInput}
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus-within:border-vibrant-purple rounded-xl outline-none font-bold text-gray-900 transition-all flex items-center gap-3"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 flex items-center gap-2">
                        <MapPin size={12} /> <TranslatableText>Cidade</TranslatableText>
                    </label>
                    <Select
                        name="form_fields[cidade]"
                        options={displayedCities}
                        value={selectedCity}
                        onChange={setSelectedCity}
                        onInputChange={setCitySearch}
                        placeholder="Selecione sua cidade..."
                        filterOption={() => true}
                        styles={{
                            control: (base) => ({
                                ...base,
                                padding: '0.4rem',
                                borderRadius: '0.75rem',
                                border: '2px solid transparent',
                                backgroundColor: '#f8fafc',
                                fontWeight: '700',
                                boxShadow: 'none',
                                '&:hover': { borderColor: '#fe6b01' }
                            }),
                            option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isSelected ? '#fe6b01' : state.isFocused ? '#fff7ed' : 'white',
                                color: state.isSelected ? 'white' : '#111827',
                                fontWeight: '700'
                            })
                        }}
                    />
                </div>

                {submitError && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold text-center border border-red-100">
                        <TranslatableText>{submitError}</TranslatableText>
                    </div>
                )}

                {/* Turnstile invisible CAPTCHA — token verified server-side in /api/submit-lead */}
                <Turnstile
                    ref={turnstileRef}
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={(token) => setCaptchaToken(token)}
                    onExpire={() => { setCaptchaToken(null); turnstileRef.current?.reset(); }}
                    options={{ size: 'flexible' }}
                />

                <button
                    type="submit"
                    id="form-catalog-submit"
                    disabled={isSubmitting || !name || !email || !phone || !selectedCity}
                    className="w-full bg-slate-900 py-6 rounded-2xl text-white font-black uppercase tracking-widest hover:bg-vibrant-orange transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-vibrant-orange/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                    {isSubmitting ? <TranslatableText>PROCESSANDO...</TranslatableText> : <TranslatableText>ACESSAR AGORA</TranslatableText>}
                </button>
            </form>
        </motion.div>
    );
};

// Wrapper para PDFs exportados com páginas espelhadas (Spreads)
const SplitPageWrapper = forwardRef<HTMLDivElement, any>((props, ref) => {
    const { pageNumber, side, width, isSingle, ...rest } = props;

    return (
        <div ref={ref} {...rest} className="bg-white overflow-hidden relative">
            <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: isSingle ? 0 : (side === 'left' ? 0 : -width),
                width: isSingle ? width : width * 2,
                height: '100%' // Garante altura 100% que espelha o wrapper principal
            }}>
                <Page
                    pageNumber={pageNumber}
                    width={isSingle ? width : width * 2}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                />
            </div>
        </div>
    );
});

SplitPageWrapper.displayName = 'SplitPageWrapper';

const CatalogoPage: React.FC = () => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [hasAccess, setHasAccess] = useState(false);
    const pdfUrl = "/catalogo-krenke-2026.pdf";

    useEffect(() => {
        const authorized = localStorage.getItem('krenke_catalog_authorized') === 'true';
        setHasAccess(authorized);

        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    const bookWidth = 500;
    const bookHeight = 700;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'catalogo-krenke-2026.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-20 overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8 md:mb-16 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-200 border border-slate-300 text-krenke-purple text-xs font-black uppercase tracking-[0.3em] mb-6">
                        <TranslatableText>Mobiliário e Lazer</TranslatableText>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter mb-4 leading-none">
                        <TranslatableText>Catálogo</TranslatableText> <br className="md:hidden" /><span className="text-vibrant-orange"><TranslatableText>Geral 2026</TranslatableText></span>
                    </h1>
                    <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto mb-8">
                        <TranslatableText>Explore a linha completa de playgrounds e estruturas da Krenke.
                        Projetados para inspirar aventuras e garantir a máxima segurança e durabilidade.</TranslatableText>
                    </p>

                    {!hasAccess && (
                        <div className="mt-4">
                            <CatalogLeadForm onSuccess={() => setHasAccess(true)} pdfUrl={pdfUrl} />
                        </div>
                    )}
                </motion.div>

                {hasAccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="w-full flex flex-col items-center justify-center py-2 md:py-6"
                    >
                        {!isMobile ? (
                            <div className="flex justify-center w-full max-w-5xl mx-auto overflow-hidden">
                                <Document
                                    file={pdfUrl}
                                    onLoadSuccess={onDocumentLoadSuccess}
                                    loading={
                                        <div className="flex flex-col items-center gap-4 py-20">
                                            <div className="w-12 h-12 border-4 border-vibrant-orange border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-gray-900 font-black tracking-widest uppercase"><TranslatableText>Carregando PDF...</TranslatableText></p>
                                        </div>
                                    }
                                >
                                    {numPages && (
                                        <div className="w-full drop-shadow-2xl">
                                            {/* @ts-ignore */}
                                            <HTMLFlipBook
                                                width={bookWidth}
                                                height={bookHeight}
                                                size="fixed"
                                                minWidth={bookWidth}
                                                maxWidth={bookWidth}
                                                minHeight={bookHeight}
                                                maxHeight={bookHeight}
                                                maxShadowOpacity={0.5}
                                                showCover={true}
                                                usePortrait={false}
                                                className="mx-auto"
                                                style={{ margin: '0 auto' }}
                                            >
                                                {Array.from(new Array(numPages), (_, index) => {
                                                    const pageIndex = index + 1;
                                                    if (pageIndex === 1) {
                                                        return <SplitPageWrapper key="page_start" pageNumber={pageIndex} width={bookWidth} isSingle={true} />;
                                                    }
                                                    if (pageIndex === numPages) {
                                                        return <SplitPageWrapper key="page_end" pageNumber={pageIndex} width={bookWidth} isSingle={true} />;
                                                    }
                                                    return [
                                                        <SplitPageWrapper key={`page_${pageIndex}_left`} pageNumber={pageIndex} side="left" width={bookWidth} isSingle={false} />,
                                                        <SplitPageWrapper key={`page_${pageIndex}_right`} pageNumber={pageIndex} side="right" width={bookWidth} isSingle={false} />
                                                    ];
                                                }).flat()}
                                            </HTMLFlipBook>
                                        </div>
                                    )}
                                </Document>
                            </div>
                        ) : (
                            <div className="w-full max-w-sm mx-auto bg-white p-8 rounded-[2rem] shadow-premium text-center">
                                <div className="w-20 h-20 bg-orange-50 text-vibrant-orange rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Download size={40} />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 uppercase mb-2"><TranslatableText>Acesso Liberado!</TranslatableText></h3>
                                <p className="text-gray-500 font-medium mb-8"><TranslatableText>Clique no botão abaixo para baixar a versão completa em PDF.</TranslatableText></p>
                                <button
                                    id="btn-catalog-download-mobile"
                                    onClick={handleDownload}
                                    className="w-full bg-vibrant-orange hover:bg-orange-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-vibrant-orange/20"
                                >
                                    <TranslatableText>Baixar PDF (16MB)</TranslatableText>
                                </button>
                            </div>
                        )}

                        {!isMobile && (
                            <div className="flex justify-center mt-12 w-full">
                                <button
                                    id="btn-catalog-download-desktop"
                                    onClick={handleDownload}
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-krenke-purple text-white rounded-full font-black uppercase text-xs tracking-widest shadow-xl transition-all"
                                >
                                    <Download size={18} /> <TranslatableText>Baixar PDF Completo</TranslatableText>
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default CatalogoPage;
