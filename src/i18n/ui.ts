export const languages = {
  en: 'English',
  tr: 'Türkçe',
};

export const defaultLang = 'tr';

export const ui = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.twitter': 'Twitter',
  },
  tr: {
    'nav.home': 'Anasayfa',
    'nav.about': 'Hakkımızda',
  },
} as const;

export const routes = {
  en: {
    services: 'leistungen',
  },
  tr: {
    services: 'prestations-de-service',
  },
};

export const showDefaultLang = false;
export const showLangSwitcher = true;
export const showNav = true;
