import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Search, Loader2, Send, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { getStoredUTMs } from '../lib/utm-tracker';
import { useNavigate } from 'react-router-dom';


const normalizeText = (text: string) =>
  text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

const writeCookie = (name: string, value: string) => {
  if (!value) return;
  // expire legacy hostOnly cookie (written before domain fix)
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 UTC; path=/; SameSite=Lax`;
  const exp = new Date();
  exp.setFullYear(exp.getFullYear() + 1);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${exp.toUTCString()}; path=/; domain=.krenke.com.br; SameSite=Lax`;
};

const CustomPhoneInput = React.forwardRef<HTMLInputElement, any>((props, ref) => (
  <input
    {...props}
    id="form-quote-phone"
    ref={ref}
    className="w-full bg-transparent outline-none font-black text-gray-900 placeholder:text-gray-300"
  />
));

const QuoteForm: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('krenke_quote_cart');
      if (saved) {
        return JSON.parse(saved);
      }
      const params = new URLSearchParams(window.location.search);
      const urlProduct = params.get('produto');
      return urlProduct ? [urlProduct] : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('krenke_quote_cart', JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // New fields
  const [phone, setPhone] = useState<string | undefined>('');
  const [segment, setSegment] = useState<string>('');
  const [otherSegment, setOtherSegment] = useState<string>('');
  const [siteSettings, setSiteSettings] = useState<any[]>([]);
  const [utms, setUtms] = useState<any>({});
  const [clientType, setClientType] = useState<string>('');
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    setUtms(getStoredUTMs());
  }, []);


  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        // Fetch products, cities and site settings in parallel
        const [productsRes, settingsRes] = await Promise.all([
          supabase.from('products').select('*').order('name', { ascending: true }),
          supabase.from('site_settings').select('*')
        ]);

        // Handle Products
        if (!productsRes.error) {
          setProducts(productsRes.data || []);
        }

        // Handle Settings (Webhooks)
        if (!settingsRes.error && settingsRes.data) {
          setSiteSettings(settingsRes.data);
        }

      } catch (err) {
        console.error('Error fetching initial data:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const filteredProducts = useMemo(() => {
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return [
      ...filtered.filter(p => selectedProducts.includes(p.id)),
      ...filtered.filter(p => !selectedProducts.includes(p.id)),
    ];
  }, [products, searchTerm, selectedProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot security check
    if (honeypot) {
      console.warn('Bot detected');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const finalSegment = segment === 'outros' ? otherSegment : segment;
    const data = {
      name: (formData.get('form_orc_name') as string || '').trim(),
      phone: phone || '',
      email: (formData.get('form_orc_email') as string || '').trim().toLowerCase(),
      client_type: clientType,
      segment: finalSegment,
      message: (formData.get('form_orc_mensagem') as string || '').trim(),
      products: selectedProducts.map(id => products.find(p => p.id === id)?.name || id),
      source: 'Site Krenke - Orçamento',
      submitted_at: new Date().toISOString(),
      ...utms
    };


    // Basic Validation
    if (!data.name || data.name.length < 3) {
      setSubmitError('Por favor, insira seu nome completo (mínimo 3 caracteres).');
      setIsSubmitting(false);
      return;
    }

    if (!data.email || !data.email.includes('@')) {
      setSubmitError('Por favor, insira um e-mail válido.');
      setIsSubmitting(false);
      return;
    }

    if (!phone || !isValidPhoneNumber(phone)) {
      setSubmitError('Por favor, insira um telefone/WhatsApp válido.');
      setIsSubmitting(false);
      return;
    }

    if (!clientType) {
      setSubmitError('Por favor, selecione o tipo de cliente.');
      setIsSubmitting(false);
      return;
    }

    if (!data.segment) {
      setSubmitError('Por favor, selecione seu segmento.');
      setIsSubmitting(false);
      return;
    }

    if (selectedProducts.length === 0) {
      setSubmitError('Por favor, selecione ao menos um produto para o orçamento.');
      setIsSubmitting(false);
      return;
    }

    try {
      setSubmitError(null);
      setSubmitSuccess(false);

      // Write cookies with precise IBGE data — overwrites Stape geo (less accurate)
      // Also persists lead data for cross-page remarketing audiences
      const eventId = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      writeCookie('ck_email', data.email);
      writeCookie('ck_phone', data.phone);
      writeCookie('ck_first_name', data.name.split(' ')[0].toLowerCase());
      writeCookie('ck_event_id', eventId);

      const { error } = await supabase.from('leads').insert([data]);
      if (error) throw error;

      /* GTM evento lead_orcamento — desativado
      (window as any).dataLayer = (window as any).dataLayer || [];
      const phoneRaw = data.phone.replace(/\D/g, '');
      const phoneFormatted = phoneRaw.startsWith('55') ? phoneRaw : '55' + phoneRaw;
      (window as any).dataLayer.push({
        event: 'lead_orcamento',
        event_id: eventId,
        lead_name: data.name,
        lead_first_name: data.name.split(' ')[0].toLowerCase(),
        lead_email: data.email,
        lead_phone: phoneFormatted,
        lead_segment: data.segment,
        lead_client_type: data.client_type,
        lead_message: data.message,
        lead_products: data.products.join(', '),
        lead_source: data.source,
      });
      */

      setSubmitSuccess(true);
      navigate('/obrigado');

      // SEND TO WEBHOOK
      const mode = siteSettings.find(s => s.key === 'webhook_mode')?.value || 'test';
      const webhookUrl = mode === 'prod'
        ? siteSettings.find(s => s.key === 'webhook_prod_url')?.value
        : siteSettings.find(s => s.key === 'webhook_test_url')?.value;

      if (webhookUrl) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            form_type: 'orcamento',
            name: data.name,
            email: data.email,
            phone: data.phone,
            client_type: data.client_type,
            segment: data.segment,
            message: data.message,
            products: Array.isArray(data.products) ? data.products.join(', ') : '',
            source: 'Site Krenke - Orçamento',
            submitted_at: new Date().toISOString(),
            utm_source: data.utm_source || '',
            utm_medium: data.utm_medium || '',
            utm_campaign: data.utm_campaign || '',
            utm_term: data.utm_term || '',
            utm_content: data.utm_content || '',
            utm_id: (data as any).utm_id || '',
          })
        }).catch(e => console.error('Webhook error:', e));
      }

      setSelectedProducts([]);
      localStorage.removeItem('krenke_quote_cart');
      setPhone('');
      setSegment('');
      setClientType('');
      setOtherSegment('');
      setHoneypot('');
      setNameInput('');
      setEmailInput('');
      setMessageInput('');
      (e.target as HTMLFormElement).reset();

      // Clear success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err: any) {
      setSubmitError('Erro ao enviar: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex justify-center">
      {/* Centralized Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full max-w-4xl bg-white rounded-[3rem] shadow-premium border border-slate-100 overflow-hidden relative"
      >
        {/* Top Energetic Strip */}
        <div className="h-2 w-full bg-gradient-to-r from-vibrant-orange via-vibrant-purple to-vibrant-green bg-[length:200%_auto] animate-gradient-x"></div>

        <div className="p-8 md:p-16">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-6">
              PROPOSTA <span className="text-vibrant-orange">RÁPIDA</span>
            </h2>
            <p className="text-gray-400 font-medium text-lg italic max-w-2xl mx-auto">
              Preencha os dados abaixo para receber um orçamento detalhado em tempo recorde.
            </p>
          </div>

          <form id="form_orc" className="space-y-10" onSubmit={handleSubmit} noValidate>
            {/* Honeypot Field (Security) */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="b_website_url"
                tabIndex={-1}
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
                autoComplete="off"
              />
            </div>

            {/* UTM Hidden Fields */}
            {Object.entries(utms).map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value as string || ''} />
            ))}


            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Identificação</label>
                <input
                  name="form_orc_name"
                  id="form-quote-name"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="Seu Nome Completo"
                  required
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-vibrant-orange rounded-2xl outline-none font-black text-gray-900 transition-all shadow-sm focus:shadow-vibrant-orange"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Telefone / WhatsApp</label>
                <div className="phone-input-container">
                  <PhoneInput
                    international
                    withCountryCallingCode={false}
                    defaultCountry="BR"
                    value={phone}
                    onChange={setPhone}
                    name="form_orc_telefone"
                    placeholder="(00) 00000-0000"
                    inputComponent={CustomPhoneInput}
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus-within:border-vibrant-purple rounded-2xl outline-none font-black text-gray-900 transition-all shadow-sm focus-within:shadow-vibrant-purple flex items-center gap-4"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Tipo de Cliente</label>
                <select
                  id="form-quote-client-type"
                  name="form_orc_tipo_cliente"
                  value={clientType}
                  onChange={(e) => setClientType(e.target.value)}
                  required
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-vibrant-orange rounded-2xl outline-none font-black text-gray-900 transition-all shadow-sm focus:shadow-vibrant-orange appearance-none cursor-pointer"
                >
                  <option value="" disabled>Selecione o tipo</option>
                  <option value="Pessoa Física">Pessoa Física</option>
                  <option value="Pessoa Jurídica">Pessoa Jurídica</option>
                  <option value="Órgão Público">Órgão Público</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Seu E-mail Corporativo</label>
                <input
                  type="email"
                  name="form_orc_email"
                  id="form-quote-email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="exemplo@empresa.com.br"
                  required
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-vibrant-cyan rounded-2xl outline-none font-black text-gray-900 transition-all shadow-sm focus:shadow-vibrant-cyan"
                />
              </div>
            </div>

            <div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Segmento</label>
                <div className="space-y-4">
                  <select
                    id="form-quote-segment"
                    name="form_orc_segmento"
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    required
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-vibrant-orange rounded-2xl outline-none font-black text-gray-900 transition-all shadow-sm focus:shadow-vibrant-orange appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Selecione um segmento</option>
                    <option value="Hotel">Hotel / Resort</option>
                    <option value="Condominio">Condomínio</option>
                    <option value="Escola Privada">Escola Privada</option>
                    <option value="Prefeitura">Prefeitura / Órgão Público (Compra Direta)</option>
                    <option value="Shopping">Shopping / Área Comercial</option>
                    <option value="Clinica">Clínica / Hospital</option>
                    <option value="Construtora">Construtora (Compra Direta)</option>
                    <option value="Licitacao">Licitação</option>
                    <option value="outros">Outros</option>
                  </select>

                  <AnimatePresence>
                    {segment === 'outros' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <input
                          value={otherSegment}
                          id="form-quote-segment-other"
                          onChange={(e) => setOtherSegment(e.target.value)}
                          placeholder="Qual o seu segmento?"
                          required
                          className="w-full px-8 py-5 bg-slate-50 border-2 border-vibrant-orange/30 focus:border-vibrant-orange rounded-2xl outline-none font-black text-gray-900 transition-all shadow-sm mt-2"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>


            {/* Product Selector */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Produtos Desejados</label>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-vibrant-orange">{selectedProducts.length} Selecionados</span>
              </div>

              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-vibrant-orange" size={20} />
                <input
                  id="form-quote-product-search"
                  placeholder="Filtrar por nome ou categoria..."
                  className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent focus:border-vibrant-orange rounded-2xl outline-none font-bold text-gray-900 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-1">
                <AnimatePresence>
                  {filteredProducts.map(product => (
                    <motion.div
                      key={product.id}
                      id={`form-quote-product-card-${product.id}`}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => toggleProduct(product.id)}
                      className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${selectedProducts.includes(product.id) ? 'bg-vibrant-orange/5 border-vibrant-orange shadow-vibrant-orange' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${selectedProducts.includes(product.id) ? 'bg-vibrant-orange text-white' : 'bg-slate-50 text-slate-300'}`}>
                        {selectedProducts.includes(product.id) ? <Check size={20} strokeWidth={3} /> : <Plus size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-xs uppercase tracking-tighter truncate text-gray-900">{product.name}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{product.category}</p>
                      </div>
                      <div className="w-12 h-12 bg-white rounded-lg flex-shrink-0 p-1 border border-slate-50">
                        <img src={product.image} alt="" className="w-full h-full object-contain" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Detalhes do Projeto</label>
              <textarea
                name="form_orc_mensagem"
                id="form-quote-message"
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                rows={4}
                placeholder="Descreva seu espaço, público-alvo ou necessidades específicas..."
                className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-vibrant-orange rounded-2xl outline-none font-bold text-gray-900 transition-all"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              id="form-quote-submit"
              disabled={isSubmitting || !nameInput || !emailInput || !phone || !clientType || !segment || selectedProducts.length === 0 || !messageInput}
              className="w-full bg-vibrant-orange py-8 rounded-[2.5rem] text-white font-black text-xl uppercase tracking-widest transition-all hover:shadow-vibrant-orange flex items-center justify-center gap-6 group overflow-hidden relative disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={24} />}
              {isSubmitting ? 'ENVIANDO...' : 'SOLICITAR PROPOSTA AGORA'}
            </button>

            {/* Status Messages */}
            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-6 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 font-bold text-center text-sm"
                >
                  {submitError}
                </motion.div>
              )}
              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-6 bg-green-50 border-2 border-green-100 rounded-2xl text-green-600 font-bold text-center text-sm"
                >
                  Orçamento solicitado com sucesso! Nossa equipe entrará em contato em breve.
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default QuoteForm;
