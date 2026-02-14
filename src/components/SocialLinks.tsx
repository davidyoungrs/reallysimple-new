import type { SocialLink } from '../types';
import {
    Linkedin,
    Twitter,
    Github,
    Globe,
    Mail,
    Phone,
    Instagram,
    Youtube,
    ExternalLink,
    Link as LinkIcon
} from 'lucide-react';
import {
    TikTok,
    Pinterest,
    Spotify,
    SoundCloud,
    Bandcamp,
    BandLab,
    Tidal,
    Deezer,
    Pandora,
    IHeartRadio,
    AmazonMusic
} from './BrandIcons';

const iconMap: Record<string, any> = {
    linkedin: Linkedin,
    twitter: Twitter,
    github: Github,
    website: Globe,
    email: Mail,
    phone: Phone,
    instagram: Instagram,
    youtube: Youtube,
    tiktok: TikTok,
    pinterest: Pinterest,
    spotify: Spotify,
    soundcloud: SoundCloud,
    bandcamp: Bandcamp,
    bandlab: BandLab,
    tidal: Tidal,
    deezer: Deezer,
    pandora: Pandora,
    iheartradio: IHeartRadio,
    amazonmusic: AmazonMusic
};

interface SocialLinksProps {
    links: SocialLink[];
    className?: string;
    iconColor?: string;
    onLinkClick?: (platform: string, url: string) => void;
}

export function SocialLinks({ links, className = '', iconColor, onLinkClick }: SocialLinksProps) {
    if (!links.length) return null;

    return (
        <div className={`flex flex-wrap gap-3 justify-center ${className}`}>
            {links.map((link) => {
                const isCustom = link.platform === 'custom';
                const Icon = isCustom ? LinkIcon : (iconMap[link.platform] || ExternalLink);

                return (
                    <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onLinkClick?.(link.platform, link.url)}
                        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-300 border border-white/10 group shadow-lg hover:shadow-xl hover:-translate-y-1 relative flex items-center justify-center w-12 h-12 box-border"
                        aria-label={link.label || link.platform}
                        title={link.label || link.platform}
                    >
                        {isCustom && link.customIconUrl ? (
                            <img
                                src={link.customIconUrl}
                                alt={link.label || "Custom Link"}
                                className="w-5 h-5 object-contain"
                            />
                        ) : (
                            <Icon
                                className="w-5 h-5 opacity-90 group-hover:opacity-100 transition-opacity"
                                style={{ color: iconColor || '#ffffff' }}
                            />
                        )}
                    </a>
                );
            })}
        </div>
    );
}
