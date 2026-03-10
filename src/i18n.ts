import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { getStoredUser } from "./utils/authStorage";

const getStoredUserLanguage = (): string | undefined => {
  if (typeof window === "undefined") return undefined;

  const userLanguage = getStoredUser().language;

  if (typeof userLanguage === "string" && userLanguage.trim()) {
    return userLanguage.trim();
  }

  return undefined;
};

const languageDetector = new LanguageDetector();

languageDetector.addDetector({
  name: "userLanguage",
  lookup() {
    return getStoredUserLanguage();
  },
});

i18n
  .use(Backend)
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ["en", "hu"],
    ns: ["translations"],
    defaultNS: "translations",
    fallbackLng: "en",
    debug: true, // Set to false in production

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    backend: {
      // path to the JSON files
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    detection: {
      order: ["userLanguage", "localStorage", "navigator"],
      caches: [],
    },
  });

export default i18n;
