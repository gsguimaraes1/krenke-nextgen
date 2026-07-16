import { useEffect } from 'react';

const CHATWOOT_BASE_URL = 'https://krenke-chatwoot.0yc0it.easypanel.host';
const CHATWOOT_WEBSITE_TOKEN = 'k2GmRoCSCsWrh7rggpX7wxkr';

export const ChatwootWidget: React.FC = () => {
  useEffect(() => {
    if ((window as any).$chatwoot || document.getElementById('chatwoot-sdk-script')) return;

    (window as any).chatwootSettings = {
      position: 'right',
      type: 'expanded_bubble',
      launcherTitle: '',
    };

    const script = document.createElement('script');
    script.id = 'chatwoot-sdk-script';
    script.src = `${CHATWOOT_BASE_URL}/packs/js/sdk.js`;
    script.async = true;
    script.onload = () => {
      (window as any).chatwootSDK?.run({
        websiteToken: CHATWOOT_WEBSITE_TOKEN,
        baseUrl: CHATWOOT_BASE_URL,
      });
    };
    document.body.appendChild(script);
  }, []);

  return null;
};
