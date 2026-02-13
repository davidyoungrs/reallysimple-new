import type { CardData } from '../types';
import { SocialLinks } from './SocialLinks';
import { Download, Wallet, Loader2, Phone } from 'lucide-react';
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
        phoneNumbers,
        socialLinks,
        embeds
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
        <div
            className="relative w-full max-w-md mx-auto min-h-[600px] overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-3xl"
            style={{ fontFamily: data.font || 'Inter' }}
        >
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
            <div className={`relative z-10 h-full flex flex-col ${data.layoutMode === 'modern-left' ? 'items-start text-left' : 'items-center text-center'} justify-between p-8 text-white`}>

                {/* Header / Avatar */}
                <div className={`flex flex-col ${data.layoutMode === 'modern-left' ? 'items-start' : 'items-center'} space-y-4 mt-8 w-full`}>
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
                        <div className={`relative group ${data.photoStyle === 'full' || data.layoutMode === 'hero' ? 'w-full mb-6 mx-0' : 'mx-auto'}`}>
                            {data.photoStyle !== 'full' && data.layoutMode !== 'hero' && (
                                <div className={`absolute -inset-1 bg-gradient-to-r from-pink-500 to-violet-500 blur opacity-25 group-hover:opacity-75 transition duration-500 ${data.photoStyle === 'rounded' ? 'rounded-[2rem]' : 'rounded-full'}`}></div>
                            )}
                            <div className={`relative overflow-hidden bg-white/5 ${data.layoutMode === 'hero'
                                ? 'w-full aspect-video rounded-2xl shadow-lg mx-auto'
                                : data.photoStyle === 'full'
                                    ? 'w-full aspect-[4/3] rounded-none shadow-none'
                                    : data.photoStyle === 'rounded'
                                        ? 'w-32 h-32 rounded-3xl border-4 border-white/10 shadow-xl mx-auto'
                                        : 'w-32 h-32 rounded-full border-4 border-white/10 shadow-xl mx-auto'
                                }`}>
                                <img
                                    src={avatarUrl}
                                    alt={fullName}
                                    className="w-full h-full object-cover transition-transform will-change-transform"
                                    style={{
                                        transform: `scale(${data.avatarScale || 1}) translate(${data.avatarPosition?.x || 0}px, ${data.avatarPosition?.y || 0}px)`
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div className={`${data.layoutMode === 'modern-left' ? 'text-left' : 'text-center'} space-y-1 w-full`}>
                        <h1 className="text-3xl font-bold tracking-tight">{fullName}</h1>
                        <p className="text-lg font-medium text-white/80">{jobTitle}</p>
                        {!logoUrl && (
                            <p className="text-sm font-light uppercase tracking-widest text-white/60">{company}</p>
                        )}
                    </div>
                </div>

                {/* Bio */}
                <div className={`${data.layoutMode === 'modern-left' ? 'text-left' : 'text-center'} max-w-xs`}>
                    <p className="text-white/90 leading-relaxed font-light">{bio}</p>
                </div>

                {/* Social Links */}
                <div className="w-full">
                    <SocialLinks links={socialLinks} className="mb-8" />
                </div>

                {/* Phone Numbers */}
                {(phoneNumbers || []).length > 0 && (
                    <div className="w-full flex flex-col gap-3 mb-8">
                        {phoneNumbers?.map((phone) => (
                            <a
                                key={phone.id}
                                href={`tel:${phone.number}`}
                                className="flex items-center gap-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 p-4 rounded-2xl transition-all hover:scale-[1.02] group"
                            >
                                <div className="bg-white/20 p-2.5 rounded-full group-hover:bg-white/30 transition-colors">
                                    <Phone className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-xs text-white/60 font-medium uppercase tracking-wider">{phone.label}</span>
                                    <span className="text-white font-medium text-lg">{phone.number}</span>
                                </div>
                            </a>
                        ))}
                    </div>
                )}

                {/* Actions & QR Code */}
                <div className={`w-full space-y-4 mb-4 ${data.stickyActionBar ? 'pb-24' : ''}`}>
                    {/* Rich Media Embeds */}
                    {(embeds || []).map((embed, index) => {
                        let embedUrl = embed.url;
                        if (embed.type === 'youtube') {
                            if (embed.url.includes('youtu.be/')) {
                                embedUrl = `https://www.youtube.com/embed/${embed.url.split('youtu.be/')[1]?.split('?')[0]}`;
                            } else if (embed.url.includes('youtube.com/watch')) {
                                const v = new URLSearchParams(embed.url.split('?')[1]).get('v');
                                if (v) embedUrl = `https://www.youtube.com/embed/${v}`;
                            }
                        } else if (embed.type === 'spotify') {
                            if (embed.url.includes('open.spotify.com') && !embed.url.includes('/embed')) {
                                embedUrl = embed.url.replace('open.spotify.com', 'open.spotify.com/embed');
                            }
                        } else if (embed.type === 'vimeo') {
                            // Extract video ID from https://vimeo.com/123456789
                            const vimeoId = embed.url.split('vimeo.com/')[1]?.split('/')[0];
                            if (vimeoId) embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
                        }
                        // TikTok and Instagram use the raw URL or a slight modification in the render block, but let's ensure we have a valid URL
                        if (!embed.url) return null;

                        if (!embedUrl) return null;

                        return (
                            <div key={index} className="w-full mb-6 overflow-hidden rounded-2xl shadow-lg border border-white/10 bg-black/20">
                                {embed.title && <div className="px-4 py-2 text-sm font-medium text-white/80 bg-black/40">{embed.title}</div>}
                                {embed.type === 'youtube' ? (
                                    <iframe
                                        src={embedUrl}
                                        className="w-full aspect-video"
                                        title={embed.title || "YouTube video player"}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : embed.type === 'vimeo' ? (
                                    <iframe
                                        src={embedUrl}
                                        className="w-full aspect-video"
                                        title={embed.title || "Vimeo video player"}
                                        allow="autoplay; fullscreen; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : embed.type === 'tiktok' ? (
                                    <blockquote
                                        className="tiktok-embed"
                                        cite={embed.url}
                                        data-video-id={embed.url.split('/video/')[1]?.split('?')[0]}
                                        style={{ maxWidth: '100%', minWidth: '325px' }}
                                    >
                                        <iframe
                                            src={`https://www.tiktok.com/embed/v2/${embed.url.split('/video/')[1]?.split('?')[0]}`}
                                            className="w-full aspect-[9/16] h-[550px]"
                                            allow="encrypted-media;"
                                        ></iframe>
                                    </blockquote>
                                ) : embed.type === 'instagram' ? (
                                    <iframe
                                        src={`${embedUrl}${embedUrl.endsWith('/') ? '' : '/'}embed`}
                                        className="w-full aspect-[4/5] min-h-[450px]"
                                        title={embed.title || "Instagram post"}
                                        allowTransparency
                                        allow="encrypted-media"
                                    ></iframe>
                                ) : (
                                    <iframe
                                        src={embedUrl}
                                        className="w-full h-[152px]"
                                        title={embed.title || "Spotify player"}
                                        allow="encrypted-media"
                                        loading="lazy"
                                    ></iframe>
                                )}
                            </div>
                        );
                    })}

                    {/* Sections (Accordion) */}
                    {/* Sections (Accordion) - Temporarily Disabled
                    {(data.sections || []).map((section) => (
                        <div key={section.id} className="w-full mb-4">
                            <details className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 open:bg-white/10">
                                <summary className="flex items-center justify-between p-4 cursor-pointer list-none text-white font-medium hover:bg-white/5 transition-colors">
                                    <span>{section.title}</span>
                                    <span className="transform group-open:rotate-180 transition-transform duration-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </span>
                                </summary>
                                <div className="p-4 pt-0 space-y-3 border-t border-white/10">
                                    <div className="h-4"></div>
                                    <SocialLinks links={section.links} />
                                </div>
                            </details>
                        </div>
                    ))}
                    */}

                    {data.stickyActionBar ? (
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent z-50 backdrop-blur-sm">
                            <div className="flex gap-3 max-w-md mx-auto">
                                <button
                                    onClick={handleDownloadVCard}
                                    className="flex-1 flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-100 py-3.5 rounded-xl transition-all active:scale-95 font-bold shadow-lg cursor-pointer"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>{t('Save Contact')}</span>
                                </button>
                                <button
                                    onClick={handleAddToWallet}
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 bg-black/80 hover:bg-black text-white border border-white/20 py-3.5 rounded-xl transition-all active:scale-95 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                                    <span>{loading ? t('Creating...') : t('Wallet Pass')}</span>
                                </button>
                            </div>
                        </div>
                    ) : (
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
                    )}

                    <div className={`flex justify-center pt-2 ${data.stickyActionBar ? 'mb-4' : ''}`}>
                        <div className="p-2 bg-white rounded-xl shadow-lg">
                            {/* QR Code pointing to current URL */}
                            <QRCodeSVG value={window.location.href} size={48} />
                        </div>
                    </div>
                </div>

            </div>
        </div >
    );
}
