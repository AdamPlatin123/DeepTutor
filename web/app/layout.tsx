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
import { setTranslationOverrides } from "@/lib/i18n";
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

const loadYamlFlatMap = (filename: string): Record<string, string> => {
  try {
    const filePath = resolveLocalePath(filename);
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = YAML.parse(raw) as Record<string, unknown>;
    const result: Record<string, string> = {};
    const visit = (node: unknown, pathSegments: string[]) => {
      if (typeof node === "string") {
        const key = pathSegments.join(".");
        if (!(key in result)) {
          result[key] = node;
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
    visit(parsed, []);
    return result;
  } catch {
    return {};
  }
};

const buildOverridesFromYaml = () => {
  const enMap = loadYamlFlatMap("en.yaml");
  const zhCNMap = loadYamlFlatMap("zh-CN.yaml");
  const zhTWMap = loadYamlFlatMap("zh-TW.yaml");
  const zhHKMap = loadYamlFlatMap("zh-HK.yaml");

  const buildLocaleOverrides = (targetMap: Record<string, string>) => {
    const overrides: Record<string, string> = {};
    for (const [pathKey, enValue] of Object.entries(enMap)) {
      const targetValue = targetMap[pathKey];
      if (typeof enValue === "string" && typeof targetValue === "string") {
        if (!(enValue in overrides)) {
          overrides[enValue] = targetValue;
        }
      }
    }
    return overrides;
  };

  return {
    "zh-CN": buildLocaleOverrides(zhCNMap),
    "zh-TW": buildLocaleOverrides(zhTWMap),
    "zh-HK": buildLocaleOverrides(zhHKMap),
  };
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const i18nOverrides = buildOverridesFromYaml();
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
