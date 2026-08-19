import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP } from '../../lib/gsap';
import { TranslatableText } from '../TranslatableText';

interface ShowcaseCardProps {
  title: string;
  subtitle?: string;
  image: string;
  link: string;
  description: string;
  color: string;
  alt?: string;
  priority?: boolean;
  id?: string;
  /** Classes do wrapper externo — usado pelo track horizontal pra fixar largura. */
  className?: string;
  /** Altura do card. Sobrescrito no modo horizontal pra caber em telas baixas. */
  heightClass?: string;
}

// Hex → rgba, pra montar a sombra colorida do card sem duplicar as cores em CSS.
const getRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const ShowcaseCard: React.FC<ShowcaseCardProps> = ({
  title,
  subtitle,
  image,
  link,
  description,
  color,
  alt,
  priority = false,
  id,
  className = '',
  heightClass = 'h-[650px] md:h-[700px]',
}) => {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const card = root.current?.querySelector<HTMLElement>('[data-card]');
      if (!card) return;

      const mm = gsap.matchMedia();

      // Hover coreografado só em ponteiro fino: em touch o estado "hover" gruda.
      mm.add('(hover: hover) and (prefers-reduced-motion: no-preference)', () => {
        const tl = gsap
          .timeline({ paused: true, defaults: { duration: 0.45, ease: 'power3.out' } })
          .to(card, { y: -20, boxShadow: `0 40px 80px -15px ${getRgba(color, 0.6)}` }, 0)
          .to(card.querySelector('[data-glow]'), { scale: 1.25, opacity: 0.5 }, 0)
          .to(card.querySelector('[data-frame]'), { scale: 1.05 }, 0)
          .to(card.querySelector('[data-image]'), { scale: 1.1 }, 0)
          .to(card.querySelector('[data-title]'), { y: -4 }, 0)
          .to(card.querySelector('[data-subtitle]'), { opacity: 1 }, 0)
          .to(card.querySelector('[data-bar]'), { width: '100%', duration: 0.6 }, 0);

        const enter = () => tl.play();
        const leave = () => tl.reverse();

        card.addEventListener('pointerenter', enter);
        card.addEventListener('pointerleave', leave);
        card.addEventListener('focusin', enter);
        card.addEventListener('focusout', leave);

        return () => {
          card.removeEventListener('pointerenter', enter);
          card.removeEventListener('pointerleave', leave);
          card.removeEventListener('focusin', enter);
          card.removeEventListener('focusout', leave);
        };
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div ref={root} className={`flex items-center justify-center ${className || 'w-full'}`}>
      <div
        data-card
        className={`relative ${heightClass} w-full max-w-[450px] rounded-[3rem] shadow-premium flex flex-col px-10 py-12 gap-8 overflow-hidden border border-white/20`}
        style={{ backgroundColor: `${color}F2` }} // ~95% de opacidade
      >
        {/* Brilho difuso de fundo */}
        <div
          data-glow
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] pointer-events-none bg-white opacity-20"
        />

        <div className="flex justify-end items-center z-20 h-8" />

        <div className="flex flex-col gap-6 h-full z-10 relative">
          <div className="flex flex-col items-center justify-center pt-2 px-2 text-center">
            {subtitle && (
              <span
                data-subtitle
                className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/70 mb-2"
              >
                <TranslatableText>{subtitle}</TranslatableText>
              </span>
            )}
            <h3
              data-title
              className="text-3xl md:text-3xl font-black text-white uppercase leading-tight tracking-tight drop-shadow-2xl"
            >
              <TranslatableText>{title}</TranslatableText>
            </h3>
          </div>

          <div
            data-frame
            className="relative flex-grow rounded-[2rem] overflow-hidden bg-white shadow-xl"
          >
            <div className="relative z-10 w-full h-full p-6 flex items-center justify-center">
              <img
                data-image
                src={image}
                alt={alt || `Playground Krenke - ${title}`}
                width={380}
                height={550}
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : 'auto'}
                decoding="async"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <Link to={link} className="mt-auto">
            <button
              id={id}
              className="w-full py-4 bg-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl transition-transform duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
              style={{ color: color }}
            >
              <TranslatableText>Ver Produtos</TranslatableText>
            </button>
          </Link>
        </div>

        {/* Traço que preenche a base no hover */}
        <div data-bar className="absolute bottom-0 left-0 h-1.5 bg-white w-0" />
      </div>
    </div>
  );
};
