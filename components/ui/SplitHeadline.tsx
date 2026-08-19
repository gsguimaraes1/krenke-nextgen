import React, { useRef } from 'react';
import { gsap, SplitText, useGSAP, MQ } from '../../lib/gsap';
import { useTranslatedText } from '../../hooks/useTranslatedText';

type SplitType = 'chars' | 'words' | 'lines';

interface SplitHeadlineProps {
  /** Texto puro. É traduzido internamente (mesmo pipeline do TranslatableText). */
  text: string;
  className?: string;
  /** Tag renderizada. Use a semântica certa (h1/h2/span) — o split não altera o DOM externo. */
  as?: React.ElementType;
  /** Granularidade do split. `chars` é mais agressivo, `words` é o padrão elegante. */
  type?: SplitType;
  /** Dispara na montagem (`load`, pra hero) ou quando entra na viewport (`scroll`). */
  trigger?: 'load' | 'scroll';
  delay?: number;
  stagger?: number;
  /** Deslocamento vertical inicial de cada pedaço, em px. */
  from?: number;
}

/**
 * Título com reveal por palavra/caractere via GSAP SplitText.
 *
 * Cada pedaço sobe de dentro de uma máscara (`mask`), o que dá o efeito de
 * "texto emergindo" sem depender de opacidade sozinha.
 *
 * `autoSplit` re-divide o texto quando a fonte carrega ou a largura muda —
 * sem isso, quebras de linha erradas congelam no layout inicial.
 */
export const SplitHeadline: React.FC<SplitHeadlineProps> = ({
  text,
  className,
  as: Component = 'span',
  type = 'words',
  trigger = 'scroll',
  delay = 0,
  stagger,
  from = 100,
}) => {
  const ref = useRef<HTMLElement>(null);
  const { translated } = useTranslatedText(text);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      // Sem movimento: texto fica legível e estático.
      mm.add(MQ.reduce, () => {
        gsap.set(el, { opacity: 1, clearProps: 'transform' });
      });

      mm.add(MQ.motion, () => {
        const split = SplitText.create(el, {
          type,
          mask: type,
          autoSplit: true,
          onSplit(self) {
            const targets = self[type];
            if (!targets?.length) return;

            return gsap.from(targets, {
              yPercent: from,
              opacity: 0,
              duration: 1,
              delay,
              ease: 'expo.out',
              stagger: stagger ?? (type === 'chars' ? 0.02 : 0.06),
              scrollTrigger:
                trigger === 'scroll'
                  ? { trigger: el, start: 'top 85%', once: true }
                  : undefined,
            });
          },
        });

        return () => split.revert();
      });

      return () => mm.revert();
    },
    { dependencies: [translated, type, trigger], revertOnUpdate: true, scope: ref }
  );

  return (
    <Component ref={ref as never} className={className}>
      {translated}
    </Component>
  );
};
