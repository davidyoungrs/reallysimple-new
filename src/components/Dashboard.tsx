import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser, useAuth, UserButton } from '@clerk/clerk-react';
import { ArrowLeft, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { BusinessCard } from './BusinessCard';
import { ShareMenu } from './ShareMenu';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { BarChart2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';

interface Card {
    id: number;
    slug: string;
    data: any;
    viewCount: number;
    updatedAt: string;
}

export function Dashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useUser();
    const { getToken } = useAuth();
    const [cards, setCards] = useState<Card[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteConfirmCard, setDeleteConfirmCard] = useState<{ id: number; name: string } | null>(null);
    const [analyticsCard, setAnalyticsCard] = useState<Card | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Load cards on mount
    useEffect(() => {
        loadCards();
    }, [user]);

    const loadCards = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const token = await getToken();

            if (!token) {
                console.error('No token found');
                return;
            }

            console.log('Fetching cards with token...');
            const response = await fetch('/api/get-cards', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCards(data.cards || []);
            }
        } catch (error) {
            console.error('Error loading cards:', error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleEdit = (card: Card) => {
        // Navigate to card builder with card loaded
        navigate('/app', { state: { cardId: card.id } });
    };

    const handleDelete = async (cardId: number) => {
        if (!user) return;

        setIsDeleting(true);
        try {
            const response = await fetch('/api/delete-card', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cardId,
                    userId: user.id,
                }),
            });

            if (response.ok) {
                // Remove card from list
                setCards(cards.filter(c => c.id !== cardId));
                setDeleteConfirmCard(null);
            } else {
                console.error('Failed to delete card');
            }
        } catch (error) {
            console.error('Error deleting card:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/"
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="text-sm font-medium">{t('Home')}</span>
                            </Link>
                            <div className="h-6 w-px bg-gray-300" />
                            <h1 className="text-2xl font-bold text-gray-900">{t('My Cards')}</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <LanguageSelector />
                            <Link
                                to="/app"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{t('Create Card')}</span>
                            </Link>
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">{t('Loading your cards...')}</p>
                    </div>
                ) : cards.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="max-w-md mx-auto">
                            <div className="text-6xl mb-4">📇</div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('No cards yet')}</h2>
                            <p className="text-gray-600 mb-6">{t('Create your first digital business card to get started!')}</p>
                            <Link
                                to="/app"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                <span>{t('Create Your First Card')}</span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {cards.map((card) => (
                            <div
                                key={card.id}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow"
                            >
                                {/* Card Preview */}
                                <div className="relative bg-gray-100 h-64 overflow-hidden rounded-t-xl">
                                    <div className="scale-[0.28] origin-top-left" style={{ width: '500px', height: '700px' }}>
                                        <BusinessCard data={card.data} />
                                    </div>
                                </div>

                                {/* Card Info */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 truncate mb-1">
                                        {card.data.name || card.data.fullName || t('Untitled Card')}
                                    </h3>

                                    {card.slug && (
                                        <p className="text-xs text-blue-600 font-mono truncate mb-2">
                                            /card/{card.slug}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" />
                                            <span>{card.viewCount || 0} {t('views')}</span>
                                        </div>
                                        <div className="text-xs">
                                            {new Date(card.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(card)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                            {t('Edit')}
                                        </button>

                                        {card.slug && (
                                            <>
                                                <button
                                                    onClick={() => setAnalyticsCard(card)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title={t('View Analytics') || "View Analytics"}
                                                >
                                                    <BarChart2 className="w-4 h-4" />
                                                </button>
                                                <ShareMenu cardSlug={card.slug} cardName={card.data.name || card.data.fullName} />
                                            </>
                                        )}

                                        <button
                                            onClick={() => setDeleteConfirmCard({ id: card.id, name: card.data.name || card.data.fullName || t('Untitled Card') })}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title={t('Delete card') || "Delete card"}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Delete Confirmation Modal */}
            {deleteConfirmCard && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('Delete Card?')}</h3>
                        <p className="text-gray-600 mb-6">
                            {t('Are you sure you want to delete')} "<strong>{deleteConfirmCard.name}</strong>"? {t('This action cannot be undone.')}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmCard(null)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                {t('Cancel')}
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirmCard.id)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? t('Deleting...') : t('Delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Modal */}
            {analyticsCard && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="w-full max-w-5xl">
                        <AnalyticsDashboard
                            cardId={analyticsCard.id}
                            slug={analyticsCard.slug}
                            onClose={() => setAnalyticsCard(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
