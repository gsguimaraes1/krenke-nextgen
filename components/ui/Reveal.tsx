import React, { useRef } from 'react';
import { gsap, useGSAP, MQ } from '../../lib/gsap';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Direção de entrada. `up` = sobe (padrão), `left`/`right` = desliza lateral. */
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';
  /** Distância do deslocamento inicial em px. */
  distance?: number;
  delay?: number;
  duration?: number;
  /**
   * Quando definido, anima os filhos diretos em cascata em vez do container.
   * Aceita seletor CSS relativo ao container (ex.: '.card').
   */
  stagger?: number;
  selector?: string;
  /** Posição do gatilho: quanto da viewport o elemento precisa ter cruzado. */
  start?: string;
  as?: 'div' | 'section' | 'ul' | 'li' | 'span';
}

/**
 * Reveal de scroll genérico via ScrollTrigger — substituto direto do
 * `whileInView` do framer-motion, mas com controle de cascata (`stagger`) e
 * respeito automático a `prefers-reduced-motion`.
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  className,
  direction = 'up',
  distance = 48,
  delay = 0,
  duration = 0.9,
  stagger,
  selector,
  start = 'top 85%',
  as: Component = 'div',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;

      const targets = stagger || selector
        ? gsap.utils.toArray<HTMLElement>(selector ?? ':scope > *', root)
        : [root];

      if (!targets.length) return;

      const mm = gsap.matchMedia();

      // Sem movimento: entrega tudo já posicionado.
      mm.add(MQ.reduce, () => {
        gsap.set(targets, { clearProps: 'all' });
      });

      mm.add(MQ.motion, () => {
        const fromVars: gsap.TweenVars = { opacity: 0 };
        if (direction === 'up') fromVars.y = distance;
        if (direction === 'down') fromVars.y = -distance;
        if (direction === 'left') fromVars.x = -distance;
        if (direction === 'right') fromVars.x = distance;
        if (direction === 'scale') fromVars.scale = 0.92;

        const tween = gsap.from(targets, {
          ...fromVars,
          duration,
          delay,
          stagger: stagger ?? 0,
          ease: 'power3.out',
          clearProps: 'transform',
          scrollTrigger: { trigger: root, start, once: true },
        });

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
