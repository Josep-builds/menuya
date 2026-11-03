import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Casi todas las pantallas dependen de la sesión (cookies), así que usamos
  // render dinámico clásico en vez de Cache Components.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
