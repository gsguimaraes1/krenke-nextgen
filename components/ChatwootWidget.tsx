import { useEffect } from 'react';

const CHATWOOT_BASE_URL = 'https://chat.krenke.com.br';
const CHATWOOT_WEBSITE_TOKEN = 'n5ddhwiakZVWGo7S7Acwb3kv';

export const ChatwootWidget: React.FC = () => {
  useEffect(() => {
    if ((window as any).$chatwoot || document.getElementById('chatwoot-sdk-script')) return;

    (window as any).chatwootSettings = {
      position: 'right',
      type: 'expanded_bubble',
      launcherTitle: 'Fale conosco via Chat',
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
