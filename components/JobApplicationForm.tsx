import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Send, Paperclip, X } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { supabase } from '../lib/supabase';
import { getStoredUTMs } from '../lib/utm-tracker';
import { uploadToR2 } from '../lib/r2-upload';
import { useNavigate } from 'react-router-dom';
import { JobOpening } from '../types';

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

const EDUCATION_LEVELS = [
  'Ensino Fundamental', 'Ensino Médio', 'Ensino Técnico',
  'Ensino Superior Incompleto', 'Ensino Superior Completo',
  'Pós-graduação / MBA', 'Mestrado', 'Doutorado',
];

const CustomPhoneInput = React.forwardRef<HTMLInputElement, any>((props, ref) => (
  <input
    {...props}
    ref={ref}
    className="w-full bg-transparent outline-none font-semibold text-gray-900 placeholder:text-gray-300"
  />
));

const fieldClass = "w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-white focus:border-[#312783] focus:ring-4 focus:ring-[#312783]/10 outline-none transition-all font-semibold text-gray-900 placeholder:text-gray-300";
const labelClass = "block text-xs font-black uppercase tracking-widest text-gray-500 mb-2";

interface Props {
  openings: JobOpening[];
  preselectedOpening?: JobOpening | null;
}

const JobApplicationForm: React.FC<Props> = ({ openings, preselectedOpening }) => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState<string | undefined>('');
  const [uf, setUf] = useState('');
  const [city, setCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [openingId, setOpeningId] = useState<string>('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [salaryExpectation, setSalaryExpectation] = useState('');
  const [motivation, setMotivation] = useState('');
  const [message, setMessage] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [utms, setUtms] = useState<any>({});

  useEffect(() => {
    setUtms(getStoredUTMs());
  }, []);

  useEffect(() => {
    if (preselectedOpening) {
      setOpeningId(preselectedOpening.id);
    }
  }, [preselectedOpening]);

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

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setSubmitError('Apenas arquivos PDF são aceitos para o currículo.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('O arquivo deve ter no máximo 5MB.');
      return;
    }
    setSubmitError(null);
    setCvFile(file);
  };

  const validate = (): string | null => {
    if (name.trim().length < 3) return 'Informe seu nome completo.';
    if (!phone || !isValidPhoneNumber(phone)) return 'Informe um telefone válido.';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Informe um e-mail válido.';
    if (!uf) return 'Selecione seu estado.';
    if (!city) return 'Selecione sua cidade.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;

    const err = validate();
    if (err) { setSubmitError(err); return; }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let cvUrl: string | null = null;
      if (cvFile) {
        try {
          const { publicUrl } = await uploadToR2(cvFile, 'curriculos');
          cvUrl = publicUrl;
        } catch {
          // CV upload failed — proceed without it
        }
      }

      const selectedOpening = openings.find(o => o.id === openingId);
      const applicationType = selectedOpening
        ? (selectedOpening.contract_types[0] || 'Vaga Específica')
        : 'Candidatura Espontânea';

      const payload = {
        opening_id: openingId || null,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone,
        city,
        state: uf,
        application_type: applicationType,
        experience: experience.trim() || null,
        education: education || null,
        salary_expectation: salaryExpectation.trim() || null,
        motivation: motivation.trim() || null,
        message: message.trim() || null,
        cv_url: cvUrl,
        utm_source: utms.utm_source || null,
        utm_medium: utms.utm_medium || null,
        utm_campaign: utms.utm_campaign || null,
        utm_term: utms.utm_term || null,
        utm_content: utms.utm_content || null,
        utm_id: utms.utm_id || null,
      };

      const { error: insertError } = await supabase.from('job_applications').insert([payload]);
      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('Você já enviou uma candidatura para esta vaga. Aguarde nosso contato!');
        }
        throw new Error(insertError.message);
      }

      const webhookPayload = {
        ...payload,
        form_type: 'trabalhe-conosco',
        source: 'Site Krenke - Trabalhe Conosco',
        submitted_at: new Date().toISOString(),
        city_full: `${city} - ${uf}`,
        opening_title: selectedOpening?.title || null,
        contract_types: selectedOpening?.contract_types || [],
      };

      fetch('https://n8n.krenke.com.br/webhook/trabalhe-conosco', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      }).catch(() => {});

      navigate('/obrigado-curriculo');
    } catch {
      setSubmitError('Erro ao enviar candidatura. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeOpenings = openings.filter(o => o.is_active);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Honeypot */}
      <input
        type="text"
        name="b_website_url"
        value={honeypot}
        onChange={e => setHoneypot(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        style={{ display: 'none' }}
      />

      {/* — Dados Pessoais — */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[#312783]/40 mb-4 border-b border-gray-100 pb-2">Dados Pessoais</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Nome Completo *</label>
            <input
              type="text"
              name="job_app_name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Seu nome completo"
              className={fieldClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>E-mail *</label>
            <input
              type="email"
              name="job_app_email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className={fieldClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>WhatsApp / Telefone *</label>
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border-2 border-gray-100 bg-white focus-within:border-[#312783] focus-within:ring-4 focus-within:ring-[#312783]/10 transition-all">
              <PhoneInput
                international
                defaultCountry="BR"
                value={phone}
                onChange={setPhone}
                inputComponent={CustomPhoneInput}
                name="job_app_phone"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Estado *</label>
            <select
              name="job_app_estado"
              value={uf}
              onChange={e => setUf(e.target.value)}
              className={fieldClass}
              required
            >
              <option value="">Selecione o estado</option>
              {STATES.map(s => (
                <option key={s.uf} value={s.uf}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Cidade *</label>
            <select
              name="job_app_cidade"
              value={city}
              onChange={e => setCity(e.target.value)}
              className={fieldClass}
              disabled={!uf || loadingCities}
              required
            >
              <option value="">
                {loadingCities ? 'Carregando...' : !uf ? 'Selecione o estado primeiro' : 'Selecione a cidade'}
              </option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {activeOpenings.length > 0 && (
            <div>
              <label className={labelClass}>Vaga de Interesse</label>
              <select
                name="job_app_opening"
                value={openingId}
                onChange={e => setOpeningId(e.target.value)}
                className={fieldClass}
              >
                <option value="">Candidatura espontânea / Banco de talentos</option>
                {activeOpenings.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.title}{o.location ? ` · ${o.location}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* — Formação e Experiência — */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[#312783]/40 mb-4 border-b border-gray-100 pb-2">Formação e Experiência</p>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className={labelClass}>Formação Acadêmica</label>
            <select
              name="job_app_education"
              value={education}
              onChange={e => setEducation(e.target.value)}
              className={fieldClass}
            >
              <option value="">Selecione seu nível</option>
              {EDUCATION_LEVELS.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Pretensão Salarial</label>
            <input
              type="text"
              name="job_app_salary"
              value={salaryExpectation}
              onChange={e => setSalaryExpectation(e.target.value)}
              placeholder="Ex: R$ 3.000 / A combinar"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className={labelClass}>Experiência Anterior</label>
          <textarea
            name="job_app_experience"
            value={experience}
            onChange={e => setExperience(e.target.value)}
            placeholder="Descreva suas experiências profissionais relevantes: cargo, empresa, período e principais responsabilidades..."
            rows={4}
            className={fieldClass + ' resize-none'}
          />
        </div>
      </div>

      {/* — Sobre Você — */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[#312783]/40 mb-4 border-b border-gray-100 pb-2">Sobre Você</p>

        <div className="mb-6">
          <label className={labelClass}>Por que quer trabalhar na Krenke? *</label>
          <textarea
            name="job_app_motivation"
            value={motivation}
            onChange={e => setMotivation(e.target.value)}
            placeholder="Conte o que te motivou a se candidatar e como você pode contribuir com o time Krenke..."
            rows={4}
            className={fieldClass + ' resize-none'}
          />
        </div>

        <div>
          <label className={labelClass}>Mensagem Adicional</label>
          <textarea
            name="job_app_mensagem"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Alguma informação extra que queira compartilhar?"
            rows={3}
            className={fieldClass + ' resize-none'}
          />
        </div>
      </div>

      {/* — Currículo PDF — */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[#312783]/40 mb-4 border-b border-gray-100 pb-2">Currículo</p>
        <label className="flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-[#312783] hover:bg-[#312783]/5 transition-all cursor-pointer group">
          <Paperclip size={20} className="text-gray-400 group-hover:text-[#312783] transition-colors shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-gray-500 group-hover:text-[#312783] transition-colors block truncate">
              {cvFile ? cvFile.name : 'Anexar currículo em PDF (máx. 5MB) — recomendado'}
            </span>
            {!cvFile && (
              <span className="text-xs text-gray-400">Clique para selecionar o arquivo</span>
            )}
          </div>
          {cvFile && (
            <button
              type="button"
              onClick={e => { e.preventDefault(); setCvFile(null); }}
              className="ml-auto p-1 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          )}
          <input
            type="file"
            accept=".pdf"
            onChange={handleCvChange}
            className="sr-only"
          />
        </label>
      </div>

      {submitError && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm font-semibold px-1"
        >
          {submitError}
        </motion.p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-3 bg-[#F39200] hover:bg-orange-500 disabled:opacity-60 text-white font-black uppercase tracking-wider text-sm py-5 px-8 rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(243,146,0,0.35)] disabled:hover:scale-100"
      >
        {isSubmitting ? (
          <><Loader2 size={20} className="animate-spin" /> Enviando Candidatura...</>
        ) : (
          <><Send size={20} /> Enviar Candidatura</>
        )}
      </button>

      <p className="text-center text-xs text-gray-400 font-medium">
        Seus dados são protegidos conforme nossa{' '}
        <a href="/politica-de-privacidade" className="underline hover:text-[#312783]">Política de Privacidade</a>.
      </p>
    </form>
  );
};

export default JobApplicationForm;
