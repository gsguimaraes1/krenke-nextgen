import React, { useRef } from 'react';
import { gsap, useGSAP, MQ } from '../../lib/gsap';

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  /** Intensidade. 1 ≈ ±8% de deslocamento ao longo da travessia da viewport. */
  speed?: number;
  /** Direção contrária ao scroll (efeito de profundidade maior). */
  invert?: boolean;
  as?: 'div' | 'span';
}

/**
 * Parallax vertical amarrado ao scroll (`scrub`).
 *
 * O elemento se desloca enquanto o pai atravessa a viewport. Use dentro de um
 * container com `overflow-hidden` e deixe o conteúdo maior que o container,
 * senão a borda aparece no fim do curso.
 */
export const Parallax: React.FC<ParallaxProps> = ({
  children,
  className,
  speed = 1,
  invert = false,
  as: Component = 'div',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      // Parallax só em telas grandes: em mobile o custo de repaint não compensa.
      mm.add(MQ.desktop, () => {
        const shift = 8 * speed * (invert ? -1 : 1);

        const tween = gsap.fromTo(
          el,
          { yPercent: -shift },
          {
            yPercent: shift,
            ease: 'none',
            scrollTrigger: {
              trigger: el.parentElement ?? el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );

        return () => tween.kill();
      });

      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <Component ref={ref as never} className={className}>
      {children}
    </Component>
  );
};
