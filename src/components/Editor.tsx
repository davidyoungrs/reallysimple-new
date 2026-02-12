import { type CardData, type SocialLink, type SocialPlatform, type PhoneNumber } from '../types';
import { Plus, Trash2, GripVertical, Upload, X } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableSocialLinkProps {
    link: SocialLink;
    handleSocialChange: (id: string, field: keyof SocialLink, value: string) => void;
    removeSocialLink: (id: string) => void;
}

function SortableSocialLink({ link, handleSocialChange, removeSocialLink }: SortableSocialLinkProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: link.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="group flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
            <div className="flex items-center gap-2">
                <div {...attributes} {...listeners} className="touch-none">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move hidden sm:block" />
                </div>
                <span className="sm:hidden text-xs text-gray-400 font-medium px-1">Link</span>

                <select
                    value={link.platform}
                    onChange={(e) => handleSocialChange(link.id, 'platform', e.target.value as SocialPlatform)}
                    className="flex-1 sm:flex-none bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
                >
                    <option value="email">Email</option>
                    <option value="website">Website</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="amazonmusic">Amazon Music</option>
                    <option value="bandcamp">Bandcamp</option>
                    <option value="bandlab">BandLab</option>
                    <option value="deezer">Deezer</option>
                    <option value="github">GitHub</option>
                    <option value="instagram">Instagram</option>
                    <option value="iheartradio">iHeartRadio</option>
                    <option value="pandora">Pandora</option>
                    <option value="pinterest">Pinterest</option>
                    <option value="soundcloud">SoundCloud</option>
                    <option value="spotify">Spotify</option>
                    <option value="tidal">Tidal</option>
                    <option value="tiktok">TikTok</option>
                    <option value="twitter">Twitter</option>
                    <option value="youtube">YouTube</option>
                    <option value="custom">Custom Link</option>
                </select>
            </div>

            <div className="flex-1 flex flex-col gap-2">
                <input
                    type="text"
                    placeholder={link.platform === 'email' ? "Email Address" : "URL"}
                    value={link.url}
                    onChange={(e) => handleSocialChange(link.id, 'url', e.target.value)}
                    className="w-full px-4 py-3 sm:py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
                {link.platform === 'custom' && (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Label (e.g. My Portfolio)"
                            value={link.label || ''}
                            onChange={(e) => handleSocialChange(link.id, 'label', e.target.value)}
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id={`icon-${link.id}`}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            handleSocialChange(link.id, 'customIconUrl', reader.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            <label
                                htmlFor={`icon-${link.id}`}
                                className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors cursor-pointer text-sm h-full"
                                title="Upload Custom Icon"
                            >
                                {link.customIconUrl ? <img src={link.customIconUrl} className="w-5 h-5 object-contain" /> : <Upload className="w-4 h-4" />}
                                <span className="hidden sm:inline">{link.customIconUrl ? 'Change' : 'Icon'}</span>
                            </label>
                            {link.customIconUrl && (
                                <button
                                    onClick={() => handleSocialChange(link.id, 'customIconUrl', '')}
                                    className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow border border-gray-200 text-red-500 hover:bg-red-50"
                                    title="Remove Icon"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={() => removeSocialLink(link.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors self-start sm:self-center mt-1 sm:mt-0"
                aria-label="Remove link"
            >
                <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
        </div>
    );
}

interface SortablePhoneNumberProps {
    phone: PhoneNumber;
    handlePhoneChange: (id: string, field: keyof PhoneNumber, value: string) => void;
    removePhoneNumber: (id: string) => void;
    t: (key: string) => string;
}

function SortablePhoneNumber({ phone, handlePhoneChange, removePhoneNumber, t }: SortablePhoneNumberProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: phone.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="group flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
            <div {...attributes} {...listeners} className="touch-none">
                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
            </div>
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <div className="w-full sm:w-1/3">
                    <select
                        value={['Office', 'Mobile', 'Home'].includes(phone.label) ? phone.label : 'Other'}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'Other') {
                                handlePhoneChange(phone.id, 'label', '');
                            } else {
                                handlePhoneChange(phone.id, 'label', val);
                            }
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                    >
                        <option value="Office">{t('Office')}</option>
                        <option value="Mobile">{t('Mobile')}</option>
                        <option value="Home">{t('Home')}</option>
                        <option value="Other">{t('Other')}</option>
                    </select>
                    {!['Office', 'Mobile', 'Home'].includes(phone.label) && (
                        <input
                            type="text"
                            placeholder={t('Custom Label')}
                            value={phone.label}
                            onChange={(e) => handlePhoneChange(phone.id, 'label', e.target.value)}
                            className="w-full mt-2 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            autoFocus
                        />
                    )}
                </div>
                <input
                    type="text"
                    placeholder={t('Number (e.g. +1 555 000 0000)')}
                    value={phone.number}
                    onChange={(e) => handlePhoneChange(phone.id, 'number', e.target.value)}
                    className="w-full sm:w-2/3 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm self-start"
                />
            </div>
            <button
                onClick={() => removePhoneNumber(phone.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}

interface EditorProps {
    data: CardData;
    onChange: (data: CardData) => void;
}

export function Editor({ data, onChange }: EditorProps) {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = data.socialLinks.findIndex((link) => link.id === active.id);
            const newIndex = data.socialLinks.findIndex((link) => link.id === over.id);

            handleChange('socialLinks', arrayMove(data.socialLinks, oldIndex, newIndex));
        }
    };

    const handlePhoneDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = (data.phoneNumbers || []).findIndex((p) => p.id === active.id);
            const newIndex = (data.phoneNumbers || []).findIndex((p) => p.id === over.id);

            handleChange('phoneNumbers', arrayMove(data.phoneNumbers || [], oldIndex, newIndex));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'logoUrl') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange(field, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (field: keyof CardData, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const handleSocialChange = (id: string, field: keyof SocialLink, value: string) => {
        const newLinks = data.socialLinks.map(link =>
            link.id === id ? { ...link, [field]: value } : link
        );
        handleChange('socialLinks', newLinks);
    };

    const addSocialLink = () => {
        const newLink: SocialLink = {
            id: Date.now().toString(),
            platform: 'website',
            url: '',
            label: ''
        };
        handleChange('socialLinks', [...data.socialLinks, newLink]);
    };

    const removeSocialLink = (id: string) => {
        handleChange('socialLinks', data.socialLinks.filter(link => link.id !== id));
    };

    const addPhoneNumber = () => {
        const newPhone: PhoneNumber = {
            id: Date.now().toString(),
            label: 'Mobile',
            number: ''
        };
        handleChange('phoneNumbers', [...(data.phoneNumbers || []), newPhone]);
    };

    const removePhoneNumber = (id: string) => {
        handleChange('phoneNumbers', (data.phoneNumbers || []).filter(p => p.id !== id));
    };

    const handlePhoneChange = (id: string, field: keyof PhoneNumber, value: string) => {
        const newPhones = (data.phoneNumbers || []).map(p =>
            p.id === id ? { ...p, [field]: value } : p
        );
        handleChange('phoneNumbers', newPhones);
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 space-y-8 h-full overflow-y-auto">
            <div>
                <img src="/logo.png" alt="Really Simple Apps" className="w-1/2 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('Edit Profile')}</h2>
                <p className="text-gray-500 text-sm">{t('Update Info')}</p>
            </div>

            {/* Personal Info */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{t('Personal Info')}</h3>

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('Full Name')}</label>
                        <input
                            type="text"
                            value={data.fullName}
                            onChange={(e) => handleChange('fullName', e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('Job Title')}</label>
                        <input
                            type="text"
                            value={data.jobTitle}
                            onChange={(e) => handleChange('jobTitle', e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('Company')}</label>
                        <input
                            type="text"
                            value={data.company}
                            onChange={(e) => handleChange('company', e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">{t('Bio')}</label>
                            <span className={`text-xs ${data.bio?.length > 150 ? 'text-red-500' : 'text-gray-400'}`}>
                                {data.bio?.length || 0} / 150
                            </span>
                        </div>
                        <textarea
                            value={data.bio}
                            onChange={(e) => {
                                if (e.target.value.length <= 150) {
                                    handleChange('bio', e.target.value);
                                }
                            }}
                            rows={3}
                            maxLength={150}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Phone Numbers */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{t('Phone Numbers')}</h3>
                    <button
                        onClick={addPhoneNumber}
                        className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium py-2 px-3 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" /> {t('Add Phone')}
                    </button>
                </div>

                <div className="space-y-3">
                    <DndContext
                        id="phone-dnd"
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handlePhoneDragEnd}
                    >
                        <SortableContext
                            items={data.phoneNumbers || []}
                            strategy={verticalListSortingStrategy}
                        >
                            {(data.phoneNumbers || []).map((phone) => (
                                <SortablePhoneNumber
                                    key={phone.id}
                                    phone={phone}
                                    handlePhoneChange={handlePhoneChange}
                                    removePhoneNumber={removePhoneNumber}
                                    t={t}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{t('Social Links')}</h3>
                    <button
                        onClick={addSocialLink}
                        className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium py-2 px-3 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" /> {t('Add Link')}
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="space-y-3">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={data.socialLinks}
                                strategy={verticalListSortingStrategy}
                            >
                                {data.socialLinks.map((link) => (
                                    <SortableSocialLink
                                        key={link.id}
                                        link={link}
                                        handleSocialChange={handleSocialChange}
                                        removeSocialLink={removeSocialLink}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>
            </div>

            {/* Branding */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{t('Branding')}</h3>

                {/* Logo Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('Logo')}</label>
                    <div className="flex items-center gap-4">
                        {data.logoUrl ? (
                            <div className="relative w-16 h-16 rounded-lg border border-gray-200 p-2 flex items-center justify-center bg-gray-50">
                                <img src={data.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                                <button
                                    onClick={() => handleChange('logoUrl', undefined)}
                                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-gray-200 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => logoInputRef.current?.click()}
                                className="h-16 w-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors text-xs gap-1"
                            >
                                <Upload className="w-5 h-5" />
                                <span>{t('Upload')}</span>
                            </button>
                        )}
                        <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, 'logoUrl')}
                        />
                        <div className="text-xs text-gray-500 flex-1">
                            {t('Upload your company logo. This will hide the company name text.')}
                        </div>
                    </div>
                </div>

                {/* Photo Settings */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">{t('Profile Photo')}</label>
                        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                            <button
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${data.showPhoto ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => handleChange('showPhoto', true)}
                            >
                                {t('Show')}
                            </button>
                            <button
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${!data.showPhoto ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => handleChange('showPhoto', false)}
                            >
                                {t('Hide')}
                            </button>
                        </div>
                    </div>

                    {data.showPhoto && (
                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200 bg-gray-50">
                                <img src={data.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">{t('Image URL or Upload')}</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={data.avatarUrl}
                                        onChange={(e) => handleChange('avatarUrl', e.target.value)}
                                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        placeholder="https://..."
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                                    >
                                        <Upload className="w-4 h-4" />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e, 'avatarUrl')}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Background Settings */}
                <div className="pt-2 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Background Style')}</label>
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => handleChange('backgroundType', 'solid')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${data.backgroundType === 'solid' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            {t('Solid Color')}
                        </button>
                        <button
                            onClick={() => handleChange('backgroundType', 'gradient')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${data.backgroundType === 'gradient' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            {t('Gradient')}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                {data.backgroundType === 'gradient' ? t('Start Color') : t('Color')}
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={data.themeColor}
                                    onChange={(e) => handleChange('themeColor', e.target.value)}
                                    className="h-10 w-10 rounded-lg cursor-pointer border-0 p-0"
                                />
                                <span className="text-gray-500 text-xs uppercase">{data.themeColor}</span>
                            </div>
                        </div>

                        {data.backgroundType === 'gradient' && (
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">{t('End Color')}</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={data.gradientColor || '#000000'}
                                        onChange={(e) => handleChange('gradientColor', e.target.value)}
                                        className="h-10 w-10 rounded-lg cursor-pointer border-0 p-0"
                                    />
                                    <span className="text-gray-500 text-xs uppercase">{data.gradientColor || '#000000'}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Font Selection */}
                <div className="pt-2 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Typography')}</label>
                    <select
                        value={data.font || 'Inter'}
                        onChange={(e) => handleChange('font', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        style={{ fontFamily: data.font || 'Inter' }}
                    >
                        <option value="Bebas Neue" style={{ fontFamily: 'Bebas Neue' }}>Bebas Neue</option>
                        <option value="Dancing Script" style={{ fontFamily: 'Dancing Script' }}>Dancing Script</option>
                        <option value="Inter" style={{ fontFamily: 'Inter' }}>Inter</option>
                        <option value="Lato" style={{ fontFamily: 'Lato' }}>Lato</option>
                        <option value="Lobster" style={{ fontFamily: 'Lobster' }}>Lobster</option>
                        <option value="Lora" style={{ fontFamily: 'Lora' }}>Lora</option>
                        <option value="Merriweather" style={{ fontFamily: 'Merriweather' }}>Merriweather</option>
                        <option value="Montserrat" style={{ fontFamily: 'Montserrat' }}>Montserrat</option>
                        <option value="Nunito" style={{ fontFamily: 'Nunito' }}>Nunito</option>
                        <option value="Open Sans" style={{ fontFamily: 'Open Sans' }}>Open Sans</option>
                        <option value="Oswald" style={{ fontFamily: 'Oswald' }}>Oswald</option>
                        <option value="Pacifico" style={{ fontFamily: 'Pacifico' }}>Pacifico</option>
                        <option value="Playfair Display" style={{ fontFamily: 'Playfair Display' }}>Playfair Display</option>
                        <option value="Poppins" style={{ fontFamily: 'Poppins' }}>Poppins</option>
                        <option value="PT Serif" style={{ fontFamily: 'PT Serif' }}>PT Serif</option>
                        <option value="Raleway" style={{ fontFamily: 'Raleway' }}>Raleway</option>
                        <option value="Roboto" style={{ fontFamily: 'Roboto' }}>Roboto</option>
                        <option value="Roboto Mono" style={{ fontFamily: 'Roboto Mono' }}>Roboto Mono</option>
                        <option value="Rubik" style={{ fontFamily: 'Rubik' }}>Rubik</option>
                        <option value="Source Sans 3" style={{ fontFamily: 'Source Sans 3' }}>Source Sans 3</option>
                        <option value="Ubuntu" style={{ fontFamily: 'Ubuntu' }}>Ubuntu</option>
                    </select>
                </div>
            </div>

        </div>
    );
}
