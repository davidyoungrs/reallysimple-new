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
            "Update Info": "Update your card information in real-time."
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
            "Update Info": "Actualiza tu información en tiempo real."
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
            "Update Info": "Mettez à jour vos informations en temps réel."
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
            "Update Info": "Aktualisieren Sie Ihre Karteninformationen in Echtzeit."
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en", // default language
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
