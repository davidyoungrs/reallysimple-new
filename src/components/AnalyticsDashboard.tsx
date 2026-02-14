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
import { Loader2, TrendingUp, MousePointerClick, Eye, Calendar, Download, FileDown, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { exportToCSV, exportToJSON } from '../utils/analyticsExport';

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
    mediaImpressions?: Array<{
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
    const { t } = useTranslation();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [rangeOption, setRangeOption] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        if (!slug && !cardId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (slug) params.append('slug', slug);
                if (cardId) params.append('cardId', cardId.toString());

                // Calculate dates
                let start: Date;
                let end = new Date(); // Default end is now

                if (rangeOption === 'custom') {
                    if (!customStart || !customEnd) return; // Don't fetch if incomplete
                    start = new Date(customStart);
                    end = new Date(customEnd);
                } else {
                    start = new Date();
                    const days = parseInt(rangeOption); // '7d' -> 7
                    start.setDate(start.getDate() - days);
                }

                params.append('startDate', start.toISOString());
                params.append('endDate', end.toISOString());

                const res = await fetch(`/api/get-analytics?${params.toString()}`);
                if (!res.ok) throw new Error('Failed to fetch analytics');
                const jsonData = await res.json();

                // Extract media impressions for the data object
                const mediaImpressions = (jsonData.clickBreakdown || [])
                    .filter((item: any) => item.type === 'media')
                    .map((item: any) => ({
                        type: formatPlatformName(item.platform),
                        count: item.count
                    }));

                setData({
                    ...jsonData,
                    mediaImpressions
                });
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Error loading data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, cardId, rangeOption, customStart, customEnd]);

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
            website: t('Website'),
            email: t('Email'),
            phone: t('Phone'),
            vcard: t('Save Contact'),
            wallet: t('Wallet Pass'),
            whatsapp: 'WhatsApp',
            telegram: 'Telegram',
            spotify: 'Spotify',
            soundcloud: 'SoundCloud',
            pinterest: 'Pinterest',
            vimeo: 'Vimeo'
        };
        // Use translation map if available, otherwise just capitalize
        return map[platform.toLowerCase()] || platform.charAt(0).toUpperCase() + platform.slice(1);
    };

    // Helper to format date based on current language
    const formatDate = (value: any) => {
        if (!value) return '';
        const dateString = typeof value === 'string' ? value : String(value);

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return new Intl.DateTimeFormat(i18n.language, { month: 'short', day: 'numeric' }).format(date);
        } catch (e) {
            return dateString;
        }
    };

    // Helper to get current range text for export
    const getRangeText = () => {
        if (rangeOption === 'custom') {
            return `${customStart} to ${customEnd}`;
        }
        return t(`Last ${rangeOption.replace('d', '')} Days`) || rangeOption;
    };

    const handleExport = (format: 'csv' | 'json') => {
        if (!data) return;
        setExporting(true);

        const exportData = {
            cardName: slug || cardId?.toString() || 'Business Card',
            dateRange: getRangeText(),
            ...data
        };

        try {
            if (format === 'csv') {
                exportToCSV(exportData);
            } else {
                exportToJSON(exportData);
            }
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setExporting(false);
            setShowExportMenu(false);
        }
    };


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-96">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-500">{t('Loading analytics...')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-96">
                <p className="text-red-500 mb-4">{t('Error')}: {error}</p>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    {t('Close')}
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
                    <h2 className="text-2xl font-bold text-gray-900">{t('Analytics Dashboard')}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {t('Performance for')} <span className="font-medium text-gray-700">/{slug || cardId}</span>
                    </p>
                </div>

                {/* Date Controls */}
                <div className="flex items-center gap-2">
                    <div className="text-gray-400">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <select
                        value={rangeOption}
                        onChange={(e) => setRangeOption(e.target.value as any)}
                        className="p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="7d">{t('Last 7 Days')}</option>
                        <option value="30d">{t('Last 30 Days')}</option>
                        <option value="90d">{t('Last 90 Days')}</option>
                        <option value="custom">{t('Custom Range')}</option>
                    </select>

                    {/* Export Dropdown */}
                    <div className="relative ml-2">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            disabled={exporting}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            <span className="hidden sm:inline">{t('Export')}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showExportMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowExportMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                                    <button
                                        onClick={() => handleExport('csv')}
                                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700 transition-colors"
                                    >
                                        <FileDown className="w-4 h-4 text-gray-500" />
                                        {t('Export as CSV')}
                                    </button>
                                    <button
                                        onClick={() => handleExport('json')}
                                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700 transition-colors"
                                    >
                                        <FileDown className="w-4 h-4 text-gray-500" />
                                        {t('Export as JSON')}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {rangeOption === 'custom' && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            <input
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className="p-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className="p-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                            />
                        </div>
                    )}
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
                            <span className="text-sm font-medium text-blue-800">{t('Total Views')}</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{data.totalViews}</p>
                    </div>

                    <div className="bg-violet-50 p-6 rounded-2xl border border-violet-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-violet-100 rounded-lg text-violet-600">
                                <MousePointerClick className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-violet-800">{t('Total Clicks')}</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{data.totalClicks}</p>
                    </div>

                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-emerald-800">{t('Click Through Rate')}</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{data.ctr}%</p>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Traffic Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('Traffic Overview')}</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.dailyStats}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="fullDate"
                                        tickFormatter={formatDate}
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
                                        labelFormatter={formatDate}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="views"
                                        name={t('Page Views') || "Page Views"}
                                        stroke="#3B82F6"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="clicks"
                                        name={t('Interactions') || "Interactions"}
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('Top Interactions')}</h3>
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
                                            name={t('Clicks') || "Clicks"}
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
                                <p>{t('No interactions yet')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {data.clickBreakdown.length > 5 && (
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">
                            {t('And more interaction types', { count: data.clickBreakdown.length - 5 })}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
