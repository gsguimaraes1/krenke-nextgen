import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  pt: {
    translation: {
      "nav": {
        "home": "Home",
        "about": "Empresa",
        "products": "Produtos",
        "blog": "Blog",
        "catalog": "Catálogo",
        "quote": "Orçamento",
        "reseller": "Área do Revendedor",
        "lang_selection": "Seleção de Idioma"
      },
      "footer": {
        "rights": "Todos os direitos reservados.",
        "contact": "Contato Direto",
        "address": "Endereço",
        "privacy": "Privacidade",
        "terms": "Termos",
        "bio": "Desde 1987 transformando espaços em mundos de pura diversão com segurança absoluta e design de elite."
      },
      "common": {
        "explore": "Explorar Detalhes",
        "loading": "Carregando...",
        "search": "Pesquisar...",
        "see_more": "Ver Mais"
      },
      "products": {
        "filter": "Filtrar por Categoria",
        "items": "Itens",
        "no_results": "Nenhum produto encontrado para esta seleção."
      }
    }
  },
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "about": "About",
        "products": "Products",
        "blog": "Blog",
        "catalog": "Catalog",
        "quote": "Quote",
        "reseller": "Reseller Area",
        "lang_selection": "Language Selection"
      },
      "footer": {
        "rights": "All rights reserved.",
        "contact": "Direct Contact",
        "address": "Address",
        "privacy": "Privacy",
        "terms": "Terms",
        "bio": "Since 1987 transforming spaces into worlds of pure fun with absolute safety and elite design."
      },
      "common": {
        "explore": "Explore Details",
        "loading": "Loading...",
        "search": "Search...",
        "see_more": "See More"
      },
      "products": {
        "filter": "Filter by Category",
        "items": "Items",
        "no_results": "No products found for this selection."
      }
    }
  },
  es: {
    translation: {
      "nav": {
        "home": "Inicio",
        "about": "Empresa",
        "products": "Productos",
        "blog": "Blog",
        "catalog": "Catálogo",
        "quote": "Presupuesto",
        "reseller": "Área del Revendedor",
        "lang_selection": "Selección de Idioma"
      },
      "footer": {
        "rights": "Todos los derechos reservados.",
        "contact": "Contacto Directo",
        "address": "Dirección",
        "privacy": "Privacidad",
        "terms": "Términos",
        "bio": "Desde 1987 transformando espacios en mundos de pura diversión con seguridad absoluta y diseño de elite."
      },
      "common": {
        "explore": "Explorar Detalles",
        "loading": "Cargando...",
        "search": "Buscar...",
        "see_more": "Ver Más"
      }
    }
  },
  fr: {
    translation: {
      "nav": {
        "home": "Accueil",
        "about": "Entreprise",
        "products": "Produits",
        "blog": "Blog",
        "catalog": "Catalogue",
        "quote": "Devis",
        "reseller": "Espace Revendeur",
        "lang_selection": "Sélection de la langue"
      },
      "footer": {
        "rights": "Tous droits réservés.",
        "contact": "Contact Direct",
        "address": "Adresse",
        "privacy": "Confidentialité",
        "terms": "Conditions",
        "bio": "Depuis 1987, nous transformons les espaces en mondes de pur plaisir avec une sécurité absolue et un design d'élite."
      },
      "common": {
        "explore": "Explorer les Détails",
        "loading": "Chargement...",
        "search": "Rechercher...",
        "see_more": "Voir Plus"
      }
    }
  },
  de: {
    translation: {
      "nav": {
        "home": "Startseite",
        "about": "Unternehmen",
        "products": "Produkte",
        "blog": "Blog",
        "catalog": "Katalog",
        "quote": "Angebot",
        "reseller": "Händlerbereich",
        "lang_selection": "Sprachauswahl"
      },
      "footer": {
        "rights": "Alle Rechte vorbehalten.",
        "contact": "Direktkontakt",
        "address": "Adresse",
        "privacy": "Datenschutz",
        "terms": "Bedingungen",
        "bio": "Seit 1987 verwandeln wir Räume in Welten des puren Vergnügens mit absoluter Sicherheit und erstklassigem Design."
      },
      "common": {
        "explore": "Details Erkunden",
        "loading": "Laden...",
        "search": "Suchen...",
        "see_more": "Mehr Sehen"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'cookie', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
    }
  });

/**
 * Free Machine Translation Helper
 * Uses an unofficial Google Translate endpoint for dynamic content
 */
export const translateText = async (text: string, targetLang: string) => {
  if (!text || targetLang === 'pt') return text;
  
  try {
    const url = `/translate_api/translate_a/single?client=gtx&sl=pt&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data[0].map((item: any) => item[0]).join('');
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};

export default i18n;
