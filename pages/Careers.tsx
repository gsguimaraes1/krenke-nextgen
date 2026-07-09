import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Briefcase, MapPin, Users, Heart, Lightbulb, Trophy, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { JobOpening } from '../types';
import JobApplicationForm from '../components/JobApplicationForm';
import { TranslatableText } from '../components/TranslatableText';

const CONTRACT_COLORS: Record<string, string> = {
  'CLT':                   'bg-blue-100 text-blue-700 border-blue-200',
  'PJ':                    'bg-purple-100 text-purple-700 border-purple-200',
  'Estágio':               'bg-teal-100 text-teal-700 border-teal-200',
  'Freelancer/Temporário': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Banco de Talentos':     'bg-orange-100 text-[#F39200] border-orange-200',
};

const VALUES = [
  {
    icon: Heart,
    title: 'Propósito Real',
    desc: 'Fazemos produtos que constroem infâncias. Cada playground que sai da fábrica transforma espaços e vidas.',
  },
  {
    icon: Lightbulb,
    title: 'Inovação Constante',
    desc: 'Engenharia, design e criatividade lado a lado. Aqui boas ideias ganham espaço para se tornar realidade.',
  },
  {
    icon: Trophy,
    title: 'Crescimento de Verdade',
    desc: 'Empresa em expansão nacional com planos de desenvolvimento para cada membro do time.',
  },
  {
    icon: Users,
    title: 'Time Unido',
    desc: 'Cultura colaborativa, respeito e um ambiente onde cada pessoa importa — do chão de fábrica ao comercial.',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

function ContractBadge({ type }: { type: string }) {
  const cls = CONTRACT_COLORS[type] || 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase ${cls}`}>
      {type}
    </span>
  );
}

function JobCard({ job, onApply }: { job: JobOpening; onApply: (j: JobOpening) => void }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = !!(job.description || job.requirements);

  return (
    <motion.div
      {...fadeUp}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-[#312783]/20 transition-all"
    >
      {/* Header row */}
      <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-[#312783] text-lg mb-2">{job.title}</h4>

          {/* Contract type badges */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(job.contract_types || []).map(ct => (
              <ContractBadge key={ct} type={ct} />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 font-medium">
            {job.department && (
              <span className="flex items-center gap-1">
                <Building2 size={13} /> {job.department}
              </span>
            )}
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin size={13} /> {job.location}
              </span>
            )}
            {job.application_count > 0 && (
              <span className="flex items-center gap-1 text-[#F39200] font-bold">
                <Users size={13} /> {job.application_count} <TranslatableText>{`candidatura${job.application_count !== 1 ? 's' : ''}`}</TranslatableText>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasDetails && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-[#312783] px-3 py-2 rounded-xl hover:bg-gray-50 transition-all"
            >
              {expanded ? <><ChevronUp size={15} /> <TranslatableText>Fechar</TranslatableText></> : <><ChevronDown size={15} /> <TranslatableText>Ver detalhes</TranslatableText></>}
            </button>
          )}
          <button
            onClick={() => onApply(job)}
            className="bg-[#F39200] hover:bg-orange-500 text-white font-black uppercase tracking-wider text-xs py-3 px-7 rounded-xl transition-all hover:scale-105 whitespace-nowrap"
          >
            <TranslatableText>Candidatar-se</TranslatableText>
          </button>
        </div>
      </div>

      {/* Expandable details */}
      <AnimatePresence initial={false}>
        {expanded && hasDetails && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-gray-100 pt-5 space-y-4">
              {job.description && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2"><TranslatableText>Descrição</TranslatableText></p>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
                </div>
              )}
              {job.requirements && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2"><TranslatableText>Requisitos</TranslatableText></p>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.requirements}</p>
                </div>
              )}
              <button
                onClick={() => onApply(job)}
                className="mt-2 inline-flex items-center gap-2 bg-[#312783] text-white font-black uppercase tracking-wider text-xs py-3 px-7 rounded-xl hover:bg-[#241f6b] transition-all"
              >
                <TranslatableText>Candidatar-se a esta vaga</TranslatableText>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CareersPage() {
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [loadingOpenings, setLoadingOpenings] = useState(true);
  const [preselected, setPreselected] = useState<JobOpening | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const vagasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from('job_openings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data }: { data: JobOpening[] | null }) => {
        setOpenings(data || []);
        setLoadingOpenings(false);
      });
  }, []);

  const scrollToForm = (opening?: JobOpening) => {
    if (opening) setPreselected(opening);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <>
      <Helmet>
        <title>Trabalhe Conosco — Krenke Brinquedos Pedagógicos</title>
        <meta name="description" content="Faça parte do time Krenke! Vagas em aberto para CLT, PJ, Estágio e Banco de Talentos em Guaramirim/SC e Palmares/PE. Envie seu currículo agora." />
        <meta name="keywords" content="vagas krenke, emprego guaramirim sc, trabalhe conosco krenke, vagas playground, emprego brinquedos, banco de talentos krenke" />
        <meta property="og:title" content="Trabalhe Conosco — Krenke Brinquedos" />
        <meta property="og:description" content="Há mais de 40 anos construindo infâncias felizes. Junte-se ao time Krenke — vagas CLT, PJ, Estágio e Banco de Talentos." />
        <meta property="og:url" content="https://site.krenke.com.br/trabalhe-conosco" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://site.krenke.com.br/trabalhe-conosco" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Trabalhe Conosco — Krenke Brinquedos",
          "url": "https://site.krenke.com.br/trabalhe-conosco",
          "description": "Página de vagas e candidaturas da Krenke Brinquedos Pedagógicos LTDA.",
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://site.krenke.com.br/" },
              { "@type": "ListItem", "position": 2, "name": "Trabalhe Conosco", "item": "https://site.krenke.com.br/trabalhe-conosco" }
            ]
          },
          "publisher": {
            "@type": "Organization",
            "name": "Krenke Brinquedos Pedagógicos LTDA",
            "url": "https://site.krenke.com.br",
            "logo": "https://site.krenke.com.br/favicon.png"
          }
        })}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative bg-[#312783] overflow-hidden pt-40 pb-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#F39200]/10 blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#009FE3]/10 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs font-black uppercase tracking-widest mb-8"
          >
            <Briefcase size={14} />
            <TranslatableText>Venha crescer com a gente</TranslatableText>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-6"
          >
            <TranslatableText>Trabalhe</TranslatableText><br />
            <span className="text-[#F39200]"><TranslatableText>Conosco</TranslatableText></span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-white/60 text-xl max-w-2xl mx-auto mb-12 font-medium"
          >
            <TranslatableText>Há mais de 40 anos construindo infâncias felizes. Procuramos pessoas apaixonadas por fazer a diferença — dentro e fora da fábrica.</TranslatableText>
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            onClick={() => vagasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="inline-flex items-center gap-3 bg-[#F39200] hover:bg-orange-500 text-white font-black uppercase tracking-wider text-sm py-5 px-10 rounded-2xl transition-all hover:scale-105 hover:shadow-[0_8px_30px_rgba(243,146,0,0.4)]"
          >
            <TranslatableText>Ver Vagas</TranslatableText>
            <ChevronDown size={18} />
          </motion.button>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="text-[#F39200] font-black text-xs uppercase tracking-widest"><TranslatableText>Por que a Krenke?</TranslatableText></span>
            <h2 className="text-4xl font-black text-[#312783] mt-3 tracking-tight"><TranslatableText>Mais que um emprego</TranslatableText></h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((v, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                className="group p-8 rounded-3xl border-2 border-gray-100 hover:border-[#312783]/20 hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#312783]/8 flex items-center justify-center mb-6 group-hover:bg-[#F39200]/10 transition-colors">
                  <v.icon size={26} className="text-[#312783] group-hover:text-[#F39200] transition-colors" />
                </div>
                <h3 className="font-black text-[#312783] text-lg mb-3"><TranslatableText>{v.title}</TranslatableText></h3>
                <p className="text-gray-500 text-sm leading-relaxed"><TranslatableText>{v.desc}</TranslatableText></p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Openings */}
      <section ref={vagasRef} className="py-24 bg-slate-50 scroll-mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="text-[#F39200] font-black text-xs uppercase tracking-widest"><TranslatableText>Oportunidades</TranslatableText></span>
            <h2 className="text-4xl font-black text-[#312783] mt-3 tracking-tight"><TranslatableText>Vagas em Aberto</TranslatableText></h2>
          </motion.div>

          {loadingOpenings ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-[#F39200] rounded-full animate-spin" />
            </div>
          ) : openings.length === 0 ? (
            <motion.div {...fadeUp} className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-black text-gray-400 mb-2"><TranslatableText>Nenhuma vaga aberta no momento</TranslatableText></h3>
              <p className="text-gray-400 text-sm mb-8"><TranslatableText>Mas adoraríamos ter seu currículo no nosso banco de talentos!</TranslatableText></p>
              <button
                onClick={() => scrollToForm()}
                className="inline-flex items-center gap-2 bg-[#312783] text-white font-black uppercase tracking-wider text-xs py-3 px-8 rounded-2xl hover:bg-[#241f6b] transition-all"
              >
                <TranslatableText>Enviar Candidatura Espontânea</TranslatableText>
              </button>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {openings.map(job => (
                <JobCard key={job.id} job={job} onApply={scrollToForm} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Application Form */}
      <section ref={formRef} className="py-24 bg-white scroll-mt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="text-[#F39200] font-black text-xs uppercase tracking-widest"><TranslatableText>Candidate-se</TranslatableText></span>
            <h2 className="text-4xl font-black text-[#312783] mt-3 tracking-tight">
              {preselected ? preselected.title : <TranslatableText>Envie seu Currículo</TranslatableText>}
            </h2>
            {preselected && (
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {(preselected.contract_types || []).map(ct => (
                  <ContractBadge key={ct} type={ct} />
                ))}
                {preselected.location && (
                  <span className="px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase bg-gray-100 text-gray-500 border-gray-200">
                    {preselected.location}
                  </span>
                )}
              </div>
            )}
            {preselected && (
              <button
                onClick={() => setPreselected(null)}
                className="mt-4 text-xs text-gray-400 underline hover:text-gray-600"
              >
                <TranslatableText>Limpar seleção</TranslatableText>
              </button>
            )}
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 md:p-12"
          >
            <JobApplicationForm openings={openings} preselectedOpening={preselected} />
          </motion.div>
        </div>
      </section>
    </>
  );
}
