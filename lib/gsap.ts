/**
 * Registro central do GSAP.
 *
 * Todo componente que anima deve importar daqui — nunca de 'gsap' direto — pra
 * garantir que os plugins foram registrados uma única vez antes do primeiro uso.
 *
 * Plugins usados: ScrollTrigger (scroll-driven), SplitText (títulos por
 * palavra/caractere) e o hook useGSAP (cleanup automático no unmount).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** Curva padrão do site — mesma easing que o framer-motion já usava ([0.16, 1, 0.3, 1]). */
export const KRENKE_EASE = 'power3.out';

gsap.defaults({ ease: KRENKE_EASE, duration: 0.9 });

/**
 * Queries prontas pro gsap.matchMedia(). `reduce` desliga movimento pra quem
 * pediu no sistema; `motion` é o inverso (só anima quando permitido).
 */
export const MQ = {
  motion: '(prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
  desktop: '(prefers-reduced-motion: no-preference) and (min-width: 1024px)',
  mobile: '(max-width: 1023px)',
} as const;

/** Leitura pontual (fora de tween) da preferência de movimento. */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, ScrollTrigger, SplitText, useGSAP };
