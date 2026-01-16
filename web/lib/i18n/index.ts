// Central i18n entrypoint re-exporting the legacy translation map.
// Keeps module resolution consistent across /lib/i18n and /lib/i18n.ts.

export {
  getTranslation,
  useTranslation,
  translations,
  setTranslationOverrides,
} from "../i18n";
export type { Language } from "../i18n";
export type { Translations, TranslationValue, TranslationNode } from "./types";
export {
  LOCALE_CONFIGS,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  isValidLanguage,
  getLocaleConfig,
  getAllLocaleConfigs,
} from "./types";
