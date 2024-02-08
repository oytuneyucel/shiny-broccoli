import { ui, defaultLang, showDefaultLang, routes } from './ui';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

export function useTranslatedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, l: string = lang) {
    const pathName = path.replaceAll('/', '');
    const hasTranslation = defaultLang !== l && routes[l] !== undefined && routes[l][pathName] !== undefined;
    const translatedPath = hasTranslation ? '/' + routes[l][pathName] : path;

    return !showDefaultLang && l === defaultLang ? translatedPath : `/${l}${translatedPath}`;
  };
}

export function getRouteFromUrl(url: URL): string | undefined {
  const pathname = new URL(url).pathname;
  const parts = pathname?.split('/');
  const path = parts.pop() || parts.pop();

  if (path === undefined) {
    return undefined;
  }

  const currentLang = getLangFromUrl(url);

  if (defaultLang === currentLang) {
    const route = Object.values(routes)[0];
    return route[path] !== undefined ? route[path] : undefined;
  }

  const getKeyByValue = (obj: Record<string, string>, value: string): string | undefined => {
    return Object.keys(obj).find((key) => obj[key] === value);
  };

  const reversedKey = getKeyByValue(routes[currentLang], path);

  if (reversedKey !== undefined) {
    return reversedKey;
  }

  return undefined;
}

export const handleTrailingSlash = (path: string, trailingSlash: 'always' | 'never' | 'ignore' = 'always') => {
  if (path === '/') {
    return path;
  }

  switch (trailingSlash) {
    case 'always':
      return path.endsWith('/') ? path : path + '/';
    case 'never':
      return path.replace(/\/$/, '');
    default:
      return path;
  }
};

export const localizePath = (
  path: string = '/',
  locale: string | null = null,
  base: string = import.meta.env.BASE_URL
): string => {
  if (!locale) {
    locale = 'tr';
  }

  let pathSegments = path.split('/').filter((segment) => segment !== '');
  const baseSegments = base.split('/').filter((segment) => segment !== '');

  if (JSON.stringify(pathSegments).startsWith(JSON.stringify(baseSegments).replace(/]+$/, ''))) {
    // remove base from path
    pathSegments.splice(0, baseSegments.length);
  }

  path = pathSegments.length === 0 ? '' : pathSegments.join('/');
  base = baseSegments.length === 0 ? '/' : '/' + baseSegments.join('/') + '/';

  const { flatRoutes, showDefaultLocale, defaultLocale, locales, trailingSlash } = {
    defaultLocale: 'cimode',
    locales: [],
    flatRoutes: {},
    showDefaultLocale: false,
    trailingSlash: 'ignore',
  };

  if (!locales.includes(locale)) {
    console.warn(
      `WARNING(astro-i18next): "${locale}" locale is not supported, add it to the locales in your astro config.`
    );
    return handleTrailingSlash(`${base}${path}`, trailingSlash);
  }

  if (pathSegments.length === 0) {
    if (showDefaultLocale) {
      return handleTrailingSlash(`${base}${locale}`, trailingSlash);
    }

    return handleTrailingSlash(locale === defaultLocale ? base : `${base}${locale}`, trailingSlash);
  }

  // check if the path is not already present in flatRoutes
  if (locale === defaultLocale) {
    const translatedPathKey = Object.keys(flatRoutes).find((key) => flatRoutes[key] === '/' + path);
    if (typeof translatedPathKey !== 'undefined') {
      pathSegments = translatedPathKey.split('/').filter((segment) => segment !== '');
    }
  }

  // remove locale from pathSegments (if there is any)
  for (const locale of locales) {
    if (pathSegments[0] === locale) {
      pathSegments.shift();
      break;
    }
  }

  // prepend the given locale if it's not the base one (unless showDefaultLocale)
  if (showDefaultLocale || locale !== defaultLocale) {
    pathSegments = [locale, ...pathSegments];
  }

  const localizedPath = base + pathSegments.join('/');

  // is path translated?
  if (Object.prototype.hasOwnProperty.call(flatRoutes, localizedPath.replace(/\/$/, ''))) {
    return handleTrailingSlash(flatRoutes[localizedPath.replace(/\/$/, '')], trailingSlash);
  }

  return handleTrailingSlash(localizedPath, trailingSlash);
};
