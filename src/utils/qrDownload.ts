import QRCode from 'qrcode';

/**
 * Download QR code as SVG file
 */
export async function downloadQRCodeAsSVG(url: string, filename: string): Promise<void> {
    try {
        const svgString = await QRCode.toString(url, {
            type: 'svg',
            width: 512,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const downloadUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${filename}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        console.error('Error generating SVG QR code:', error);
        throw error;
    }
}

/**
 * Download QR code as PNG file
 */
export async function downloadQRCodeAsPNG(url: string, filename: string): Promise<void> {
    try {
        const dataUrl = await QRCode.toDataURL(url, {
            width: 1024,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error generating PNG QR code:', error);
        throw error;
    }
}

/**
 * Generate QR code as data URL for preview
 */
export async function generateQRCodeDataURL(url: string): Promise<string> {
    try {
        return await QRCode.toDataURL(url, {
            width: 256,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });
    } catch (error) {
        console.error('Error generating QR code preview:', error);
        throw error;
    }
}
