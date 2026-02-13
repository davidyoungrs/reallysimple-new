import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'api-routes',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.startsWith('/api/')) {
            const apiPath = req.url.replace('/api/', '');

            try {
              // Dynamically import the API handler
              const handler = await import(`./api/${apiPath}.ts`);

              // Convert Node.js request to Web Request
              const url = `http://${req.headers.host}${req.url}`;
              let body = '';

              if (req.method === 'POST' || req.method === 'PUT') {
                body = await new Promise<string>((resolve) => {
                  let data = '';
                  req.on('data', chunk => data += chunk);
                  req.on('end', () => resolve(data));
                });
              }

              const webRequest = new Request(url, {
                method: req.method,
                headers: req.headers as Record<string, string>,
                body: body || undefined,
              });

              // Call the handler
              const response = await handler.default(webRequest);

              // Convert Web Response to Node.js response
              res.statusCode = response.status;
              response.headers.forEach((value: string, key: string) => {
                res.setHeader(key, value);
              });

              const responseBody = await response.text();
              res.end(responseBody);
            } catch (error: any) {
              console.error('API handler error:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Internal server error', details: error?.message || 'Unknown error' }));
            }
          } else {
            next();
          }
        });
      }
    }
  ],
})
