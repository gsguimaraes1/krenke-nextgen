import React from 'react';

const MarketingPage: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', background: '#f0f0f0' }}>
      <iframe
        title="Relatório Marketing"
        width="100%"
        height="100%"
        src="https://app.powerbi.com/view?r=eyJrIjoiZjUwM2ViZjEtY2I3Zi00MDYzLThiYTctOGM4OTI5OGFkMzBhIiwidCI6ImU1ZjY5ZGFiLTdkYWYtNGU1MS04MjdhLTEwNjkxOWE4ZjU5MCJ9&pageName=45032dae18a007e67b61"
        frameBorder="0"
        allowFullScreen
        style={{ display: 'block', border: 'none' }}
      />
    </div>
  );
};

export default MarketingPage;
