import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Star, Quote, X, Menu, Phone, Mail, MapPin, Instagram, Youtube, Award, ShieldCheck, Map } from 'lucide-react';
import heroVideo from '../assets/Home/videokrenke.mp4';
import { WhatsAppWidget } from '../components/WhatsAppWidget';

const LP_BASE = 'https://lp.krenke.com.br/wp-content/uploads/2026/04';

// Paleta oficial Krenke (cores do logo)
const BRAND = {
  purple: '#312783',
  orange: '#F39200',
  cyan: '#009FE3',
  magenta: '#7F2082',
  green: '#008D36',
  pink: '#E6007E',
};

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
    color: BRAND.orange,
  },
  {
    img: `${LP_BASE}/98-1.webp`,
    title: 'Brinquedos Avulsos',
    desc: 'Complete ou monte seu espaço com itens de alta procura, como tobogãs e balanços.',
    color: BRAND.magenta,
  },
  {
    img: `${LP_BASE}/32-1.webp`,
    title: 'Linha Aquática',
    desc: 'Soluções adaptadas para piscinas rasas, levando diversão com segurança para áreas molhadas.',
    color: BRAND.cyan,
  },
  {
    img: `${LP_BASE}/80-1.webp`,
    title: 'Projetos Personalizados',
    desc: 'Ajuste altura, brinquedos, cores e composição para criar um projeto alinhado ao seu espaço.',
    color: BRAND.purple,
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

const BENEFIT_COLORS = [BRAND.orange, BRAND.cyan, BRAND.green, BRAND.magenta, BRAND.pink, BRAND.purple];

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
    bg: BRAND.orange,
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
    bg: BRAND.cyan,
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

// Botão CTA padrão da página (bloco vibrante com sombra dura)
function CtaButton({ children, onClick, className = '' }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#F39200] text-white font-baloo font-bold text-base sm:text-lg rounded-full cursor-pointer transition-all duration-200 shadow-[5px_5px_0_rgba(49,39,131,0.9)] hover:shadow-[7px_7px_0_rgba(49,39,131,0.9)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[2px_2px_0_rgba(49,39,131,0.9)] active:translate-x-0.5 active:translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#312783] ${className}`}
    >
      {children}
    </button>
  );
}

// Chip de rótulo de seção (estilo adesivo)
function SectionChip({ children, color = BRAND.orange, rotate = -2 }: { children: React.ReactNode; color?: string; rotate?: number }) {
  return (
    <span
      className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white mb-4"
      style={{ backgroundColor: color, transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}

// ─── Scroll-driven Assembly Animation ─────────────────────────────────────────
const FRAME_MODULES = import.meta.glob('../assets/lp-animada/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const FRAME_URLS = Object.keys(FRAME_MODULES)
  .sort()
  .map(k => FRAME_MODULES[k]);

const FRAME_COUNT = FRAME_URLS.length;
// Corta a faixa inferior do frame (marca d'água do gerador) ao desenhar no canvas
const CROP_BOTTOM = 0.07;
const FRAME_BG = '#f2f2f2';

const ASSEMBLY_STAGES = [
  {
    color: BRAND.orange,
    rotate: -2,
    title: 'Base robusta',
    desc: 'Pilares em madeira plástica: não apodrecem, não soltam farpas e resistem ao tempo.',
  },
  {
    color: BRAND.cyan,
    rotate: 2,
    title: 'Montagem modular',
    desc: 'Plataformas, painéis, escadas e escorregadores se encaixam conforme o seu projeto.',
  },
  {
    color: BRAND.green,
    rotate: 0,
    title: 'Pronto para encantar!',
    desc: 'Playground completo, seguro e com certificação ABNT.',
  },
];

function AssemblyScroll() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start start', 'end end'],
  });

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || !img.naturalWidth) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const sw = img.naturalWidth;
    const sh = img.naturalHeight * (1 - CROP_BOTTOM);
    // Paisagem: cover (preenche a tela). Retrato: contain (mostra o playground inteiro).
    const scale = w >= h ? Math.max(w / sw, h / sh) : Math.min(w / sw, h / sh);
    const dw = sw * scale;
    const dh = sh * scale;

    ctx.fillStyle = FRAME_BG;
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, sw, sh, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }, []);

  useEffect(() => {
    imagesRef.current = FRAME_URLS.map((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        if (i === frameRef.current) drawFrame(i);
      };
      return img;
    });

    const onResize = () => drawFrame(frameRef.current);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [drawFrame]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const index = Math.max(0, Math.min(FRAME_COUNT - 1, Math.floor(v * FRAME_COUNT)));
    if (index !== frameRef.current) {
      frameRef.current = index;
      requestAnimationFrame(() => drawFrame(index));
    }
  });

  const captionOpacities = [
    useTransform(scrollYProgress, [0.02, 0.1, 0.28, 0.36], [0, 1, 1, 0]),
    useTransform(scrollYProgress, [0.38, 0.46, 0.6, 0.68], [0, 1, 1, 0]),
    useTransform(scrollYProgress, [0.72, 0.8, 1, 1], [0, 1, 1, 1]),
  ];
  const titleOpacity = useTransform(scrollYProgress, [0, 0.05, 0.9, 0.98], [1, 1, 1, 0]);
  const progressBar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  if (FRAME_COUNT === 0) return null;

  return (
    <section id="montagem" ref={wrapRef} className="relative" style={{ height: '400vh', backgroundColor: FRAME_BG }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="block w-full h-full" />

        {/* Título fixo no topo */}
        <motion.div
          style={{ opacity: titleOpacity }}
          className="absolute top-20 sm:top-24 inset-x-0 text-center px-4 pointer-events-none"
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white mb-3 -rotate-2"
            style={{ backgroundColor: BRAND.pink }}
          >
            Role para montar
          </span>
          <h2 className="font-baloo font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#312783] leading-tight">
            Veja seu playground{' '}
            <span className="text-[#F39200]">ganhar forma</span>
          </h2>
        </motion.div>

        {/* Legendas por etapa (cartões adesivos, cor por capítulo) */}
        {ASSEMBLY_STAGES.map((s, i) => (
          <motion.div
            key={s.title}
            style={{ opacity: captionOpacities[i] }}
            className="absolute bottom-14 sm:bottom-16 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl text-center pointer-events-none"
          >
            <div
              className={`inline-block bg-white rounded-3xl px-7 py-5 border-4 ${i === 2 ? 'pointer-events-auto' : ''}`}
              style={{
                borderColor: s.color,
                boxShadow: `7px 7px 0 ${s.color}55`,
                transform: `rotate(${s.rotate}deg)`,
              }}
            >
              <p className="font-baloo font-bold text-lg sm:text-xl" style={{ color: s.color }}>{s.title}</p>
              <p className="text-sm sm:text-base text-gray-700 font-medium">{s.desc}</p>
              {i === 2 && (
                <div className="mt-4">
                  <CtaButton onClick={() => document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' })} className="!px-6 !py-2.5 !text-sm">
                    Quero o meu projeto
                  </CtaButton>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Barra de progresso da montagem */}
        <div className="absolute bottom-0 left-0 w-full h-2 bg-[#312783]/10">
          <motion.div className="h-full rounded-r-full bg-[#F39200]" style={{ width: progressBar }} />
        </div>
      </div>
    </section>
  );
}

// ─── Gallery Marquee ──────────────────────────────────────────────────────────
function GalleryMarquee() {
  const doubled = [...GALLERY_IMAGES, ...GALLERY_IMAGES];
  return (
    <div className="relative overflow-hidden py-2">
      <div className="lp-marquee flex w-max gap-4">
        {doubled.map((img, i) => (
          <div
            key={i}
            className="flex-shrink-0 rounded-3xl overflow-hidden border-4 border-white shadow-lg"
            style={{ width: 230, height: 230 }}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover"
              loading="lazy"
              width={230}
              height={230}
            />
          </div>
        ))}
      </div>
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
      <div
        className="rounded-[1.75rem] overflow-hidden mb-3 border-4 border-white/90"
        style={{ height: 300, boxShadow: '8px 8px 0 rgba(0,0,0,0.2)' }}
      >
        <img
          src={BENEFITS_IMAGES[active]}
          alt="Playground Krenke"
          className="w-full h-full object-cover transition-all duration-500"
          loading="lazy"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {thumbs.map(src => (
          <button
            key={src}
            type="button"
            className="rounded-2xl overflow-hidden cursor-pointer border-2 border-white/60 hover:border-[#F39200] transition-colors"
            style={{ height: 92 }}
            onClick={() => setActive(BENEFITS_IMAGES.indexOf(src))}
            aria-label="Ver foto do playground em destaque"
          >
            <img src={src} alt="Playground Krenke" className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main LP Page ─────────────────────────────────────────────────────────────
export default function LpAnimadaPage() {
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
      form_id: 'lp_animada_form',
      form_name: 'LP Animada React',
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
    { label: 'Montagem', id: 'montagem' },
    { label: 'Brinquedos', id: 'brinquedos' },
    { label: 'Benefícios', id: 'beneficios' },
    { label: 'Depoimentos', id: 'depoimentos' },
    { label: 'Sobre nós', id: 'sobre' },
  ];

  const inputCls = 'w-full bg-gray-50 border-2 border-gray-200 focus:border-[#F39200] focus:bg-white rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors font-medium';
  const selectCls = (val: string) => `${inputCls} cursor-pointer ${!val ? 'text-gray-400' : 'text-gray-900'}`;
  const labelCls = 'block text-xs font-black text-gray-500 mb-1.5 uppercase tracking-wide';

  return (
    <>
      <Helmet>
        <title>Krenke Brinquedos | Playgrounds Seguros e Personalizados</title>
        <meta name="description" content="Encante crianças e famílias com playgrounds seguros, robustos e personalizados. Desde 1987 a Krenke é líder nacional em brinquedos pedagógicos." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&display=swap" rel="stylesheet" />
      </Helmet>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[#312783] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <img
            src={`${LP_BASE}/logokrenke.webp`}
            alt="Krenke Brinquedos"
            className="h-10 w-auto brightness-0 invert"
          />
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="text-white hover:bg-white/10 hover:text-[#F39200] text-sm font-bold px-3 py-2 rounded-full transition-colors cursor-pointer"
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => scrollTo('form')}
              className="ml-3 px-5 py-2 bg-[#F39200] hover:bg-orange-500 text-white font-baloo font-bold text-sm rounded-full transition-colors cursor-pointer"
            >
              Fazer orçamento
            </button>
          </nav>
          <button className="md:hidden text-white p-2 cursor-pointer" onClick={() => setMenuOpen(o => !o)} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}>
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
                    className="text-white hover:text-[#F39200] text-left text-sm font-bold py-1 transition-colors cursor-pointer"
                  >
                    {l.label}
                  </button>
                ))}
                <button
                  onClick={() => scrollTo('form')}
                  className="mt-1 px-5 py-2.5 bg-[#F39200] text-white font-baloo font-bold text-sm rounded-full text-center cursor-pointer"
                >
                  Fazer orçamento
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero ── */}
      <section className="relative w-full min-h-[88vh] bg-[#312783] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-50 scale-105">
            <source src={heroVideo} type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#312783]/80 via-[#312783]/60 to-[#312783]/80 z-10" />

        {/* Formas flutuantes (blocos geométricos da marca) */}
        <div className="absolute top-24 left-[8%] w-16 h-16 rounded-2xl rotate-12 opacity-70 animate-float z-10" style={{ backgroundColor: BRAND.orange }} />
        <div className="absolute top-40 right-[10%] w-12 h-12 rounded-full opacity-60 animate-float z-10" style={{ backgroundColor: BRAND.cyan, animationDelay: '1.2s' }} />
        <div className="absolute bottom-40 left-[14%] w-10 h-10 rounded-full opacity-60 animate-float z-10" style={{ backgroundColor: BRAND.pink, animationDelay: '2s' }} />
        <div className="absolute bottom-52 right-[16%] w-14 h-14 rounded-2xl -rotate-12 opacity-70 animate-float z-10" style={{ backgroundColor: BRAND.green, animationDelay: '0.6s' }} />

        <div className="absolute bottom-0 left-0 w-full overflow-hidden z-10" style={{ height: 70 }}>
          <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,0 C360,70 1080,70 1440,0 L1440,70 L0,70 Z" fill="#f2f2f2" />
          </svg>
        </div>

        <div className="relative z-20 max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-5 py-2 rounded-full bg-[#F39200] text-white text-sm font-black uppercase tracking-widest -rotate-2 mb-6">
              Desde 1987
            </span>
            <h1 className="font-baloo font-extrabold text-4xl sm:text-5xl md:text-6xl text-white leading-[1.1] mb-6">
              Encante crianças e famílias com{' '}
              <span className="text-[#F39200]">playgrounds seguros, robustos e personalizados!</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto font-medium mb-8">
              A Krenke desenvolve playgrounds modulares e brinquedos para áreas externas e internas,
              atendendo escolas, hotéis, resorts, restaurantes, casas e condomínios.
            </p>

            {/* Chips de prova social */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/25 text-white text-sm font-bold">
                <Award size={16} className="text-[#F39200]" /> 40 anos de mercado
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/25 text-white text-sm font-bold">
                <ShieldCheck size={16} className="text-[#F39200]" /> Certificação ABNT
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/25 text-white text-sm font-bold">
                <Map size={16} className="text-[#F39200]" /> Projetos em todo o Brasil
              </span>
            </div>

            <CtaButton onClick={() => scrollTo('form')} className="!text-lg !px-10">
              {WA_SVG}
              Entre em contato
            </CtaButton>
          </motion.div>
        </div>
      </section>

      {/* ── Scroll Assembly Animation ── */}
      <AssemblyScroll />

      {/* ── Product Lines ── */}
      <section id="brinquedos" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <SectionChip color={BRAND.cyan}>Nossas linhas</SectionChip>
            <h2 className="font-baloo font-extrabold text-3xl md:text-5xl text-[#312783] leading-tight">
              Linhas desenvolvidas para{' '}
              <span className="text-[#F39200]">diferentes espaços, necessidades e projetos</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PRODUCT_LINES.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-[1.75rem] overflow-hidden group cursor-pointer bg-white border-4 transition-all duration-300 hover:-translate-y-2"
                style={{ borderColor: p.color, boxShadow: `7px 7px 0 ${p.color}40` }}
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
                  <h3 className="font-baloo font-bold text-lg mb-1 leading-tight">{p.title}</h3>
                  <p className="text-xs leading-relaxed text-white/90">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-14">
            <CtaButton onClick={() => scrollTo('form')}>
              {WA_SVG}
              Encontrar a linha ideal para meu projeto
            </CtaButton>
          </div>
        </div>
      </section>

      {/* ── Gallery (marquee) ── */}
      <section className="py-12 bg-gray-50 overflow-hidden">
        <GalleryMarquee />
      </section>

      {/* ── Benefits ── */}
      <section
        id="beneficios"
        className="py-24 bg-[#312783] relative"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 2px, transparent 2px)',
          backgroundSize: '26px 26px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            {/* Left: benefit blocks */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <SectionChip color={BRAND.orange} rotate={2}>Por que Krenke</SectionChip>
              <h2 className="font-baloo font-extrabold text-3xl md:text-4xl text-white mb-8 leading-tight">
                Por que investir em um{' '}
                <span className="text-[#F39200]">Playground da Krenke</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BENEFITS.map((b, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border-b-4" style={{ borderColor: BENEFIT_COLORS[i % BENEFIT_COLORS.length] }}>
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-baloo font-bold text-sm mb-3"
                      style={{ backgroundColor: BENEFIT_COLORS[i % BENEFIT_COLORS.length] }}
                    >
                      {i + 1}
                    </span>
                    <p className="font-baloo font-bold text-sm text-[#312783] leading-snug mb-1">{b.title}</p>
                    <p className="text-gray-600 text-xs leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <CtaButton onClick={() => scrollTo('form')}>
                  {WA_SVG}
                  Consulte-nos pelo WhatsApp
                </CtaButton>
              </div>
            </motion.div>

            {/* Right: image carousel */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:sticky lg:top-24">
              <BenefitsImages />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 40 Anos ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <SectionChip color={BRAND.green}>Tradição e qualidade</SectionChip>
            <h2 className="font-baloo font-extrabold text-3xl md:text-5xl leading-tight">
              <span className="text-[#312783]">40 anos de mercado</span>{' '}
              <span className="text-[#F39200]">oferecendo:</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CREDENTIALS.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-[1.75rem] p-6 text-center transition-transform duration-300 hover:-translate-y-2"
                style={{
                  backgroundColor: c.bg,
                  border: c.dark ? '4px solid #312783' : '4px solid rgba(255,255,255,0.25)',
                  boxShadow: '7px 7px 0 rgba(49,39,131,0.18)',
                }}
              >
                <div className="w-16 h-16 mx-auto mb-4">
                  <img src={c.img} alt="" className="w-full h-full object-contain" loading="lazy" />
                </div>
                <h3
                  className="font-baloo font-bold text-base mb-2 leading-tight"
                  style={{ color: c.dark ? '#312783' : 'white' }}
                >
                  {c.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: c.dark ? '#4b5563' : 'rgba(255,255,255,0.9)' }}
                >
                  {c.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-14">
            <CtaButton onClick={() => scrollTo('form')}>
              {WA_SVG}
              Fale com nossa equipe
            </CtaButton>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="depoimentos" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <SectionChip color={BRAND.pink} rotate={2}>Depoimentos</SectionChip>
            <h2 className="font-baloo font-extrabold text-3xl md:text-5xl text-[#312783]">
              O que dizem nossos <span className="text-[#F39200]">clientes</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`bg-white rounded-[1.75rem] p-8 border-2 border-gray-100 transition-transform duration-300 hover:-translate-y-1 ${
                  i === 0 ? 'md:-rotate-1' : i === 2 ? 'md:rotate-1' : ''
                }`}
                style={{ boxShadow: '7px 7px 0 rgba(49,39,131,0.12)' }}
              >
                <Quote size={28} className="text-[#F39200] mb-3" aria-hidden="true" />
                <div className="flex gap-1 mb-4" aria-label={`${t.stars} de 5 estrelas`}>
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} size={18} className="fill-[#F39200] text-[#F39200]" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">"{t.text}"</p>
                <div>
                  <p className="font-baloo font-bold text-[#312783]">{t.name}</p>
                  <p className="text-sm text-gray-600 font-semibold">{t.role}</p>
                  <p className="text-xs text-gray-400">{t.city}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="sobre" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image left with offset frame */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="absolute inset-0 rounded-[2rem] rotate-3" style={{ backgroundColor: `${BRAND.orange}33` }} />
              <img
                src={`${LP_BASE}/imgsobrekrenke.webp`}
                alt="Krenke Brinquedos - Sobre nós"
                className="relative w-full rounded-[2rem] object-cover max-h-[520px] border-4 border-white"
                style={{ boxShadow: '10px 10px 0 rgba(49,39,131,0.15)' }}
                loading="lazy"
              />
            </motion.div>
            {/* Text right */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <SectionChip color={BRAND.magenta}>Nossa história</SectionChip>
              <h2 className="font-baloo font-extrabold text-3xl md:text-5xl mb-6 leading-tight">
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
              <CtaButton onClick={() => scrollTo('form')}>
                {WA_SVG}
                Entre em contato
              </CtaButton>
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
      <section
        id="form"
        className="py-24 bg-[#312783]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 2px, transparent 2px)',
          backgroundSize: '26px 26px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            {/* Left: contact info */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <SectionChip color={BRAND.orange}>Fale com a gente</SectionChip>
              <h2 className="font-baloo font-extrabold text-3xl md:text-5xl text-white mb-2 leading-tight">
                Receba um atendimento
              </h2>
              <h2 className="font-baloo font-extrabold text-3xl md:text-5xl text-[#F39200] mb-6 leading-tight">
                mais ágil para o seu projeto!
              </h2>
              <p className="text-white/85 text-base mb-8">
                Chame no WhatsApp ou deixe seu contato logo abaixo:
              </p>
              <ul className="space-y-4">
                <li>
                  <a href="https://www.instagram.com/krenkebrinquedos/" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white/90 hover:text-[#F39200] transition-colors group"
                  >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex-shrink-0">
                      <Instagram size={18} className="text-[#F39200]" />
                    </span>
                    <span className="text-sm font-bold">krenkebrinquedos</span>
                  </a>
                </li>
                <li>
                  <a href="tel:4733730693"
                    className="flex items-center gap-3 text-white/90 hover:text-[#F39200] transition-colors group"
                  >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex-shrink-0">
                      <Phone size={18} className="text-[#F39200]" />
                    </span>
                    <span className="text-sm font-bold">(47) 3373-0693</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:comercial06@krenke.com.br"
                    className="flex items-center gap-3 text-white/90 hover:text-[#F39200] transition-colors group"
                  >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex-shrink-0">
                      <Mail size={18} className="text-[#F39200]" />
                    </span>
                    <span className="text-sm font-bold">comercial06@krenke.com.br</span>
                  </a>
                </li>
                <li>
                  <div className="flex items-center gap-3 text-white/90">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex-shrink-0">
                      <MapPin size={18} className="text-[#F39200]" />
                    </span>
                    <span className="text-sm font-bold">Matriz: Rodolfo Tepassé, 250 – Imigrantes - Guaramirim | SC</span>
                  </div>
                </li>
                <li>
                  <a href="https://www.youtube.com/@KrenkeBrinquedos" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white/90 hover:text-[#F39200] transition-colors group"
                  >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex-shrink-0">
                      <Youtube size={18} className="text-[#F39200]" />
                    </span>
                    <span className="text-sm font-bold">KrenkeBrinquedos</span>
                  </a>
                </li>
              </ul>
            </motion.div>

            {/* Right: form */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div
                className="bg-white rounded-[2rem] p-8 border-4"
                style={{ borderColor: BRAND.orange, boxShadow: '10px 10px 0 rgba(0,0,0,0.2)' }}
              >
                <p className="font-baloo font-bold text-xl text-[#312783] mb-6">Preencha os campos para ser atendido.</p>
                <form id="form-lp" onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="form-quote-name" className={labelCls}>Nome</label>
                      <input
                        id="form-quote-name"
                        name="form_lp_nome"
                        className={inputCls}
                        placeholder="Nome completo"
                        autoComplete="name"
                        value={formData.nome} onChange={field('nome')} required
                      />
                    </div>
                    <div>
                      <label htmlFor="form-quote-phone" className={labelCls}>Telefone</label>
                      <input
                        id="form-quote-phone"
                        name="form_lp_telefone"
                        type="tel"
                        className={inputCls}
                        placeholder="(00) 00000-0000"
                        autoComplete="tel"
                        value={formData.telefone} onChange={field('telefone')} required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="form-quote-email" className={labelCls}>E-mail</label>
                    <input
                      id="form-quote-email"
                      name="form_lp_email"
                      type="email"
                      className={inputCls}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      value={formData.email} onChange={field('email')} required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="form-lp-state" className={labelCls}>Estado</label>
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
                      <label htmlFor="form-lp-city" className={labelCls}>Cidade</label>
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
                    <label htmlFor="form-quote-client-type" className={labelCls}>Tipo de Cliente</label>
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
                    <label htmlFor="form-quote-segment" className={labelCls}>Segmento</label>
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
                    <label htmlFor="form-quote-message" className={labelCls}>Mensagem</label>
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
                    <p className="text-red-600 text-sm font-bold" role="alert">{submitError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !uf || !city}
                    className="w-full py-4 bg-[#F39200] hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-baloo font-bold text-lg rounded-full cursor-pointer transition-all duration-200 shadow-[5px_5px_0_rgba(49,39,131,0.9)] hover:shadow-[7px_7px_0_rgba(49,39,131,0.9)] hover:-translate-y-0.5 flex items-center justify-center gap-3"
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
      <footer className="bg-[#241d61] py-6 text-center">
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
