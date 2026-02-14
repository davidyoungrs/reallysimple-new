import { db } from '../src/db/index.js';
import { cardViews, businessCards } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

// export const config = {
//     runtime: 'edge',
// };

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const body = await req.json();
        const { slug } = body;

        if (!slug) {
            return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });
        }

        // Find card by slug
        const cards = await db
            .select()
            .from(businessCards)
            .where(eq(businessCards.slug, slug))
            .limit(1);

        if (cards.length === 0) {
            return new Response(JSON.stringify({ error: 'Card not found' }), { status: 404 });
        }

        const cardId = cards[0].id;
        const { source = 'direct' } = body;

        // Extract referrer and user agent from headers
        const referrer = req.headers.get('referer') || req.headers.get('referrer') || null;
        const userAgent = req.headers.get('user-agent') || '';

        // Determine device type from user agent
        let deviceType = 'desktop';
        if (/mobile/i.test(userAgent)) {
            deviceType = 'mobile';
        } else if (/tablet|ipad/i.test(userAgent)) {
            deviceType = 'tablet';
        }

        // Extract geolocation data from Vercel headers
        const city = req.headers.get('x-vercel-ip-city') || null;
        const region = req.headers.get('x-vercel-ip-country-region') || null;
        const country = req.headers.get('x-vercel-ip-country') || null;
        const latitude = req.headers.get('x-vercel-ip-latitude') || null;
        const longitude = req.headers.get('x-vercel-ip-longitude') || null;
        const ipAddress = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0] || null;

        // Insert view record
        await db.insert(cardViews).values({
            cardId,
            referrer,
            userAgent,
            city,
            region,
            country,
            latitude,
            longitude,
            ipAddress,
            deviceType,
            source,
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Error tracking view:', error);
        // Don't fail the request if analytics fails
        return new Response(JSON.stringify({ success: false, error: error?.message || 'Unknown error' }), {
            status: 200,  // Return 200 so it doesn't block the page
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
