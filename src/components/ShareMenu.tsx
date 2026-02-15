import { useState } from 'react';
import { Share2, Copy, Download, ExternalLink, Check, Mail } from 'lucide-react';
import { downloadQRCodeAsSVG, downloadQRCodeAsPNG } from '../utils/qrDownload';
import { useTranslation } from 'react-i18next';
import type { CardData } from '../types';
import { EmailSignatureModal } from './EmailSignatureModal';

interface ShareMenuProps {
    cardSlug: string;
    data: CardData;
}

export function ShareMenu({ cardSlug, data }: ShareMenuProps) {
    const { t } = useTranslation();
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showSignatureModal, setShowSignatureModal] = useState(false);

    const publicUrl = `${window.location.origin}/card/${cardSlug}`;
    const qrUrl = `${publicUrl}?src=qr`;
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
            await downloadQRCodeAsSVG(qrUrl, `qr-${filename}`);
            setShowMenu(false);
        } catch (error) {
            console.error('Failed to download SVG:', error);
        }
    };

    const handleDownloadPNG = async () => {
        try {
            await downloadQRCodeAsPNG(qrUrl, `qr-${filename}`);
            setShowMenu(false);
        } catch (error) {
            console.error('Failed to download PNG:', error);
        }
    };

    const handleViewPublic = () => {
        window.open(publicUrl, '_blank');
        setShowMenu(false);
    };

    const handleEmailSignature = () => {
        setShowSignatureModal(true);
        setShowMenu(false);
    };

    const handleAddToWallet = async () => {
        try {
            const response = await fetch(`/api/generate-pass?slug=${cardSlug}`);

            if (!response.ok) {
                throw new Error(`Server returned ${response.status} ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${cardSlug}.pkpass`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            setShowMenu(false);
        } catch (error: any) {
            console.error('Error generating pass:', error);
            alert(`Failed to generate Apple Wallet pass: ${error.message}`);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
                <Share2 className="w-4 h-4" />
                {t('Share')}
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
                                    <span className="text-green-600">{t('Link copied!')}</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 text-gray-600" />
                                    <span>{t('Copy public link')}</span>
                                </>
                            )}
                        </button>

                        <div className="border-t border-gray-200 my-1" />

                        <button
                            onClick={handleEmailSignature}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm"
                        >
                            <Mail className="w-4 h-4 text-gray-600" />
                            <span>{t('Email Signature')}</span>
                        </button>

                        <div className="border-t border-gray-200 my-1" />

                        <button
                            onClick={handleDownloadSVG}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm"
                        >
                            <Download className="w-4 h-4 text-gray-600" />
                            <span>{t('Download QR (SVG)')}</span>
                        </button>

                        <button
                            onClick={handleDownloadPNG}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm"
                        >
                            <Download className="w-4 h-4 text-gray-600" />
                            <span>{t('Download QR (PNG)')}</span>
                        </button>

                        <div className="border-t border-gray-200 my-1" />

                        <button
                            onClick={handleAddToWallet}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm"
                        >
                            <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.665 16.811a10.316 10.316 0 0 1-1.021 1.837c-1.385 2.007-3.538 5.613-7.538 5.613-2.007 0-3.136-.931-5.136-.931-2.007 0-3.136.931-4.765.931-3.692 0-7.385-4.624-7.385-10.237 0-4.608 2.308-7.385 5.846-7.385 1.692 0 3.231 1.077 4.308 1.077 1.077 0 2.615-1.077 4.615-1.077 2.615 0 4.615 1.538 5.692 3.077-4.308 2.154-3.538 9.077 1.077 10.923l.154.062.154.012zM13.808 2.615a5.57 5.57 0 0 1 1.692-4.154 5.39 5.39 0 0 1-4.462 2.308 5.57 5.57 0 0 1-1.692 4.154 5.39 5.39 0 0 1 4.462-2.308z" />
                            </svg>
                            <span>{t('Add to Apple Wallet')}</span>
                        </button>

                        <div className="border-t border-gray-200 my-1" />

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleViewPublic();
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm"
                        >
                            <ExternalLink className="w-4 h-4 text-gray-600" />
                            <span>{t('View public card')}</span>
                        </button>
                    </div>
                </>
            )}

            {showSignatureModal && (
                <EmailSignatureModal
                    data={data}
                    cardUrl={publicUrl}
                    isOpen={showSignatureModal}
                    onClose={() => setShowSignatureModal(false)}
                />
            )}
        </div>
    );
}
