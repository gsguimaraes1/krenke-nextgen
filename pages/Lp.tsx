import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Star, ChevronLeft, ChevronRight, X, Menu, Phone, Mail, MapPin, Instagram, Youtube } from 'lucide-react';
import heroVideo from '../assets/Home/videokrenke.mp4';
import { WhatsAppWidget } from '../components/WhatsAppWidget';

const LP_BASE = 'https://lp.krenke.com.br/wp-content/uploads/2026/04';
const WA_NUMBER = '554733730693';

function getUTMs() {
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source: p.get('utm_source') || '',
    utm_medium: p.get('utm_medium') || '',
    utm_campaign: p.get('utm_campaign') || '',
    utm_term: p.get('utm_term') || '',
    utm_content: p.get('utm_content') || '',
  };
}

const GALLERY_IMAGES = Array.from({ length: 32 }, (_, i) => ({
  src: `${LP_BASE}/${73 + i}-1.webp`,
  alt: `Playground Krenke ${73 + i}`,
}));

const PRODUCT_LINES = [
  {
    img: `${LP_BASE}/5-10.webp`,
    title: 'Playground Padrão',
    desc: 'Modelos prontos com diferentes composições para acelerar a escolha e facilitar a implantação.',
    color: '#F39200',
  },
  {
    img: `${LP_BASE}/98-1.webp`,
    title: 'Brinquedos Avulsos',
    desc: 'Complete ou monte seu espaço com itens de alta procura, como tobogãs e balanços.',
    color: '#7F2082',
  },
  {
    img: `${LP_BASE}/32-1.webp`,
    title: 'Linha Aquática',
    desc: 'Soluções adaptadas para piscinas rasas, levando diversão com segurança para áreas molhadas.',
    color: '#009FE3',
  },
  {
    img: `${LP_BASE}/80-1.webp`,
    title: 'Projetos Personalizados',
    desc: 'Ajuste altura, brinquedos, cores e composição para criar um projeto alinhado ao seu espaço.',
    color: '#312783',
  },
];

const BENEFITS = [
  {
    title: 'Entrega segurança no uso diário',
    desc: 'Sem quinas e com arestas arredondadas, nossos produtos evitam riscos e transmitem confiança.',
  },
  {
    title: 'Atrai famílias e usuários',
    desc: 'Um espaço de lazer bem planejado aumenta o interesse e fortalece o apelo do ambiente.',
  },
  {
    title: 'Valoriza o empreendimento ou instituição',
    desc: 'O playground deixa o local mais completo, convidativo e mais relevante para o público.',
  },
  {
    title: 'Resiste melhor ao tempo e à rotina intensa',
    desc: 'Materiais robustos e tecnologia contra desbotamento preservam a aparência por mais tempo.',
  },
  {
    title: 'Se adapta ao seu projeto',
    desc: 'As configurações personalizadas permitem encaixar o playground na área disponível e no objetivo do cliente.',
  },
  {
    title: 'Amplia a percepção do investimento',
    desc: 'Quem compra enxerga mais valor quando o produto une durabilidade, acabamento e suporte na entrega.',
  },
];

const BENEFITS_IMAGES = [
  `${LP_BASE}/16-1.webp`,
  `${LP_BASE}/17-1.webp`,
  `${LP_BASE}/18-1.webp`,
  `${LP_BASE}/19-1.webp`,
];

const CREDENTIALS = [
  {
    img: `${LP_BASE}/certificado.svg`,
    title: 'Certificação de Segurança e Qualidade',
    desc: 'Conformidade técnica com a ABNT para garantir a segurança de usuários e respaldar a escolha na hora da compra.',
    bg: '#F39200',
    dark: false,
  },
  {
    img: `${LP_BASE}/ecologico.svg`,
    title: 'Materiais Ecológicos',
    desc: 'O uso de plástico reciclado, rotomoldados e madeira plástica reforça a durabilidade do produto com preocupação ambiental.',
    bg: '#1A6B5C',
    dark: false,
  },
  {
    img: `${LP_BASE}/durabilidade.svg`,
    title: 'Durabilidade que Mantém a Boa Aparência',
    desc: 'A tecnologia com filtro verde no polietileno ajuda a desacelerar o desbotamento e preserva o visual do playground por mais tempo.',
    bg: '#FFFFFF',
    dark: true,
  },
  {
    img: `${LP_BASE}/deslizar.svg`,
    title: 'Entrega e Montagem com Suporte Especializado',
    desc: 'A empresa trabalha com montagem própria e também por revendas, facilitando a implantação conforme o contrato e o perfil do projeto.',
    bg: '#009FE3',
    dark: false,
  },
];

const TESTIMONIALS = [
  {
    name: 'Ana Paula Ferreira',
    role: 'Gestora de Condomínio',
    city: 'Florianópolis, SC',
    stars: 5,
    text: 'A qualidade dos brinquedos da Krenke surpreendeu a todos aqui no condomínio. Passados 2 anos, parecem novos. O suporte no pós-venda também foi excelente.',
  },
  {
    name: 'Marcos Oliveira',
    role: 'Diretor de Hotel',
    city: 'Balneário Camboriú, SC',
    stars: 5,
    text: 'Contratamos um projeto personalizado para a área kids do resort e ficou incrível. As crianças adoram e os pais ficam tranquilos com a segurança do espaço.',
  },
  {
    name: 'Carla Mendonça',
    role: 'Coordenadora Pedagógica',
    city: 'Joinville, SC',
    stars: 5,
    text: 'Escolhemos a Krenke para equipar o parquinho da escola e não nos arrependemos. Produto certificado, entrega no prazo e montagem profissional.',
  },
];

const STATES = [
  { uf: 'AC', name: 'Acre' }, { uf: 'AL', name: 'Alagoas' }, { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' }, { uf: 'BA', name: 'Bahia' }, { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' }, { uf: 'ES', name: 'Espírito Santo' }, { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' }, { uf: 'MT', name: 'Mato Grosso' }, { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' }, { uf: 'PA', name: 'Pará' }, { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' }, { uf: 'PE', name: 'Pernambuco' }, { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' }, { uf: 'RN', name: 'Rio Grande do Norte' }, { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' }, { uf: 'RR', name: 'Roraima' }, { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' }, { uf: 'SE', name: 'Sergipe' }, { uf: 'TO', name: 'Tocantins' },
];

const normalizeText = (t: string) =>
  t ? t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase() : '';

const SEGMENTOS = [
  'Hotel / Resort',
  'Condomínio',
  'Escola Privada',
  'Prefeitura / Órgão Público',
  'Shopping / Área Comercial',
  'Clínica / Hospital',
  'Construtora',
  'Licitação',
  'Outros',
];

const WA_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);


// ─── Gallery Carousel ─────────────────────────────────────────────────────────
function GalleryCarousel() {
  const [offset, setOffset] = useState(0);
  const ITEM_W = 220;
  const total = GALLERY_IMAGES.length;

  useEffect(() => {
    const id = setInterval(() => setOffset(o => (o + 1) % total), 2500);
    return () => clearInterval(id);
  }, [total]);

  function prev() { setOffset(o => (o - 1 + total) % total); }
  function next() { setOffset(o => (o + 1) % total); }

  const visible = [...GALLERY_IMAGES, ...GALLERY_IMAGES].slice(offset, offset + 7);

  return (
    <div className="relative overflow-hidden">
      <div className="flex gap-3 transition-transform duration-500">
        {visible.map((img, i) => (
          <div key={i} className="flex-shrink-0 rounded-2xl overflow-hidden" style={{ width: ITEM_W, height: 220 }}>
            <img src={img.src} alt={img.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
          </div>
        ))}
      </div>
      <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#312783] rounded-full p-2 shadow-lg transition-all z-10">
        <ChevronLeft size={20} />
      </button>
      <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#312783] rounded-full p-2 shadow-lg transition-all z-10">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

// ─── Benefits Image Carousel ──────────────────────────────────────────────────
function BenefitsImages() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive(a => (a + 1) % BENEFITS_IMAGES.length), 3500);
    return () => clearInterval(id);
  }, []);

  const thumbs = BENEFITS_IMAGES.filter((_, i) => i !== active);

  return (
    <div>
      <div className="rounded-2xl overflow-hidden mb-3" style={{ height: 280 }}>
        <img
          src={BENEFITS_IMAGES[active]}
          alt="Playground Krenke"
          className="w-full h-full object-cover transition-all duration-500"
          loading="lazy"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {thumbs.map((src, i) => (
          <div
            key={src}
            className="rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            style={{ height: 90 }}
            onClick={() => setActive(BENEFITS_IMAGES.indexOf(src))}
          >
            <img src={src} alt="Playground Krenke" className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main LP Page ─────────────────────────────────────────────────────────────
export default function LpPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ nome: '', telefone: '', segmento: '', email: '', tipo_cliente: '', mensagem: '' });
  const [uf, setUf] = useState('');
  const [city, setCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!uf) { setCities([]); setCity(''); return; }
    setLoadingCities(true);
    setCity('');
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
      .then(r => r.json())
      .then((data: any[]) => setCities(data.map((m: any) => m.nome)))
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false));
  }, [uf]);

  function maskPhone(v: string) {
    v = v.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) return v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    if (v.length > 6) return v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    if (v.length > 2) return v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    return v.length ? `(${v}` : v;
  }

  function field(k: keyof typeof formData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val = k === 'telefone' ? maskPhone(e.target.value) : e.target.value;
      setFormData(f => ({ ...f, [k]: val }));
    };
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    const utms = getUTMs();
    const payload = {
      Nome: formData.nome,
      Telefone: formData.telefone,
      Segmento: formData.segmento,
      Email: formData.email,
      TipoCliente: formData.tipo_cliente,
      Mensagem: formData.mensagem,
      city: city,
      state: uf,
      city_full: city ? `${city} - ${uf}` : '',
      ...utms,
      Data: new Date().toLocaleDateString('pt-BR'),
      Horário: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      form_id: 'lp_main_form',
      form_name: 'LP Principal React',
    };
    try {
      await Promise.allSettled([
        fetch('https://n8n.krenke.com.br/webhook/leads-landingpage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }),
        fetch('https://n8n.krenke.com.br/webhook-test/leads-landingpage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }),
      ]);
      if ((window as any).dataLayer) (window as any).dataLayer.push({ event: 'form_submit_lp' });
      if ((window as any).fbq) (window as any).fbq('track', 'Lead');
      window.location.href = '/obrigado';
    } catch {
      setSubmitError('Erro ao enviar. Tente pelo WhatsApp.');
      setSubmitting(false);
    }
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  }

  const navLinks = [
    { label: 'Brinquedos', id: 'brinquedos' },
    { label: 'Benefícios', id: 'beneficios' },
    { label: 'Depoimentos', id: 'depoimentos' },
    { label: 'Sobre nós', id: 'sobre' },
    { label: 'Contato', id: 'form' },
  ];

  const inputCls = 'w-full border border-white/20 bg-white/10 focus:bg-white/15 focus:border-white/40 rounded-xl px-4 py-3 text-sm outline-none transition-colors text-white placeholder-white/50 font-medium';
  const selectCls = (val: string) => `${inputCls} ${!val ? 'text-white/50' : 'text-white'} [&>option]:text-gray-900 [&>option]:bg-white`;

  return (
    <>
      <Helmet>
        <title>Krenke Brinquedos | Playgrounds Seguros e Personalizados</title>
        <meta name="description" content="Encante crianças e famílias com playgrounds seguros, robustos e personalizados. Desde 1987 a Krenke é líder nacional em brinquedos pedagógicos." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[#312783] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <img
            src={`${LP_BASE}/logokrenke.webp`}
            alt="Krenke Brinquedos"
            className="h-10 w-auto brightness-0 invert"
          />
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="text-white hover:text-[#F39200] text-sm font-semibold transition-colors"
              >
                {l.label}
              </button>
            ))}
          </nav>
          <button className="md:hidden text-white p-2" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#312783] border-t border-white/10 overflow-hidden"
            >
              <div className="px-4 py-4 flex flex-col gap-3">
                {navLinks.map(l => (
                  <button key={l.id} onClick={() => scrollTo(l.id)}
                    className="text-white hover:text-[#F39200] text-left text-sm font-semibold py-1 transition-colors"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero ── */}
      <section className="relative w-full min-h-[85vh] bg-[#312783] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60 scale-105">
            <source src={heroVideo} type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#312783]/70 via-[#312783]/50 to-[#312783]/70 z-10" />
        <div className="absolute bottom-0 left-0 w-full overflow-hidden z-10" style={{ height: 60 }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,0 C360,60 1080,60 1440,0 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>

        <div className="relative z-20 max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight uppercase mb-6">
              Encante crianças e famílias com{' '}
              <span className="text-[#F39200]">playgrounds seguros, robustos e personalizados!</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto font-medium mb-10">
              A Krenke desenvolve playgrounds modulares e brinquedos para áreas externas e internas,
              atendendo escolas, hotéis, resorts, restaurantes, casas e condomínios.
            </p>
            <button
              onClick={() => scrollTo('form')}
              className="px-10 py-4 bg-[#F39200] hover:bg-orange-500 text-white font-black text-lg rounded-full shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-3 uppercase tracking-wide"
            >
              {WA_SVG}
              Entre em contato
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Product Lines ── */}
      <section id="brinquedos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-[#312783] uppercase leading-tight">
              Linhas desenvolvidas para
            </h2>
            <h2 className="text-3xl md:text-4xl font-black uppercase leading-tight" style={{ color: '#F39200' }}>
              diferentes espaços, necessidades e projetos:
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCT_LINES.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-3xl overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100"
                onClick={() => scrollTo('form')}
              >
                <div className="h-52 overflow-hidden bg-gray-50">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 text-center text-white" style={{ backgroundColor: p.color }}>
                  <h3 className="text-base font-black uppercase tracking-wide mb-1 leading-tight">{p.title}</h3>
                  <p className="text-xs leading-relaxed text-white/90">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => scrollTo('form')}
              className="px-10 py-4 text-white font-black text-base rounded-full shadow-xl hover:scale-105 hover:shadow-2xl transition-all inline-flex items-center gap-3 uppercase tracking-wide"
              style={{ background: 'linear-gradient(135deg, #F39200 0%, #FF6B00 100%)' }}
            >
              {WA_SVG}
              Encontrar a linha ideal para meu projeto
            </button>
          </div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="py-10 bg-gray-50 overflow-hidden">
        <div className="max-w-full px-4">
          <GalleryCarousel />
        </div>
      </section>

      {/* ── Benefits ── */}
      <section id="beneficios" className="py-20 bg-[#312783] relative">
        <div className="absolute top-0 left-0 w-full overflow-hidden" style={{ height: 50 }}>
          <svg viewBox="0 0 1440 50" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,50 C360,0 1080,0 1440,50 L1440,0 L0,0 Z" fill="#f9fafb" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ height: 50 }}>
          <svg viewBox="0 0 1440 50" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,0 C360,50 1080,50 1440,0 L1440,50 L0,50 Z" fill="white" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: text list */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-8">
                Por que investir em um{' '}
                <span className="text-[#F39200]">Playground da Krenke:</span>
              </h2>
              <div className="space-y-5">
                {BENEFITS.map((b, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#F39200] flex-shrink-0 mt-2" />
                    <div>
                      <p className="text-[#F39200] font-black text-sm uppercase tracking-wide">{b.title}</p>
                      <p className="text-white/80 text-sm leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <button
                  onClick={() => scrollTo('form')}
                  className="px-8 py-4 bg-[#F39200] hover:bg-orange-500 text-white font-black text-base rounded-full shadow-lg hover:scale-105 transition-all inline-flex items-center gap-3 uppercase tracking-wide"
                >
                  {WA_SVG}
                  Consulte-nos pelo WhatsApp
                </button>
              </div>
            </motion.div>

            {/* Right: image carousel */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <BenefitsImages />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 40 Anos ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black">
              <span className="text-[#312783]">40 Anos de mercado</span>{' '}
              <span className="text-gray-800">oferecendo:</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CREDENTIALS.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-3xl p-6 text-center shadow-md hover:shadow-xl transition-shadow"
                style={{
                  backgroundColor: c.bg,
                  border: c.dark ? '2px solid #e5e7eb' : 'none',
                }}
              >
                <div className="w-16 h-16 mx-auto mb-4">
                  <img src={c.img} alt={c.title} className="w-full h-full object-contain" loading="lazy" />
                </div>
                <h3
                  className="font-black text-sm uppercase tracking-wide mb-2 leading-tight"
                  style={{ color: c.dark ? '#312783' : 'white' }}
                >
                  {c.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: c.dark ? '#4b5563' : 'rgba(255,255,255,0.85)' }}
                >
                  {c.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => scrollTo('form')}
              className="px-8 py-4 bg-[#F39200] hover:bg-orange-500 text-white font-black text-base rounded-full shadow-lg hover:scale-105 transition-all inline-flex items-center gap-3 uppercase tracking-wide"
            >
              {WA_SVG}
              Fale com nossa equipe
            </button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="depoimentos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              O que dizem nossos <span className="text-[#312783]">clientes:</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-8 shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} size={18} className="fill-[#F39200] text-[#F39200]" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div>
                  <p className="font-black text-gray-900">{t.name}</p>
                  <p className="text-sm text-[#312783] font-semibold">{t.role}</p>
                  <p className="text-xs text-gray-400">{t.city}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="sobre" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image left */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <img
                src={`${LP_BASE}/imgsobrekrenke.webp`}
                alt="Krenke Brinquedos - Sobre nós"
                className="w-full rounded-3xl shadow-2xl object-cover max-h-[520px]"
                loading="lazy"
              />
            </motion.div>
            {/* Text right */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-4xl font-black mb-6">
                <span className="text-[#312783]">Sobre a</span>{' '}
                <span className="text-[#F39200]">Krenke Brinquedos</span>
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Somos uma empresa familiar com quase 4 décadas de marca, especializada em playgrounds
                e brinquedos desenvolvidos para entregar segurança, conforto e confiança a quem investe
                em espaços infantis.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Existimos para transformar áreas comuns em ambientes atrativos, funcionais e preparados
                para o uso diário, sempre unindo tradição e inovação para entregar resistência e
                personalização, sem abrir mão da atenção aos detalhes que fazem a diferença.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                Assim, priorizamos as soluções técnicas, duráveis e seguras para respeitar tanto quem
                vai investir quanto quem vai brincar, porque qualidade, compromisso e cuidado é onde
                começa a diversão!
              </p>
              <button
                onClick={() => scrollTo('form')}
                className="px-8 py-4 bg-[#F39200] hover:bg-orange-500 text-white font-black text-base rounded-full shadow-lg hover:scale-105 transition-all inline-flex items-center gap-3 uppercase tracking-wide"
              >
                {WA_SVG}
                Entre em contato
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Map ── */}
      <section className="h-72 w-full bg-gray-200">
        <iframe
          title="Krenke Brinquedos - Localização"
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://maps.google.com/maps?q=krenke%20brinquedos%20R.%20Rodolfo%20Tepasse%2C%20250%20-%20Imigrantes%2C%20Guaramirim%20-%20SC%2C%2089270-000&t=m&z=15&output=embed&iwloc=near"
        />
      </section>

      {/* ── Contact + Form ── */}
      <section id="form" className="py-20 bg-[#312783]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: contact info */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight uppercase">
                Receba um atendimento
              </h2>
              <h2 className="text-3xl md:text-4xl font-black text-[#F39200] mb-6 leading-tight uppercase">
                mais ágil para o seu projeto!
              </h2>
              <p className="text-white/80 text-base mb-8">
                Chame no WhatsApp ou deixe seu contato logo abaixo:
              </p>
              <ul className="space-y-4">
                <li>
                  <a href="https://www.instagram.com/krenkebrinquedos/" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white/90 hover:text-[#F39200] transition-colors group"
                  >
                    <Instagram size={20} className="text-[#F39200] flex-shrink-0" />
                    <span className="text-sm font-semibold">krenkebrinquedos</span>
                  </a>
                </li>
                <li>
                  <a href="tel:4733730693"
                    className="flex items-center gap-3 text-white/90 hover:text-[#F39200] transition-colors group"
                  >
                    <Phone size={20} className="text-[#F39200] flex-shrink-0" />
                    <span className="text-sm font-semibold">(47) 3373-0693</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:comercial06@krenke.com.br"
                    className="flex items-center gap-3 text-white/90 hover:text-[#F39200] transition-colors group"
                  >
                    <Mail size={20} className="text-[#F39200] flex-shrink-0" />
                    <span className="text-sm font-semibold">comercial06@krenke.com.br</span>
                  </a>
                </li>
                <li>
                  <div className="flex items-start gap-3 text-white/90">
                    <MapPin size={20} className="text-[#F39200] flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold">Matriz: Rodolfo Tepassé, 250 – Imigrantes - Guaramirim | SC</span>
                  </div>
                </li>
                <li>
                  <a href="https://www.youtube.com/@KrenkeBrinquedos" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white/90 hover:text-[#F39200] transition-colors group"
                  >
                    <Youtube size={20} className="text-[#F39200] flex-shrink-0" />
                    <span className="text-sm font-semibold">KrenkeBrinquedos</span>
                  </a>
                </li>
              </ul>
            </motion.div>

            {/* Right: form */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/15">
                <p className="text-white font-bold text-base mb-6">Preencha os campos para ser atendido.</p>
                <form id="form-lp" onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1 uppercase tracking-wide">Nome</label>
                      <input
                        id="form-quote-name"
                        name="form_lp_nome"
                        className={inputCls}
                        placeholder="Nome completo"
                        value={formData.nome} onChange={field('nome')} required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1 uppercase tracking-wide">Telefone</label>
                      <input
                        id="form-quote-phone"
                        name="form_lp_telefone"
                        className={inputCls}
                        placeholder="(00) 00000-0000"
                        value={formData.telefone} onChange={field('telefone')} required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1 uppercase tracking-wide">E-mail</label>
                    <input
                      id="form-quote-email"
                      name="form_lp_email"
                      type="email"
                      className={inputCls}
                      placeholder="seu@email.com"
                      value={formData.email} onChange={field('email')} required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1 uppercase tracking-wide">Estado</label>
                      <select
                        id="form-lp-state"
                        name="form_lp_estado"
                        className={selectCls(uf)}
                        value={uf}
                        onChange={e => setUf(e.target.value)}
                        required
                      >
                        <option value="" disabled>Selecione o estado</option>
                        {STATES.map(s => <option key={s.uf} value={s.uf}>{s.name} — {s.uf}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1 uppercase tracking-wide">Cidade</label>
                      <select
                        id="form-lp-city"
                        name="form_lp_cidade"
                        className={`${selectCls(city)} disabled:opacity-50 disabled:cursor-not-allowed`}
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        required
                        disabled={!uf || loadingCities}
                      >
                        <option value="" disabled>
                          {loadingCities ? 'Carregando...' : !uf ? 'Selecione o estado primeiro' : 'Selecione a cidade'}
                        </option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1 uppercase tracking-wide">Tipo de Cliente</label>
                    <select
                      id="form-quote-client-type"
                      name="form_lp_tipo_cliente"
                      className={selectCls(formData.tipo_cliente)}
                      value={formData.tipo_cliente} onChange={field('tipo_cliente')} required
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="Pessoa Física">Pessoa Física</option>
                      <option value="Pessoa Jurídica">Pessoa Jurídica</option>
                      <option value="Órgão Público">Órgão Público</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1 uppercase tracking-wide">Segmento</label>
                    <select
                      id="form-quote-segment"
                      name="form_lp_segmento"
                      className={selectCls(formData.segmento)}
                      value={formData.segmento} onChange={field('segmento')} required
                    >
                      <option value="">Selecione um segmento</option>
                      {SEGMENTOS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1 uppercase tracking-wide">Mensagem</label>
                    <textarea
                      id="form-quote-message"
                      name="form_lp_mensagem"
                      className={`${inputCls} resize-none`}
                      placeholder="Como podemos te ajudar?"
                      rows={3}
                      value={formData.mensagem} onChange={field('mensagem') as any}
                    />
                  </div>

                  {submitError && (
                    <p className="text-red-300 text-sm font-semibold">{submitError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !uf || !city}
                    className="w-full py-4 bg-[#F39200] hover:bg-orange-500 disabled:opacity-60 text-white font-black text-base rounded-full shadow-lg transition-all flex items-center justify-center gap-3 uppercase tracking-wide"
                  >
                    {submitting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {WA_SVG}
                        Ir para o WhatsApp
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#312783] border-t border-white/10 py-6 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <img src={`${LP_BASE}/logokrenke.webp`} alt="Krenke Brinquedos" className="h-8 w-auto brightness-0 invert" />
          <p className="text-white/60 text-sm">
            Todos os direitos reservados © Krenke Brinquedos Pedagógicos LTDA 2026
          </p>
          <p className="text-white/60 text-sm">
            <span className="font-black text-white/80">CNPJ:</span> 80.125.305/0001-69
          </p>
        </div>
      </footer>

      <WhatsAppWidget />
    </>
  );
}
