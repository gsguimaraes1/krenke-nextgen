import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import logoBranco from '../../assets/Logos/krenke-brinquedos-logo-branco.webp';

const Obrigado: React.FC = () => {
  const location = useLocation();
  const ticketNumber = (location.state as any)?.ticketNumber;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <img src={logoBranco} alt="Krenke Brinquedos" className="h-9 object-contain mb-8 bg-krenke-navy px-4 py-2 rounded-xl" />
      <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-premium border border-slate-100 p-8 text-center">
        <CheckCircle2 className="w-14 h-14 text-krenke-green mx-auto mb-4" />
        <h1 className="text-xl font-black text-slate-800 mb-2">Chamado recebido!</h1>
        {ticketNumber && (
          <p className="text-sm text-slate-600 mb-2">
            Seu número de protocolo: <span className="font-mono font-bold">{ticketNumber}</span>
          </p>
        )}
        <p className="text-sm text-slate-500 mb-6">
          Nossa equipe vai analisar e entrar em contato em breve.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/abrir-chamado" className="text-krenke-orange font-bold text-sm">
            Abrir outro chamado
          </Link>
          <Link to="/meus-chamados" className="text-slate-500 font-bold text-sm">
            Ver meus chamados
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Obrigado;
