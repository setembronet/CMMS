'use client';
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import pt from '@/locales/pt.json';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

type Locale = 'pt' | 'en' | 'es';

type Translations = { [key: string]: any };

const translations: { [key in Locale]: Translations } = { pt, en, es };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('pt');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0] as Locale;
    const initialLocale = ['pt', 'en', 'es'].includes(browserLang) ? browserLang : 'pt';
    handleSetLocale(initialLocale);
    setIsMounted(true);
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    if (translations[newLocale]) {
      setLocale(newLocale);
      document.documentElement.lang = newLocale;
    }
  };

  const t = useCallback((key: string): string => {
    const messages = translations[locale] || translations.pt;
    const keys = key.split('.');
    let result: any = messages;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key;
      }
    }
    return typeof result === 'string' ? result : key;
  }, [locale]);
  
  if (!isMounted) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};
