import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

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
            try {
              const url = new URL(req.url, `http://${req.headers.host}`);
              const apiPath = url.pathname.replace('/api/', '');

              // Handle dynamic routes
              let filename = apiPath;
              if (apiPath.startsWith('get-card-by-slug/')) {
                filename = 'get-card-by-slug';
              }

              const filePath = path.join(process.cwd(), 'api', `${filename}.ts`);

              if (fs.existsSync(filePath)) {
                // Invalidate cache to allow hot reloading of API files
                const mod = await server.ssrLoadModule(filePath);

                // Create a standard Request object
                const webRequest = new Request(url.toString(), {
                  method: req.method,
                  headers: req.headers as Record<string, string>,
                  body: (req.method === 'POST' || req.method === 'PUT') ? await readBody(req) : undefined
                });

                const response = await mod.default(webRequest);

                res.statusCode = response.status;
                response.headers.forEach((val: string, key: string) => res.setHeader(key, val));

                if (response.body) {
                  const buffer = await response.arrayBuffer();
                  res.write(Buffer.from(buffer));
                }
                res.end();
                return;
              }
            } catch (error: unknown) {
              console.error('API handler error:', error);
              const errorMessage = error instanceof Error ? error.message : String(error);
              const errorStack = error instanceof Error ? error.stack : '';
              fs.appendFileSync('debug.log', `API Handler Error: ${errorMessage}\n${errorStack}\n`);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Internal server error', details: errorMessage }));
            }
            return;
          }
          next();
        });
      }
    }
  ],
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function readBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => body += chunk);
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}
