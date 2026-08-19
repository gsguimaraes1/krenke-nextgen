import React, { useRef } from 'react';
import { gsap, useGSAP, MQ } from '../../lib/gsap';

interface CounterProps {
  /** Valor final. */
  value: number;
  /** Ponto de partida da contagem (padrão 0). */
  start?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  /** Locale da formatação — pt-BR usa ponto como separador de milhar. */
  locale?: string;
}

/**
 * Número que conta até o valor quando entra na viewport.
 *
 * Anima um objeto proxy e escreve `textContent` no `onUpdate` — animar o texto
 * direto causaria reflow a cada frame.
 */
export const Counter: React.FC<CounterProps> = ({
  value,
  start = 0,
  className,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2,
  locale = 'pt-BR',
}) => {
  const ref = useRef<HTMLSpanElement>(null);

  const format = (n: number) =>
    `${prefix}${n.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add(MQ.reduce, () => {
        el.textContent = format(value);
      });

      mm.add(MQ.motion, () => {
        const proxy = { n: start };
        el.textContent = format(start);

        const tween = gsap.to(proxy, {
          n: value,
          duration,
          ease: 'power2.out',
          snap: decimals ? { n: 1 / 10 ** decimals } : { n: 1 },
          onUpdate: () => {
            el.textContent = format(proxy.n);
          },
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });

        return () => tween.kill();
      });

      return () => mm.revert();
    },
    { dependencies: [value], revertOnUpdate: true, scope: ref }
  );

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
};
