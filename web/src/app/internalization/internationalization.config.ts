import { I18NEXT_SERVICE, ITranslationService } from 'angular-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import translations from './translations';

const appInit = (i18next: ITranslationService) => () =>
  i18next
    .use(LanguageDetector)
    .init({
      fallbackLng: 'en',
      resources: translations,

      detection: {
        order: ['cookie'],
        lookupCookie: 'lang',
        caches: ['cookie'],
        cookieMinutes: 10080,
      },
    });

const localeIdFactory = (i18next: ITranslationService) => i18next.language;

export const I18N_PROVIDERS = [
  {
    provide: APP_INITIALIZER,
    useFactory: appInit,
    deps: [I18NEXT_SERVICE],
    multi: true,
  },
  {
    provide: LOCALE_ID,
    deps: [I18NEXT_SERVICE],
    useFactory: localeIdFactory,
  },
];
