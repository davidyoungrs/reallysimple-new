import { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { Loader2, TrendingUp, MousePointerClick, Eye } from 'lucide-react';

interface AnalyticsData {
    totalViews: number;
    totalClicks: number;
    ctr: number;
    dailyStats: Array<{
        date: string;
        fullDate: string;
        views: number;
        clicks: number;
    }>;
    clickBreakdown: Array<{
        platform: string;
        type: string;
        count: number;
    }>;
}

interface AnalyticsDashboardProps {
    slug?: string;
    cardId?: number;
    onClose?: () => void;
}

export function AnalyticsDashboard({ slug, cardId, onClose }: AnalyticsDashboardProps) {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug && !cardId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (slug) params.append('slug', slug);
                if (cardId) params.append('cardId', cardId.toString());

                const res = await fetch(`/api/get-analytics?${params.toString()}`);
                if (!res.ok) throw new Error('Failed to fetch analytics');
                const jsonData = await res.json();
                setData(jsonData);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Error loading data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, cardId]);

    const formatPlatformName = (platform: string) => {
        if (!platform) return 'Unknown';

        // Handle URLs
        if (platform.startsWith('http')) {
            try {
                const hostname = new URL(platform).hostname.replace(/^www\./, '');
                return hostname;
            } catch {
                return 'External Link';
            }
        }

        const map: Record<string, string> = {
            instagram: 'Instagram',
            linkedin: 'LinkedIn',
            tiktok: 'TikTok',
            youtube: 'YouTube',
            github: 'GitHub',
            twitter: 'X (Twitter)',
            facebook: 'Facebook',
            website: 'Website',
            email: 'Email',
            phone: 'Phone',
            vcard: 'Save Contact',
            wallet: 'Wallet Pass',
            whatsapp: 'WhatsApp',
            telegram: 'Telegram',
            spotify: 'Spotify',
            soundcloud: 'SoundCloud',
            pinterest: 'Pinterest',
            vimeo: 'Vimeo'
        };
        return map[platform.toLowerCase()] || platform.charAt(0).toUpperCase() + platform.slice(1);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-96">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-500">Loading analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-96">
                <p className="text-red-500 mb-4">Error: {error}</p>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    Close
                </button>
            </div>
        );
    }

    if (!data) return null;

    // Prepare chart data with formatted labels
    const chartData = data.clickBreakdown.map(item => ({
        ...item,
        platformLabel: formatPlatformName(item.platform)
    }));

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-5xl w-full mx-auto relative">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Performance for <span className="font-medium text-gray-700">/{slug || cardId}</span> (Last 30 Days)
                    </p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="p-6 space-y-8 overflow-y-auto max-h-[80vh]">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Eye className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-blue-800">Total Views</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{data.totalViews}</p>
                    </div>

                    <div className="bg-violet-50 p-6 rounded-2xl border border-violet-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-violet-100 rounded-lg text-violet-600">
                                <MousePointerClick className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-violet-800">Total Clicks</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{data.totalClicks}</p>
                    </div>

                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-emerald-800">Click Through Rate</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{data.ctr}%</p>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Traffic Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Traffic Overview</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.dailyStats}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        minTickGap={30}
                                    />
                                    <YAxis
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="views"
                                        name="Page Views"
                                        stroke="#3B82F6"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="clicks"
                                        name="Interactions"
                                        stroke="#8B5CF6"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Engagement Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Interactions</h3>
                        {data.clickBreakdown.length > 0 ? (
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={chartData.slice(0, 5)}
                                        layout="vertical"
                                        margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="platformLabel"
                                            type="category"
                                            tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
                                            tickLine={false}
                                            axisLine={false}
                                            width={100}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#F3F4F6' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar
                                            dataKey="count"
                                            name="Clicks"
                                            fill="#10B981"
                                            radius={[0, 4, 4, 0]}
                                            barSize={32}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <MousePointerClick className="w-8 h-8 mb-2 opacity-50" />
                                <p>No interactions yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {data.clickBreakdown.length > 5 && (
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">
                            And {data.clickBreakdown.length - 5} more interaction types...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
