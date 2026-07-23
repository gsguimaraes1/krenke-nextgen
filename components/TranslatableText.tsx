import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translateText } from '../lib/i18n';

interface TranslatableTextProps {
  children: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

// Module-level cache shared across all instances to avoid duplicate API calls
const translationCache = new Map<string, string>();

export const TranslatableText: React.FC<TranslatableTextProps> = ({
  children,
  className,
  as: Component = 'span'
}) => {
  const { i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState(children);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!children) return;

    if (i18n.language.startsWith('pt')) {
      setTranslatedText(children);
      return;
    }

    const cacheKey = `${i18n.language}:${children}`;
    const cached = translationCache.get(cacheKey);
    if (cached) {
      setTranslatedText(cached);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    translateText(children, i18n.language).then(result => {
      if (cancelled) return;
      translationCache.set(cacheKey, result);
      setTranslatedText(result);
      setIsLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setTranslatedText(children);
        setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [children, i18n.language]);

  return (
    <Component className={`${className ?? ''} ${isLoading ? 'opacity-50' : ''}`.trim()}>
      {translatedText}
    </Component>
  );
};
