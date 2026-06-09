import { useEffect, useState } from 'react';

function getParam(name: string): string | null {
  const match = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.href);
  return match ? decodeURIComponent(match[1]) : null;
}

function getAllParamsExceptLink(): string {
  return window.location.search
    .substring(1)
    .split('&')
    .filter(p => p && !p.startsWith('lnk='))
    .join('&');
}

function isInWebView(): boolean {
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  return /FBAN|FBAV|Instagram|Messenger|Line|Snapchat|TikTok/.test(ua);
}

function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function Webview() {
  const baseLink = getParam('lnk');
  const extraParams = getAllParamsExceptLink();
  const sep = baseLink && baseLink.includes('?') ? '&' : '?';
  const finalLink = baseLink
    ? baseLink + (extraParams ? sep + extraParams : '')
    : null;

  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (!finalLink) return;

    if (isInWebView()) {
      if (isAndroid()) {
        window.location.href =
          'intent://' +
          finalLink.replace(/^https?:\/\//, '') +
          '#Intent;scheme=https;package=com.android.chrome;end';
      } else if (isIOS()) {
        window.location.href = 'x-safari-' + finalLink;
      } else {
        window.location.href = finalLink;
      }
    } else {
      window.location.href = finalLink;
    }

    // Fallback button after 1.5s if redirect didn't work
    const t = setTimeout(() => setShowFallback(true), 1500);
    return () => clearTimeout(t);
  }, [finalLink]);

  if (!finalLink) return null;

  return showFallback ? (
    <div style={{ fontFamily: 'sans-serif', padding: 30, textAlign: 'center' }}>
      <p style={{ marginBottom: 15 }}>
        Toque no botão abaixo para abrir no navegador.
      </p>
      <a
        href={finalLink}
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'inline-block',
          background: '#007aff',
          color: '#fff',
          padding: '10px 20px',
          textDecoration: 'none',
          borderRadius: 8,
          fontSize: 16,
        }}
      >
        Abrir no Navegador
      </a>
    </div>
  ) : null;
}
