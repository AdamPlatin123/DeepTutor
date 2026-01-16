import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { GlobalProvider } from "@/context/GlobalContext";
import ThemeScript from "@/components/ThemeScript";
import { setTranslationOverrides, translations } from "@/lib/i18n";
import {
  DEFAULT_LANGUAGE,
  isValidLanguage,
  type Language,
} from "@/lib/i18n/types";

// Use Inter font with swap display for better loading
const font = Inter({
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "DeepTutor Platform",
  description: "Multi-Agent Teaching & Research Copilot",
};

const BASE_TRANSLATION_KEYS = new Set(Object.keys(translations.en));
const SPECIAL_KEY_MAP: Record<string, string> = {
  rag: "RAG",
  llm: "LLM",
  tts: "TTS",
  kb: "KB",
  ideagen: "IdeaGen",
  co_writer: "Co-Writer",
};

const normalizeKeySegment = (segment: string): string => {
  const special = SPECIAL_KEY_MAP[segment];
  if (special) return special;
  const parts = segment.split(/[_-]+/).filter(Boolean);
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const resolveLocalePath = (filename: string): string => {
  const candidates = [
    path.join(process.cwd(), "lib/i18n/locales", filename),
    path.join(process.cwd(), "web/lib/i18n/locales", filename),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return candidates[0];
};

const loadYamlRootMap = (filename: string): Record<string, string> => {
  try {
    const filePath = resolveLocalePath(filename);
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = YAML.parse(raw) as Record<string, unknown>;
    const result: Record<string, string> = {};
    const addEntry = (key: string, value: string) => {
      if (!(key in result)) {
        result[key] = value;
      }
    };
    const visit = (node: unknown, pathSegments: string[]) => {
      if (typeof node === "string") {
        const rawKey = pathSegments[pathSegments.length - 1] || "";
        const isTopLevel = pathSegments.length === 1;
        let key: string | null = null;
        if (isTopLevel) {
          key = rawKey;
        } else if (BASE_TRANSLATION_KEYS.has(rawKey)) {
          key = rawKey;
        } else {
          const normalized = normalizeKeySegment(rawKey);
          if (BASE_TRANSLATION_KEYS.has(normalized)) {
            key = normalized;
          }
        }
        if (key) {
          addEntry(key, node);
        }
        return;
      }
      if (!node || typeof node !== "object") return;
      for (const [childKey, childValue] of Object.entries(
        node as Record<string, unknown>,
      )) {
        visit(childValue, [...pathSegments, childKey]);
      }
    };
    for (const [key, value] of Object.entries(parsed)) {
      visit(value, [key]);
    }
    return result;
  } catch {
    return {};
  }
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const i18nOverrides = {
    "zh-TW": loadYamlRootMap("zh-TW.yaml"),
    "zh-HK": loadYamlRootMap("zh-HK.yaml"),
  };
  setTranslationOverrides(i18nOverrides);

  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get("deeptutor-language")?.value;
  const normalizedCookieLanguage =
    cookieLanguage === "zh" ? "zh-CN" : cookieLanguage;
  const initialLanguage: Language = isValidLanguage(
    normalizedCookieLanguage || "",
  )
    ? (normalizedCookieLanguage as Language)
    : DEFAULT_LANGUAGE;

  return (
    <html
      lang={initialLanguage}
      data-lang={initialLanguage}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className={font.className}>
        <GlobalProvider
          initialLanguage={initialLanguage}
          i18nOverrides={i18nOverrides}
        >
          <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-200">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
              {children}
            </main>
          </div>
        </GlobalProvider>
      </body>
    </html>
  );
}
