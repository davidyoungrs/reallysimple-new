import { db } from '../src/db';
import { businessCards, cardViews, cardClicks } from '../src/db/schema';
import { eq, sql, and, gte, desc } from 'drizzle-orm';

export default async function handler(request: Request) {
    if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const url = new URL(request.url);
        const slug = url.searchParams.get('slug');
        const cardIdParam = url.searchParams.get('cardId');

        if (!slug && !cardIdParam) {
            return new Response(JSON.stringify({ error: 'Missing cardId or slug' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        let cardId: number;

        if (slug) {
            const card = await db.select({ id: businessCards.id })
                .from(businessCards)
                .where(eq(businessCards.slug, slug))
                .limit(1);

            if (!card.length) {
                return new Response(JSON.stringify({ error: 'Card not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            cardId = card[0].id;
        } else {
            cardId = parseInt(cardIdParam!);
        }

        // Calculate date range (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Fetch daily views
        const dailyViews = await db.select({
            date: sql<string>`DATE_TRUNC('day', ${cardViews.viewedAt})::text`,
            count: sql<number>`count(*)`
        })
            .from(cardViews)
            .where(and(
                eq(cardViews.cardId, cardId),
                gte(cardViews.viewedAt, thirtyDaysAgo)
            ))
            .groupBy(sql`DATE_TRUNC('day', ${cardViews.viewedAt})`)
            .orderBy(sql`DATE_TRUNC('day', ${cardViews.viewedAt})`);

        // Fetch daily clicks
        const dailyClicks = await db.select({
            date: sql<string>`DATE_TRUNC('day', ${cardClicks.clickedAt})::text`,
            count: sql<number>`count(*)`
        })
            .from(cardClicks)
            .where(and(
                eq(cardClicks.cardId, cardId),
                gte(cardClicks.clickedAt, thirtyDaysAgo)
            ))
            .groupBy(sql`DATE_TRUNC('day', ${cardClicks.clickedAt})`)
            .orderBy(sql`DATE_TRUNC('day', ${cardClicks.clickedAt})`);

        // Fetch click breakdown
        const clickBreakdown = await db.select({
            type: cardClicks.type,
            targetInfo: cardClicks.targetInfo,
            count: sql<number>`count(*)`
        })
            .from(cardClicks)
            .where(and(
                eq(cardClicks.cardId, cardId),
                gte(cardClicks.clickedAt, thirtyDaysAgo)
            ))
            .groupBy(cardClicks.type, cardClicks.targetInfo)
            .orderBy(desc(sql`count(*)`));

        // Aggregate total stats
        // Note: We could do separate counts, but aggregating from the breakdown is close enough for the "last 30 days" view.
        // If we want lifetime stats, we'd need separate queries without the date filter.
        // For dashboard, let's show "Last 30 Days" stats.

        const totalViews = dailyViews.reduce((acc, curr) => acc + Number(curr.count), 0);
        const totalClicks = dailyClicks.reduce((acc, curr) => acc + Number(curr.count), 0);
        const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

        // Merge daily stats into a single array for the chart
        // Create a map of date -> { views, clicks }
        const statsMap = new Map<string, { date: string, views: number, clicks: number }>();

        // Initialize with all dates in range (optional, but good for charts to avoid gaps)
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0] + ' 00:00:00+00'; // Match postgres truncated format approximately or just use YYYY-MM-DD
            // Postgres DATE_TRUNC returns timestamp string. Let's rely on simple string matching YYYY-MM-DD usually works if cast to date.
            // Actually, DATE_TRUNC('day', ...) returns '2023-10-27 00:00:00+00'.
            // Let's normalize everything to YYYY-MM-DD.
        }

        // Simpler approach: Just merge existing data. Recharts handles gaps if configured, but better to fill 0s.
        // Let's iterate 30 days backwards.
        const mergedStats = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD

            // Find matches. We need to parse the DB date string.
            // DB returns: "2023-10-27 00:00:00+00" (usually)

            const viewStat = dailyViews.find(v => v.date.startsWith(dateKey));
            const clickStat = dailyClicks.find(c => c.date.startsWith(dateKey));

            mergedStats.push({
                date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                fullDate: dateKey,
                views: viewStat ? Number(viewStat.count) : 0,
                clicks: clickStat ? Number(clickStat.count) : 0
            });
        }

        return new Response(JSON.stringify({
            totalViews,
            totalClicks,
            ctr: parseFloat(ctr.toFixed(2)),
            dailyStats: mergedStats,
            clickBreakdown: clickBreakdown.map(item => ({
                platform: item.targetInfo,
                type: item.type,
                count: Number(item.count)
            }))
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
