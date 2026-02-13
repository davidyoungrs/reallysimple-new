import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, ShieldCheck, Zap, Globe } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';

export const LandingPage = () => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="ReallySimple" className="h-16 w-auto" />
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Language Selector */}
                            <div className="hidden md:flex items-center gap-1 text-gray-600">
                                <Globe className="w-4 h-4" />
                                <select
                                    onChange={(e) => changeLanguage(e.target.value)}
                                    value={i18n.language}
                                    className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer font-medium outline-none"
                                >
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                    <option value="de">Deutsch</option>
                                    <option value="ar">العربية</option>
                                    <option value="ru">Русский</option>
                                </select>
                            </div>

                            <SignedIn>
                                <Link to="/app" className="hidden sm:inline-flex bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                                    {t('Dashboard')}
                                </Link>
                                <UserButton afterSignOutUrl="/" />
                            </SignedIn>
                            <SignedOut>
                                <Link to="/sign-in" className="text-sm font-medium text-gray-600 hover:text-gray-900">{t('Log in')}</Link>
                                <Link
                                    to="/sign-up"
                                    className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                                >
                                    {t('Create Card')}
                                </Link>
                            </SignedOut>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
                            {t('Hero Title')} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                {t('Hero Subtitle')}
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                            {t('Hero Desc')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                to="/sign-up"
                                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-full font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
                            >
                                {t('Start for Free')}
                            </Link>
                            <Link
                                to="/demo"
                                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all active:scale-95"
                            >
                                {t('View Demo')}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-50 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-50 rounded-full blur-3xl -z-10 opacity-40 pointer-events-none" />
            </div>

            {/* Features Grid */}
            <div className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">{t('Everything you need')}</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="w-6 h-6 text-amber-500" />}
                            title={t('Instant Sharing')}
                            description={t('Instant Sharing Desc')}
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="w-6 h-6 text-green-500" />}
                            title={t('Bank-Level Security')}
                            description={t('Security Desc')}
                        />
                        <FeatureCard
                            icon={<Share2 className="w-6 h-6 text-purple-500" />}
                            title={t('Smart Integration')}
                            description={t('Integration Desc')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="mb-4 bg-gray-50 w-12 h-12 flex items-center justify-center rounded-xl">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);
