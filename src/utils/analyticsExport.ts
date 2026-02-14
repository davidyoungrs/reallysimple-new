/**
 * Analytics Data Export Utilities
 * Converts analytics data to CSV and JSON formats for download
 */

interface ExportData {
    cardName: string;
    dateRange: string;
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

/**
 * Convert analytics data to CSV format and trigger download
 */
export function exportToCSV(data: ExportData): void {
    const { cardName, dateRange, totalViews, totalClicks, ctr, dailyStats, clickBreakdown, mediaImpressions } = data;

    let csv = '';

    // Header Section
    csv += `Analytics Report\n`;
    csv += `Card Name,${escapeCSV(cardName)}\n`;
    csv += `Date Range,${escapeCSV(dateRange)}\n`;
    csv += `\n`;

    // Summary Metrics
    csv += `Summary Metrics\n`;
    csv += `Total Views,${totalViews}\n`;
    csv += `Total Clicks,${totalClicks}\n`;
    csv += `Click-Through Rate,${(ctr * 100).toFixed(2)}%\n`;
    csv += `\n`;

    // Daily Traffic
    csv += `Daily Traffic\n`;
    csv += `Date,Views,Clicks\n`;
    dailyStats.forEach(day => {
        csv += `${day.fullDate},${day.views},${day.clicks}\n`;
    });
    csv += `\n`;

    // Click Breakdown
    csv += `Click Breakdown by Interaction\n`;
    csv += `Type,Platform/Target,Click Count\n`;
    clickBreakdown.forEach(item => {
        csv += `${escapeCSV(item.type)},${escapeCSV(item.platform)},${item.count}\n`;
    });

    // Media Impressions (if available)
    if (mediaImpressions && mediaImpressions.length > 0) {
        csv += `\n`;
        csv += `Media Impressions\n`;
        csv += `Media Type,View Count\n`;
        mediaImpressions.forEach(media => {
            csv += `${escapeCSV(media.type)},${media.count}\n`;
        });
    }

    // Create filename with sanitized card name and timestamp
    const sanitizedName = cardName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `analytics_${sanitizedName}_${timestamp}.csv`;

    downloadFile(csv, filename, 'text/csv');
}

/**
 * Convert analytics data to JSON format and trigger download
 */
export function exportToJSON(data: ExportData): void {
    const { cardName, dateRange } = data;

    // Create a structured JSON export
    const exportData = {
        metadata: {
            cardName,
            dateRange,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        },
        summary: {
            totalViews: data.totalViews,
            totalClicks: data.totalClicks,
            clickThroughRate: parseFloat((data.ctr * 100).toFixed(2))
        },
        dailyTraffic: data.dailyStats.map(day => ({
            date: day.fullDate,
            views: day.views,
            clicks: day.clicks
        })),
        clickBreakdown: data.clickBreakdown.map(item => ({
            type: item.type,
            target: item.platform,
            count: item.count
        })),
        ...(data.mediaImpressions && data.mediaImpressions.length > 0 && {
            mediaImpressions: data.mediaImpressions
        })
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    // Create filename
    const sanitizedName = cardName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `analytics_${sanitizedName}_${timestamp}.json`;

    downloadFile(jsonString, filename, 'application/json');
}

/**
 * Escape special characters in CSV values
 */
function escapeCSV(value: string): string {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);

    // If value contains comma, newline, or quote, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
}

/**
 * Trigger file download in the browser
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
