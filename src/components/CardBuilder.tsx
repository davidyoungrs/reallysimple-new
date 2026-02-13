import React, { useState, useEffect } from 'react';
import { UserButton } from '@clerk/clerk-react';
import { initialCardData, type CardData } from '../types';
import { BusinessCard } from './BusinessCard';
import { Editor } from './Editor';
import { loadFromUrl, saveToUrl } from '../utils/urlState';
import { useTranslation } from 'react-i18next';
import { ChevronUp, ChevronDown, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LanguageSelector } from './LanguageSelector';


// Helper component to scale content to fit container
const ScaleToFit = ({ children }: { children: React.ReactNode }) => {
    const [scale, setScale] = useState(1);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const calculateScale = () => {
            if (!containerRef.current || !contentRef.current) return;

            const container = containerRef.current;
            const content = contentRef.current;

            // add some padding
            const padding = 40;
            const availableWidth = container.clientWidth - padding;
            const availableHeight = container.clientHeight - padding;

            const contentWidth = content.scrollWidth;
            const contentHeight = content.scrollHeight;

            if (contentWidth === 0 || contentHeight === 0) return;

            const scaleX = availableWidth / contentWidth;
            const scaleY = availableHeight / contentHeight;

            // Scale down if too big, but max scale is 1 (don't scale up pixelated)
            const newScale = Math.min(scaleX, scaleY, 1);

            setScale(newScale);
        };

        // Initial calculation
        calculateScale();

        // Observe resizing
        const observer = new ResizeObserver(calculateScale);
        if (containerRef.current) observer.observe(containerRef.current);
        if (contentRef.current) observer.observe(contentRef.current);

        return () => observer.disconnect();
    }, [children]); // Re-calculate when children change

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
            <div
                ref={contentRef}
                style={{
                    transform: `scale(${scale})`,
                    transition: 'transform 0.1s ease-out'
                }}
                className="origin-center"
            >
                {children}
            </div>
        </div>
    );
};

export function CardBuilder() {
    const { t } = useTranslation();
    const [isEditorOpen, setIsEditorOpen] = useState(true);

    // Initialize state from URL or default
    const [data, setData] = useState<CardData>(() => {
        return loadFromUrl() || initialCardData;
    });

    // Save to URL whenever data changes
    useEffect(() => {
        const timer = setTimeout(() => {
            saveToUrl(data);
        }, 500); // Debounce by 500ms

        return () => clearTimeout(timer);
    }, [data]);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row relative overflow-hidden">

            {/* Back to Home */}
            <div className="fixed top-4 left-4 z-50">
                <Link to="/" className="flex items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-lg shadow-md border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <ArrowLeft className="w-4 h-4" />
                    {t('Home')}
                </Link>
            </div>

            {/* Right Side: User Profile & Language Switcher */}
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
                <LanguageSelector />

                <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-lg shadow-md border border-gray-200">
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>

            {/* Mobile Editor Toggle */}
            <div className="md:hidden fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsEditorOpen(!isEditorOpen)}
                    className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                    aria-label="Toggle Editor"
                >
                    {isEditorOpen ? <ChevronDown className="w-6 h-6" /> : <ChevronUp className="w-6 h-6" />}
                </button>
            </div>

            {/* Editor Side */}
            <div className={`
        fixed inset-x-0 bottom-0 z-40 bg-white rounded-t-3xl shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out border-t border-gray-200
        h-[75vh] md:h-screen md:relative md:inset-auto md:w-1/3 lg:w-1/4 md:rounded-none md:shadow-none md:border-r md:border-t-0 md:bg-white md:translate-y-0
        ${isEditorOpen ? 'translate-y-0' : 'translate-y-[calc(100%-80px)] md:translate-y-0'}
      `}>
                {/* Mobile Handle */}
                <div
                    className="w-full flex justify-center p-3 md:hidden cursor-pointer"
                    onClick={() => setIsEditorOpen(!isEditorOpen)}
                >
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>

                <div className="h-full overflow-y-auto pb-24 md:pb-0">
                    <Editor data={data} onChange={setData} />
                </div>
            </div>

            {/* Preview Side */}
            <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-8 bg-gray-50 h-[50vh] md:h-screen relative overflow-y-auto overflow-x-hidden">
                <div className="fixed inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50 pointer-events-none"></div>

                <ScaleToFit>
                    <BusinessCard data={data} />
                </ScaleToFit>

                <div className="mt-8 text-center text-gray-400 text-sm hidden md:block shrink-0 pb-8">
                    {t('Preview')}
                </div>
            </div>
        </div>
    );
}
