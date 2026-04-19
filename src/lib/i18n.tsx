import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "hi" | "mr";

const dict: Record<Lang, Record<string, string>> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.upload": "Upload & Verify",
    "nav.repository": "Repository",
    "nav.similar": "Similar Cases",
    "nav.lawyers": "Lawyers",
    "nav.chat": "Legal Assistant",
    "nav.compare": "Clause Compare",
    "nav.simulator": "Risk Simulator",
    "nav.summary": "Case Summary",
    "nav.heatmap": "Case Heatmap",
    "nav.fraud": "Fraud Detection",
    "nav.tags": "Smart Tags",
    "nav.deadlines": "Deadlines",
    "nav.versions": "Version History",
    "nav.public": "Public Mode",
    "nav.settings": "Settings",
    "section.core": "Core",
    "section.ai": "AI Tools",
    "section.analytics": "Analytics",
    "section.management": "Management",
    "auth.signin": "Sign In",
    "auth.signout": "Sign Out",
    "auth.guest": "Guest Mode",
    "settings.title": "Settings",
    "settings.subtitle": "Manage your preferences, appearance, and account details.",
    "settings.language": "Language",
    "settings.appearance": "Appearance",
    "settings.notifications": "Notifications",
    "settings.account": "Account Details",
    "settings.dark": "Dark Mode",
    "settings.light": "Light Mode",
    "settings.save": "Save Changes",
    "common.upload": "Upload",
    "common.analyze": "Verify & Analyze",
    "common.loading": "Loading...",
  },
  hi: {
    "nav.dashboard": "डैशबोर्ड",
    "nav.upload": "अपलोड और सत्यापन",
    "nav.repository": "भंडार",
    "nav.similar": "समान केस",
    "nav.lawyers": "वकील",
    "nav.chat": "कानूनी सहायक",
    "nav.compare": "खंड तुलना",
    "nav.simulator": "जोखिम सिम्युलेटर",
    "nav.summary": "केस सारांश",
    "nav.heatmap": "केस हीटमैप",
    "nav.fraud": "धोखाधड़ी पहचान",
    "nav.tags": "स्मार्ट टैग",
    "nav.deadlines": "समय सीमा",
    "nav.versions": "संस्करण इतिहास",
    "nav.public": "सार्वजनिक मोड",
    "nav.settings": "सेटिंग्स",
    "section.core": "मुख्य",
    "section.ai": "एआई उपकरण",
    "section.analytics": "विश्लेषण",
    "section.management": "प्रबंधन",
    "auth.signin": "साइन इन करें",
    "auth.signout": "साइन आउट",
    "auth.guest": "अतिथि मोड",
    "settings.title": "सेटिंग्स",
    "settings.subtitle": "अपनी प्राथमिकताएं, स्वरूप और खाता विवरण प्रबंधित करें।",
    "settings.language": "भाषा",
    "settings.appearance": "स्वरूप",
    "settings.notifications": "सूचनाएं",
    "settings.account": "खाता विवरण",
    "settings.dark": "डार्क मोड",
    "settings.light": "लाइट मोड",
    "settings.save": "परिवर्तन सहेजें",
    "common.upload": "अपलोड",
    "common.analyze": "सत्यापित करें",
    "common.loading": "लोड हो रहा है...",
  },
  mr: {
    "nav.dashboard": "डॅशबोर्ड",
    "nav.upload": "अपलोड व पडताळणी",
    "nav.repository": "संग्रह",
    "nav.similar": "समान प्रकरणे",
    "nav.lawyers": "वकील",
    "nav.chat": "कायदेशीर सहाय्यक",
    "nav.compare": "कलम तुलना",
    "nav.simulator": "जोखीम सिम्युलेटर",
    "nav.summary": "प्रकरण सारांश",
    "nav.heatmap": "प्रकरण हीटमॅप",
    "nav.fraud": "फसवणूक शोध",
    "nav.tags": "स्मार्ट टॅग",
    "nav.deadlines": "अंतिम मुदत",
    "nav.versions": "आवृत्ती इतिहास",
    "nav.public": "सार्वजनिक मोड",
    "nav.settings": "सेटिंग्ज",
    "section.core": "मुख्य",
    "section.ai": "एआय साधने",
    "section.analytics": "विश्लेषण",
    "section.management": "व्यवस्थापन",
    "auth.signin": "साइन इन करा",
    "auth.signout": "साइन आऊट",
    "auth.guest": "पाहुणा मोड",
    "settings.title": "सेटिंग्ज",
    "settings.subtitle": "तुमच्या प्राधान्ये, रूप आणि खाते तपशील व्यवस्थापित करा.",
    "settings.language": "भाषा",
    "settings.appearance": "रूप",
    "settings.notifications": "सूचना",
    "settings.account": "खाते तपशील",
    "settings.dark": "गडद मोड",
    "settings.light": "हलका मोड",
    "settings.save": "बदल जतन करा",
    "common.upload": "अपलोड",
    "common.analyze": "पडताळणी करा",
    "common.loading": "लोड होत आहे...",
  },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nCtx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("lang") as Lang) || "en");
  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);
  const t = (key: string) => dict[lang][key] || dict.en[key] || key;
  return <Ctx.Provider value={{ lang, setLang: setLangState, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
