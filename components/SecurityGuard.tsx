import { useEffect } from 'react';

// Proteção leve: só impede arrastar imagens da galeria.
// Bloqueios de teclado/cópia/menu de contexto/print foram removidos —
// não param usuário determinado e quebram UX real (salvar no celular,
// copiar texto legítimo, imprimir catálogo, acessibilidade).
export const SecurityGuard: React.FC = () => {
  useEffect(() => {
    const id = '__krenke_sec_styles';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = `
        img {
          -webkit-user-drag: none;
          user-drag: none;
        }
      `;
      document.head.appendChild(style);
    }

    const handleDragStart = (e: DragEvent) => {
      if ((e.target as HTMLElement).tagName === 'IMG') {
        e.preventDefault();
      }
    };

    document.addEventListener('dragstart', handleDragStart, true);
    return () => document.removeEventListener('dragstart', handleDragStart, true);
  }, []);

  return null;
};
