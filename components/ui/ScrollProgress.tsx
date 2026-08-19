import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap';

/**
 * Barra fina no topo indicando o progresso de leitura da página.
 *
 * Fica acima do navbar (z-[60]) e é puramente decorativa (`aria-hidden`).
 * Recria o ScrollTrigger a cada rota porque a altura do documento muda.
 */
export const ScrollProgress: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const tween = gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: document.documentElement,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
            invalidateOnRefresh: true,
          },
        }
      );

      // Conteúdo assíncrono (produtos, posts) muda a altura depois da montagem.
      const timeout = window.setTimeout(() => ScrollTrigger.refresh(), 600);

      return () => {
        window.clearTimeout(timeout);
        tween.kill();
      };
    },
    { dependencies: [pathname], revertOnUpdate: true, scope: ref }
  );

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 w-full h-1 z-[60] pointer-events-none"
    >
      <div
        ref={ref}
        className="h-full w-full origin-left bg-gradient-to-r from-vibrant-orange via-krenke-logo-pink to-vibrant-purple shadow-[0_0_12px_rgba(255,159,10,0.6)]"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
};
