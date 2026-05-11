import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { translateText } from '../lib/i18n';

interface TranslatableTextProps {
  children: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * A component that automatically translates its children using a free Machine Translation API
 * if the current language is not Portuguese.
 */
export const TranslatableText: React.FC<TranslatableTextProps> = ({ 
  children, 
  className, 
  as: Component = 'span' 
}) => {
  const { i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState(children);
  const [isLoading, setIsLoading] = useState(false);
  const cache = useRef<{ [key: string]: string }>({});

  useEffect(() => {
    const performTranslation = async () => {
      // If language is PT, just show original text
      if (i18n.language === 'pt') {
        setTranslatedText(children);
        return;
      }

      const cacheKey = `${i18n.language}:${children}`;
      if (cache.current[cacheKey]) {
        setTranslatedText(cache.current[cacheKey]);
        return;
      }

      setIsLoading(true);
      try {
        const result = await translateText(children, i18n.language);
        cache.current[cacheKey] = result;
        setTranslatedText(result);
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedText(children);
      } finally {
        setIsLoading(false);
      }
    };

    performTranslation();
  }, [children, i18n.language]);

  return (
    <Component className={`${className} ${isLoading ? 'opacity-50' : ''}`}>
      {translatedText}
    </Component>
  );
};
