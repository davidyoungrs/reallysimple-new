import { useState, useEffect } from 'react';
import { initialCardData, type CardData } from './types';
import { BusinessCard } from './components/BusinessCard';
import { Editor } from './components/Editor';
import { loadFromUrl, saveToUrl } from './utils/urlState';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronUp, ChevronDown } from 'lucide-react';

function App() {
  const { t, i18n } = useTranslation();
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

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row relative overflow-hidden">

      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-lg shadow-md border border-gray-200">
        <Globe className="w-4 h-4 text-gray-500" />
        <select
          onChange={(e) => changeLanguage(e.target.value)}
          value={i18n.language}
          className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer text-gray-700 font-medium"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
        </select>
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

        <div className="w-full max-w-md my-auto z-10 py-8 scale-90 md:scale-100 transition-transform origin-top md:origin-center">
          <BusinessCard data={data} />
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm hidden md:block shrink-0 pb-8">
          {t('Preview')}
        </div>
      </div>
    </div>
  );
}

export default App;
