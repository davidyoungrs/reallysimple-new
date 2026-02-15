
export default function handler(req: Request) {
    return new Response(JSON.stringify({
        status: 'ok',
        time: new Date().toISOString(),
        environment: process.env.VERCEL ? 'vercel' : 'local'
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
        }
    });
}
