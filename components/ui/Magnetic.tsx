import React, { useRef } from 'react';
import { gsap, useGSAP } from '../../lib/gsap';

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  /** Fração do deslocamento do cursor que o elemento acompanha (0–1). */
  strength?: number;
}

/**
 * Efeito "ímã": o elemento acompanha suavemente o cursor enquanto ele está por
 * cima e volta ao centro na saída.
 *
 * Só ativa em ponteiro fino (`hover: hover`) — em touch não há hover e o
 * elemento ficaria deslocado após o toque.
 */
export const Magnetic: React.FC<MagneticProps> = ({
  children,
  className,
  strength = 0.35,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add('(hover: hover) and (prefers-reduced-motion: no-preference)', () => {
        // quickTo é ~10x mais barato que criar um tween novo a cada pointermove.
        const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });

        let rect: DOMRect | null = null;

        const onEnter = () => {
          rect = el.getBoundingClientRect();
        };
        const onMove = (e: PointerEvent) => {
          if (!rect) rect = el.getBoundingClientRect();
          xTo((e.clientX - (rect.left + rect.width / 2)) * strength);
          yTo((e.clientY - (rect.top + rect.height / 2)) * strength);
        };
        const onLeave = () => {
          rect = null;
          xTo(0);
          yTo(0);
        };

        el.addEventListener('pointerenter', onEnter);
        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerleave', onLeave);

        return () => {
          el.removeEventListener('pointerenter', onEnter);
          el.removeEventListener('pointermove', onMove);
          el.removeEventListener('pointerleave', onLeave);
        };
      });

      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};
