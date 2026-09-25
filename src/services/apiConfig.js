const viteEnv = import.meta.env ?? {};

export const apiConfig = Object.freeze({
  strapiApiUrl: viteEnv.VITE_STRAPI_API_URL ?? '',
  strapiToken: viteEnv.VITE_STRAPI_TOKEN ?? '',
});
