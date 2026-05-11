export const captureUTMs = () => {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const utms = {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_term: urlParams.get('utm_term'),
    utm_content: urlParams.get('utm_content'),
  };

  // Only store if at least one UTM is present
  if (Object.values(utms).some(val => val !== null)) {
    sessionStorage.setItem('krenke_utms', JSON.stringify(utms));
  }
};

export const getStoredUTMs = () => {
  if (typeof window === 'undefined') return {};
  const stored = sessionStorage.getItem('krenke_utms');
  return stored ? JSON.parse(stored) : {};
};
