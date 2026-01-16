// i18n 类型定义
// 支持 4 种语言：English, 简体中文, 繁体中文（台湾）, 繁体中文（香港）

/**
 * 支持的语言代码
 */
export type Language = "en" | "zh-CN" | "zh-TW" | "zh-HK";

/**
 * 语言配置接口
 */
export interface LocaleConfig {
  code: Language;
  name: string; // 语言名称（简体中文显示）
  nativeName: string; // 语言本地名称
  flag: string; // 国旗 Emoji
  locale: string; // BCP 47 语言标签
}

/**
 * 翻译值类型（支持嵌套）
 */
export type TranslationValue = string | TranslationNode;

/**
 * 翻译节点（支持嵌套对象）
 */
export interface TranslationNode {
  [key: string]: TranslationValue;
}

/**
 * 完整翻译字典类型
 */
export interface Translations {
  [key: string]: TranslationValue;
}

/**
 * 所有语言的翻译字典
 */
export interface AllTranslations {
  en: Translations;
  "zh-CN": Translations;
  "zh-TW": Translations;
  "zh-HK": Translations;
}

/**
 * 语言配置常量
 */
export const LOCALE_CONFIGS: Record<Language, LocaleConfig> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    locale: "en-US",
  },
  "zh-CN": {
    code: "zh-CN",
    name: "中文（简体）",
    nativeName: "简体中文",
    flag: "🇨🇳",
    locale: "zh-CN",
  },
  "zh-TW": {
    code: "zh-TW",
    name: "中文（繁体）-中国台湾",
    nativeName: "繁體中文（台灣）",
    flag: "🇹🇼",
    locale: "zh-TW",
  },
  "zh-HK": {
    code: "zh-HK",
    name: "中文（繁体）-中国香港",
    nativeName: "繁體中文（香港）",
    flag: "🇭🇰",
    locale: "zh-HK",
  },
};

/**
 * 支持的语言列表（用于 UI 选择器）
 */
export const SUPPORTED_LANGUAGES: Language[] = ["en", "zh-CN", "zh-TW", "zh-HK"];

/**
 * 默认语言
 */
export const DEFAULT_LANGUAGE: Language = "en";

/**
 * 检查是否为有效的语言代码
 */
export function isValidLanguage(code: string): code is Language {
  return SUPPORTED_LANGUAGES.includes(code as Language);
}

/**
 * 获取语言配置
 */
export function getLocaleConfig(code: Language): LocaleConfig {
  return LOCALE_CONFIGS[code];
}

/**
 * 获取所有语言配置列表
 */
export function getAllLocaleConfigs(): LocaleConfig[] {
  return SUPPORTED_LANGUAGES.map((code) => LOCALE_CONFIGS[code]);
}
