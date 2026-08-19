import React from 'react';
import { useTranslatedText } from '../hooks/useTranslatedText';

interface TranslatableTextProps {
  children: string;
  className?: string;
  // React 19 removeu o namespace global JSX — ElementType é o tipo correto aqui.
  as?: React.ElementType;
}

export const TranslatableText: React.FC<TranslatableTextProps> = ({
  children,
  className,
  as: Component = 'span'
}) => {
  const { translated, isLoading } = useTranslatedText(children);

  return (
    <Component className={`${className ?? ''} ${isLoading ? 'opacity-50' : ''}`.trim()}>
      {translated}
    </Component>
  );
};
