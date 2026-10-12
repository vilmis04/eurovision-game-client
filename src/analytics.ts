export const initAnalytics = async () => {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key) return;

  const { default: posthog } = await import('posthog-js');
  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com',
  });
};
