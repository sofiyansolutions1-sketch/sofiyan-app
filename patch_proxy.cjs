const fs = require('fs');

// 1. Patch vite.config.ts
let viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
viteConfig = viteConfig.replace('export default defineConfig({', `export default defineConfig({
  server: {
    proxy: {
      '/supabase-api': {
        target: 'https://bvtqginkszmzzmetdjdm.supabase.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/supabase-api/, '')
      }
    }
  },`);
fs.writeFileSync('vite.config.ts', viteConfig);

// 2. Patch server.ts
let serverCode = fs.readFileSync('server.ts', 'utf8');
if (!serverCode.includes('http-proxy-middleware')) {
  serverCode = `import { createProxyMiddleware } from 'http-proxy-middleware';\n` + serverCode;
  serverCode = serverCode.replace('// Vite middleware for development', `
  // Proxy for Supabase (Bypass AdBlockers / CORS)
  app.use('/supabase-api', createProxyMiddleware({
    target: 'https://bvtqginkszmzzmetdjdm.supabase.co',
    changeOrigin: true,
    pathRewrite: { '^/supabase-api': '' },
    onProxyReq: (proxyReq, req, res) => {
       // Optional: you can log proxy requests here if needed
    },
    onError: (err, req, res) => {
       console.error("Proxy error:", err);
       res.status(500).send("Proxy error");
    }
  }));

  // Vite middleware for development`);
  fs.writeFileSync('server.ts', serverCode);
}

// 3. Patch supabaseClient.ts
let clientCode = fs.readFileSync('supabaseClient.ts', 'utf8');
clientCode = clientCode.replace(
  `SUPABASE_URL = "https://bvtqginkszmzzmetdjdm.supabase.co";`,
  `SUPABASE_URL = (typeof window !== 'undefined' ? (window.location.origin + '/supabase-api') : "https://bvtqginkszmzzmetdjdm.supabase.co");`
);
// Replace the other fallback
clientCode = clientCode.replace(
  /let SUPABASE_URL = .*/,
  `let SUPABASE_URL = getEnvValue('VITE_SUPABASE_URL') || (typeof window !== 'undefined' ? (window.location.origin + '/supabase-api') : "https://bvtqginkszmzzmetdjdm.supabase.co");`
);
fs.writeFileSync('supabaseClient.ts', clientCode);
console.log("Patched proxy settings!");
