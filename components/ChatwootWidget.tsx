import { useEffect } from 'react';

const CHATWOOT_BASE_URL = 'https://chat.krenke.com.br';
const CHATWOOT_WEBSITE_TOKEN = 'n5ddhwiakZVWGo7S7Acwb3kv';
const SCRIPT_ID = 'chatwoot-sdk-script';
const MAX_RETRIES = 3;

function loadScript(attempt: number) {
  const existing = document.getElementById(SCRIPT_ID);
  if (existing) existing.remove();

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.src = `${CHATWOOT_BASE_URL}/packs/js/sdk.js`;
  script.async = true;
  script.onload = () => {
    (window as any).chatwootSDK?.run({
      websiteToken: CHATWOOT_WEBSITE_TOKEN,
      baseUrl: CHATWOOT_BASE_URL,
    });
  };
  script.onerror = () => {
    script.remove();
    if (attempt < MAX_RETRIES) {
      setTimeout(() => loadScript(attempt + 1), 2000 * (attempt + 1));
    }
  };
  document.body.appendChild(script);
}

export const ChatwootWidget: React.FC = () => {
  useEffect(() => {
    if ((window as any).$chatwoot) return;

    (window as any).chatwootSettings = {
      position: 'right',
      type: 'expanded_bubble',
      launcherTitle: 'Fale conosco via Chat',
    };

    if (!document.getElementById(SCRIPT_ID)) loadScript(0);
  }, []);

  return null;
};
