import type { CardData } from '../types';
import { SocialLinks } from './SocialLinks';
import { Download, Wallet, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { downloadVCard } from '../utils/vcard';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BusinessCardProps {
    data: CardData;
}

export function BusinessCard({ data }: BusinessCardProps) {
    const { t } = useTranslation();
    const {
        fullName,
        jobTitle,
        company,
        bio,
        avatarUrl,
        logoUrl,
        themeColor,
        gradientColor,
        backgroundType,
        showPhoto,
        socialLinks
    } = data;
    const [loading, setLoading] = useState(false);

    const handleDownloadVCard = () => {
        downloadVCard(data);
    };

    const handleAddToWallet = async () => {
        setLoading(true);
        try {
            const emailLink = socialLinks.find(l => l.platform === 'email');

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-pass`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    fullName,
                    jobTitle,
                    company,
                    bio,
                    email: emailLink ? emailLink.url.replace('mailto:', '') : 'no-email@example.com'
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to generate pass');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'wallet-pass.pkpass');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error: any) {
            console.error('Error generating pass:', error);
            alert(`Failed to generate Apple Wallet pass: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-md mx-auto aspect-[9/16] sm:aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-3xl">
            {/* Background with dynamic gradient based on theme color */}
            {/* Background with dynamic gradient based on theme color */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black animate-gradient-slow"
                style={{
                    background: backgroundType === 'solid'
                        ? themeColor
                        : `linear-gradient(135deg, ${themeColor}, ${gradientColor || '#000000'})`
                }}
            />

            {/* Texture overlay (noise) for premium feel */}
            <div className="absolute inset-0 opacity-20 contrast-125 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            {/* Glassmorphism Container */}
            <div className="relative z-10 h-full flex flex-col items-center justify-between p-8 text-white">

                {/* Header / Avatar */}
                <div className="flex flex-col items-center space-y-4 mt-8">
                    {logoUrl && (
                        <div className="mb-2">
                            <img
                                src={logoUrl}
                                alt="Company Logo"
                                className="h-16 w-auto object-contain drop-shadow-lg"
                            />
                        </div>
                    )}

                    {showPhoto && (
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                            <img
                                src={avatarUrl}
                                alt={fullName}
                                className="relative w-32 h-32 rounded-full border-4 border-white/10 shadow-xl object-cover"
                            />
                        </div>
                    )}

                    <div className="text-center space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">{fullName}</h1>
                        <p className="text-lg font-medium text-white/80">{jobTitle}</p>
                        {!logoUrl && (
                            <p className="text-sm font-light uppercase tracking-widest text-white/60">{company}</p>
                        )}
                    </div>
                </div>

                {/* Bio */}
                <div className="text-center max-w-xs">
                    <p className="text-white/90 leading-relaxed font-light">{bio}</p>
                </div>

                {/* Social Links */}
                <div className="w-full">
                    <SocialLinks links={socialLinks} className="mb-8" />
                </div>

                {/* Actions & QR Code */}
                <div className="w-full space-y-4 mb-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleDownloadVCard}
                            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 py-3 rounded-xl transition-all active:scale-95 font-medium cursor-pointer"
                        >
                            <Download className="w-4 h-4" />
                            <span>{t('Save Contact')}</span>
                        </button>
                        <button
                            onClick={handleAddToWallet}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 py-3 rounded-xl transition-all active:scale-95 font-medium text-white/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                            <span>{loading ? t('Creating...') : t('Wallet Pass')}</span>
                        </button>
                    </div>

                    <div className="flex justify-center pt-2">
                        <div className="p-2 bg-white rounded-xl shadow-lg">
                            {/* QR Code pointing to current URL */}
                            <QRCodeSVG value={window.location.href} size={48} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
