import { useEffect } from 'react';

const BLOCKED_KEYS: Array<{ key: string; ctrl?: boolean; shift?: boolean; alt?: boolean }> = [
  { key: 'F12' },
  { key: 'u', ctrl: true },
  { key: 'U', ctrl: true },
  { key: 's', ctrl: true },
  { key: 'S', ctrl: true },
  { key: 'i', ctrl: true, shift: true },
  { key: 'I', ctrl: true, shift: true },
  { key: 'j', ctrl: true, shift: true },
  { key: 'J', ctrl: true, shift: true },
  { key: 'c', ctrl: true, shift: true },
  { key: 'C', ctrl: true, shift: true },
  { key: 'p', ctrl: true },
  { key: 'P', ctrl: true },
];

function matchesBlockedKey(e: KeyboardEvent) {
  return BLOCKED_KEYS.some(rule => {
    if (rule.key !== e.key) return false;
    if (rule.ctrl !== undefined && rule.ctrl !== (e.ctrlKey || e.metaKey)) return false;
    if (rule.shift !== undefined && rule.shift !== e.shiftKey) return false;
    if (rule.alt !== undefined && rule.alt !== e.altKey) return false;
    return true;
  });
}

function injectImageProtectionStyles() {
  const id = '__krenke_sec_styles';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    img {
      -webkit-user-drag: none;
      user-drag: none;
      -webkit-user-select: none;
      user-select: none;
      pointer-events: none;
    }
    .img-interactive {
      pointer-events: auto;
    }
    * {
      -webkit-touch-callout: none;
    }
  `;
  document.head.appendChild(style);
}

// DevTools detection via window size delta and timing
function startDevToolsDetection() {
  let detectedCount = 0;
  const threshold = 160;

  const check = () => {
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    if (widthDiff > threshold || heightDiff > threshold) {
      detectedCount++;
      if (detectedCount >= 3) {
        document.body.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#1a0a2e;color:#fff;font-family:sans-serif;text-align:center;gap:16px;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ff9f0a" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <h1 style="font-size:2rem;margin:0;">Acesso Restrito</h1>
            <p style="color:#aaa;max-width:400px;">O conteúdo desta página é protegido por direitos autorais. Feche as ferramentas de desenvolvedor para continuar.</p>
          </div>`;
      }
    } else {
      detectedCount = 0;
    }
  };

  return setInterval(check, 1000);
}

// Trap debugger via timing — opens a paused debugger when DevTools is active
function trapDebugger() {
  try {
    const start = performance.now();
    // eslint-disable-next-line no-debugger
    debugger;
    if (performance.now() - start > 100) {
      // DevTools paused on debugger — reload to reset state
      window.location.reload();
    }
  } catch { /* ignore */ }
}

export const SecurityGuard: React.FC = () => {
  useEffect(() => {
    injectImageProtectionStyles();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (matchesBlockedKey(e)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      if ((e.target as HTMLElement).tagName === 'IMG') {
        e.preventDefault();
      }
    };

    // Block copy of text/images via clipboard API
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('dragstart', handleDragStart, true);
    document.addEventListener('copy', handleCopy, true);

    const devToolsInterval = startDevToolsDetection();

    // Run debugger trap periodically to catch open DevTools sessions
    const debuggerInterval = setInterval(trapDebugger, 3000);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('copy', handleCopy, true);
      clearInterval(devToolsInterval);
      clearInterval(debuggerInterval);
    };
  }, []);

  return null;
};
