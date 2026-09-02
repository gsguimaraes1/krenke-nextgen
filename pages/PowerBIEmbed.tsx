import React from 'react';

// Página "crua": só o embed do PowerBI em tela cheia, sem header/nav/layout.
// Usada em /venda e /faturamento (gate por e-mail no App.tsx).
// As URLs são "publicar na web" do PowerBI (públicas por natureza) — o gate
// client-side aqui é só de conveniência/UX, não de segurança.
interface PowerBIEmbedProps {
  src: string;
  title?: string;
}

const PowerBIEmbed: React.FC<PowerBIEmbedProps> = ({ src, title = 'KRENKE_DASHBOARD' }) => {
  return (
    <div className="fixed inset-0 bg-[#0F0C29]">
      <iframe
        title={title}
        src={src}
        className="w-full h-full border-0"
        allowFullScreen
      />
    </div>
  );
};

export default PowerBIEmbed;
