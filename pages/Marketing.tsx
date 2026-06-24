import React from 'react';

const MarketingPage: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', background: '#f0f0f0' }}>
      <iframe
        title="Relatório Marketing"
        width="100%"
        height="100%"
        src="https://app.powerbi.com/reportEmbed?reportId=ca74aef5-8a03-4b3d-a253-0416febee60d&autoAuth=true&ctid=e5f69dab-7daf-4e51-827a-106919a8f590&actionBarEnabled=true"
        frameBorder="0"
        allowFullScreen
        style={{ display: 'block', border: 'none' }}
      />
    </div>
  );
};

export default MarketingPage;
