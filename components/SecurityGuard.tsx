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

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('copy', handleCopy, true);
    };
  }, []);

  return null;
};
