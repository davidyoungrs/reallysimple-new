import { useState } from 'react';
import { Share2, Copy, Download, ExternalLink, Check } from 'lucide-react';
import { downloadQRCodeAsSVG, downloadQRCodeAsPNG } from '../utils/qrDownload';

interface ShareMenuProps {
    cardSlug: string;
    cardName: string;
}

export function ShareMenu({ cardSlug }: ShareMenuProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    const publicUrl = `${window.location.origin}/card/${cardSlug}`;
    const filename = cardSlug || 'business-card';

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(publicUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
    };

    const handleDownloadSVG = async () => {
        try {
            await downloadQRCodeAsSVG(publicUrl, `qr-${filename}`);
            setShowMenu(false);
        } catch (error) {
            console.error('Failed to download SVG:', error);
        }
    };

    const handleDownloadPNG = async () => {
        try {
            await downloadQRCodeAsPNG(publicUrl, `qr-${filename}`);
            setShowMenu(false);
        } catch (error) {
            console.error('Failed to download PNG:', error);
        }
    };

    const handleViewPublic = () => {
        window.open(publicUrl, '_blank');
        setShowMenu(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                <Share2 className="w-4 h-4" />
                Share
            </button>

            {showMenu && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <button
                            onClick={handleCopyLink}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span className="text-green-600">Link copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 text-gray-600" />
                                    <span>Copy public link</span>
                                </>
                            )}
                        </button>

                        <div className="border-t border-gray-200 my-1" />

                        <button
                            onClick={handleDownloadSVG}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm"
                        >
                            <Download className="w-4 h-4 text-gray-600" />
                            <span>Download QR (SVG)</span>
                        </button>

                        <button
                            onClick={handleDownloadPNG}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm"
                        >
                            <Download className="w-4 h-4 text-gray-600" />
                            <span>Download QR (PNG)</span>
                        </button>

                        <div className="border-t border-gray-200 my-1" />

                        <button
                            onClick={handleViewPublic}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm"
                        >
                            <ExternalLink className="w-4 h-4 text-gray-600" />
                            <span>View public card</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
