import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translateText } from '../lib/i18n';

// Cache em nível de módulo, compartilhado por todas as instâncias (evita chamadas duplicadas).
const translationCache = new Map<string, string>();

/**
 * Traduz uma string sob demanda via Google Translate, com cache global.
 *
 * Extraído do `TranslatableText` porque componentes que animam texto (SplitText)
 * precisam do valor traduzido como *string*, não como JSX, pra poder re-splitar
 * quando o idioma muda.
 */
export const useTranslatedText = (text: string) => {
  const { i18n } = useTranslation();
  const [translated, setTranslated] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!text) return;

    if (i18n.language === 'pt') {
      setTranslated(text);
      return;
    }

    const cacheKey = `${i18n.language}:${text}`;
    const cached = translationCache.get(cacheKey);
    if (cached) {
      setTranslated(cached);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    translateText(text, i18n.language)
      .then(result => {
        if (cancelled) return;
        translationCache.set(cacheKey, result);
        setTranslated(result);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setTranslated(text);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [text, i18n.language]);

  return { translated, isLoading };
};
