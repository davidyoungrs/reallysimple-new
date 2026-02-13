import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
    en: {
        translation: {
            "Editor": "Editor",
            "Preview": "Preview",
            "Edit Profile": "Edit Profile",
            "Personal Info": "Personal Info",
            "Social Links": "Social Links",
            "Branding": "Branding",
            "Full Name": "Full Name",
            "Job Title": "Job Title",
            "Company": "Company",
            "Bio": "Bio",
            "Add Link": "Add Link",
            "Theme Color": "Theme Color",
            "Save Contact": "Save Contact",
            "Wallet Pass": "Wallet Pass",
            "Creating...": "Creating...",
            "Update Info": "Update your card information in real-time.",
            "Log in": "Log in",
            "Create Card": "Create Card",
            "Dashboard": "Dashboard",
            "Start for Free": "Start for Free",
            "View Demo": "View Demo",
            "Everything you need": "Everything you need to grow your network",
            "Instant Sharing": "Instant Sharing",
            "Instant Sharing Desc": "Share via QR code, link, or NFC. Works on any device without installing apps.",
            "Bank-Level Security": "Bank-Level Security",
            "Security Desc": "Your data is encrypted and secure. You control what you share and with whom.",
            "Smart Integration": "Smart Integration",
            "Integration Desc": "Connect with your CRM, Email marketing tools, and more in one click.",
            "Hero Title": "The Digital Business Card",
            "Hero Subtitle": "Built for Professionals.",
            "Hero Desc": "Create, customize, and share your professional identity in seconds. No app required for your contacts. Instantly share via QR, Apple Wallet, or Link.",
            "Home": "Home"
        }
    },
    es: {
        translation: {
            "Editor": "Editor",
            "Preview": "Vista Previa",
            "Edit Profile": "Editar Perfil",
            "Personal Info": "Información Personal",
            "Social Links": "Redes Sociales",
            "Branding": "Marca",
            "Full Name": "Nombre Completo",
            "Job Title": "Cargo",
            "Company": "Empresa",
            "Bio": "Biografía",
            "Add Link": "Añadir Enlace",
            "Theme Color": "Color del Tema",
            "Save Contact": "Guardar Contacto",
            "Wallet Pass": "Pase de Wallet",
            "Creating...": "Creando...",
            "Update Info": "Actualiza tu información en tiempo real.",
            "Log in": "Iniciar sesión",
            "Create Card": "Crear Tarjeta",
            "Dashboard": "Panel",
            "Start for Free": "Empezar Gratis",
            "View Demo": "Ver Demo",
            "Everything you need": "Todo lo que necesitas para crecer tu red",
            "Instant Sharing": "Compartir Instantáneo",
            "Instant Sharing Desc": "Comparte vía código QR, enlace o NFC. Funciona en cualquier dispositivo sin instalar apps.",
            "Bank-Level Security": "Seguridad Bancaria",
            "Security Desc": "Tus datos están encriptados y seguros. Tú controlas qué compartes y con quién.",
            "Smart Integration": "Integración Inteligente",
            "Integration Desc": "Conecta con tu CRM, herramientas de email marketing y más en un clic.",
            "Hero Title": "La Tarjeta de Visita Digital",
            "Hero Subtitle": "Creada para Profesionales.",
            "Hero Desc": "Crea, personaliza y comparte tu identidad profesional en segundos. No requiere app para tus contactos. Comparte instantáneamente vía QR, Apple Wallet o Enlace.",
            "Home": "Inicio"
        }
    },
    fr: {
        translation: {
            "Editor": "Éditeur",
            "Preview": "Aperçu",
            "Edit Profile": "Modifier Profil",
            "Personal Info": "Infos Personnelles",
            "Social Links": "Réseaux Sociaux",
            "Branding": "Marque",
            "Full Name": "Nom Complet",
            "Job Title": "Poste",
            "Company": "Entreprise",
            "Bio": "Biographie",
            "Add Link": "Ajouter un lien",
            "Theme Color": "Couleur du Thème",
            "Save Contact": "Enregistrer Contact",
            "Wallet Pass": "Pass Wallet",
            "Creating...": "Création...",
            "Update Info": "Mettez à jour vos informations en temps réel.",
            "Log in": "Connexion",
            "Create Card": "Créer une Carte",
            "Dashboard": "Tableau de bord",
            "Start for Free": "Commencer Gratuitement",
            "View Demo": "Voir la Démo",
            "Everything you need": "Tout ce dont vous avez besoin pour développer votre réseau",
            "Instant Sharing": "Partage Instantané",
            "Instant Sharing Desc": "Partagez via QR code, lien ou NFC. Fonctionne sur tout appareil sans installer d'applications.",
            "Bank-Level Security": "Sécurité Bancaire",
            "Security Desc": "Vos données sont cryptées et sécurisées. Vous contrôlez ce que vous partagez et avec qui.",
            "Smart Integration": "Intégration Intelligente",
            "Integration Desc": "Connectez-vous à votre CRM, outils marketing email et plus en un clic.",
            "Hero Title": "La Carte de Visite Numérique",
            "Hero Subtitle": "Conçue pour les Professionnels.",
            "Hero Desc": "Créez, personnalisez et partagez votre identité professionnelle en secondes. Aucune app requise pour vos contacts. Partagez instantanément via QR, Apple Wallet ou Lien.",
            "Home": "Accueil"
        }
    },
    de: {
        translation: {
            "Editor": "Editor",
            "Preview": "Vorschau",
            "Edit Profile": "Profil Bearbeiten",
            "Personal Info": "Persönliche Infos",
            "Social Links": "Soziale Links",
            "Branding": "Branding",
            "Full Name": "Vollständiger Name",
            "Job Title": "Berufsbezeichnung",
            "Company": "Firma",
            "Bio": "Biografie",
            "Add Link": "Link hinzufügen",
            "Theme Color": "Themenfarbe",
            "Save Contact": "Kontakt speichern",
            "Wallet Pass": "Wallet Pass",
            "Creating...": "Erstellen...",
            "Update Info": "Aktualisieren Sie Ihre Karteninformationen in Echtzeit.",
            "Log in": "Anmelden",
            "Create Card": "Karte Erstellen",
            "Dashboard": "Dashboard",
            "Start for Free": "Kostenlos Starten",
            "View Demo": "Demo Ansehen",
            "Everything you need": "Alles, was Sie brauchen, um Ihr Netzwerk zu erweitern",
            "Instant Sharing": "Sofortiges Teilen",
            "Instant Sharing Desc": "Teilen Sie per QR-Code, Link oder NFC. Funktioniert auf jedem Gerät ohne Installation von Apps.",
            "Bank-Level Security": "Sicherheit auf Bankniveau",
            "Security Desc": "Ihre Daten sind verschlüsselt und sicher. Sie kontrollieren, was Sie teilen und mit wem.",
            "Smart Integration": "Intelligente Integration",
            "Integration Desc": "Verbinden Sie sich mit Ihrem CRM, E-Mail-Marketing-Tools und mehr mit einem Klick.",
            "Hero Title": "Die Digitale Visitenkarte",
            "Hero Subtitle": "Gebaut für Profis.",
            "Hero Desc": "Erstellen, anpassen und teilen Sie Ihre professionelle Identität in Sekunden. Keine App für Ihre Kontakte erforderlich. Sofort teilen per QR, Apple Wallet oder Link.",
            "Home": "Home"
        }
    },
    ar: {
        translation: {
            "Editor": "المحرر",
            "Preview": "معاينة",
            "Edit Profile": "تعديل الملف الشخصي",
            "Personal Info": "المعلومات الشخصية",
            "Social Links": "روابط التواصل الاجتماعي",
            "Branding": "العلامة التجارية",
            "Full Name": "الاسم الكامل",
            "Job Title": "المسمى الوظيفي",
            "Company": "الشركة",
            "Bio": "نبذة",
            "Add Link": "إضافة رابط",
            "Theme Color": "لون السمة",
            "Save Contact": "حفظ جهة الاتصال",
            "Wallet Pass": "بطاقة المحفظة",
            "Creating...": "جاري الإنشاء...",
            "Update Info": "قم بتحديث معلومات بطاقتك في الوقت الفعلي.",
            "Log in": "تسجيل الدخول",
            "Create Card": "إنشاء بطاقة",
            "Dashboard": "لوحة التحكم",
            "Start for Free": "ابدأ مجانًا",
            "View Demo": "مشاهدة العرض التجريبي",
            "Everything you need": "كل ما تحتاجه لتنمية شبكتك",
            "Instant Sharing": "مشاركة فورية",
            "Instant Sharing Desc": "شارك عبر رمز الاستجابة السريعة أو الرابط أو NFC. يعمل على أي جهاز دون تثبيت تطبيقات.",
            "Bank-Level Security": "أمان بمستوى البنوك",
            "Security Desc": "بياناتك مشفرة وآمنة. أنت تتحكم في ما تشاركه ومع من.",
            "Smart Integration": "تكامل ذكي",
            "Integration Desc": "تواصل مع إدارة علاقات العملاء (CRM)، وأدوات التسويق عبر البريد الإلكتروني، والمزيد بنقرة واحدة.",
            "Hero Title": "بطاقة العمل الرقمية",
            "Hero Subtitle": "صُممت للمحترفين.",
            "Hero Desc": "أنشئ وخصص وشارك هويتك المهنية في ثوانٍ. لا يلزم وجود تطبيق لجهات الاتصال الخاصة بك. شارك فورًا عبر QR أو Apple Wallet أو الرابط.",
            "Home": "الصفحة الرئيسية"
        }
    },
    ru: {
        translation: {
            "Editor": "Редактор",
            "Preview": "Предпросмотр",
            "Edit Profile": "Редактировать профиль",
            "Personal Info": "Личная информация",
            "Social Links": "Социальные сети",
            "Branding": "Брендинг",
            "Full Name": "Полное имя",
            "Job Title": "Должность",
            "Company": "Компания",
            "Bio": "Био",
            "Add Link": "Добавить ссылку",
            "Theme Color": "Цвет темы",
            "Save Contact": "Сохранить контакт",
            "Wallet Pass": "Wallet Pass",
            "Creating...": "Создание...",
            "Update Info": "Обновляйте информацию о карте в реальном времени.",
            "Log in": "Войти",
            "Create Card": "Создать карту",
            "Dashboard": "Панель управления",
            "Start for Free": "Начать бесплатно",
            "View Demo": "Посмотреть демо",
            "Everything you need": "Все, что нужно для расширения вашей сети",
            "Instant Sharing": "Мгновенный обмен",
            "Instant Sharing Desc": "Делитесь через QR-код, ссылку или NFC. Работает на любом устройстве без установки приложений.",
            "Bank-Level Security": "Безопасность банковского уровня",
            "Security Desc": "Ваши данные зашифрованы и защищены. Вы контролируете, чем делитесь и с кем.",
            "Smart Integration": "Умная интеграция",
            "Integration Desc": "Подключайтесь к CRM, инструментам email-маркетинга и другим сервисам в один клик.",
            "Hero Title": "Цифровая визитка",
            "Hero Subtitle": "Создана для профессионалов.",
            "Hero Desc": "Создайте, настройте и поделитесь своей профессиональной идентичностью за секунды. Контактам не нужно приложение. Мгновенно делитесь через QR, Apple Wallet или ссылку.",
            "Home": "Домой"
        }

    }
};

import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false // react already safes from xss
        },
        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
            // keys or params to lookup language from
            lookupQuerystring: 'lng',
            lookupCookie: 'i18next',
            lookupLocalStorage: 'i18nextLng',
            lookupFromPathIndex: 0,
            lookupFromSubdomainIndex: 0,

            // cache user language on
            caches: ['localStorage', 'cookie']
        }
    });

export default i18n;
