// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "nuxt-gtag", "@nuxtjs/sitemap"],
  site: {
    url: "https://kriptoon.com",
    name: "Kriptoon - Canlı Kripto Para Takip",
  },
  sitemap: {
    // Otomatik olarak tüm sayfaları tarar
  },
  gtag: {
    id: "G-EXZJBLK1RF",
  },
});
