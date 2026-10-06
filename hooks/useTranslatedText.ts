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

    // 'pt-BR' também é português: sem isso cada texto vira uma chamada ao Google Translate.
    const lang = (i18n.language || 'pt').split('-')[0];
    if (lang === 'pt') {
      setTranslated(text);
      return;
    }

    const cacheKey = `${lang}:${text}`;
    const cached = translationCache.get(cacheKey);
    if (cached) {
      setTranslated(cached);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    translateText(text, lang)
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
