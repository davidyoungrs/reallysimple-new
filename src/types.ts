export type SocialPlatform = 'linkedin' | 'twitter' | 'github' | 'website' | 'email' | 'phone' | 'instagram' | 'youtube' | 'tiktok' | 'pinterest' | 'spotify' | 'soundcloud' | 'bandcamp' | 'bandlab' | 'tidal' | 'deezer' | 'pandora' | 'iheartradio' | 'amazonmusic' | 'custom';

export interface SocialLink {
    id: string;
    platform: SocialPlatform;
    url: string;
    label?: string;
    customIconUrl?: string; // Base64 or URL for custom icon
}

export interface CardData {
    fullName: string;
    jobTitle: string;
    company: string;
    bio: string;
    avatarUrl: string;
    logoUrl?: string;
    themeColor: string;
    gradientColor?: string;
    backgroundType: 'solid' | 'gradient';
    showPhoto: boolean;
    socialLinks: SocialLink[];
}

export const initialCardData: CardData = {
    fullName: 'David Young',
    jobTitle: 'Software Engineer',
    company: 'Really Simple Apps',
    bio: 'Building digital experiences that matter.',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    themeColor: '#3b82f6',
    gradientColor: '#000000',
    backgroundType: 'gradient',
    showPhoto: true,
    socialLinks: [
        { id: '1', platform: 'email', url: 'mailto:david@example.com', label: 'Email' },
        { id: '2', platform: 'website', url: 'https://reallysimpleapps.com', label: 'Website' },
        { id: '3', platform: 'linkedin', url: 'https://linkedin.com/in/davidyoung', label: 'LinkedIn' },
    ]
};
