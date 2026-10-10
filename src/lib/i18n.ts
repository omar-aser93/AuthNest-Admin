import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "@/locales/en.json";
import ar from "@/locales/ar.json";


// RTL support (for Arabic)  
function applyDirection(lng: string) {
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lng;
}

// set up i18next
i18n.use(LanguageDetector).use(initReactI18next)
  .init({
    resources: {                                    // translation files
      en: { translation: en },
      ar: { translation: ar },
    }, 
    fallbackLng: "en",                              // default language     
    supportedLngs: ["en", "ar"],                    // supported languages
    interpolation: { escapeValue: false },          // react already safe from xss
    detection: {                                    // order and caches
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  })
  .then(() => {
    // Apply direction once on boot.
    applyDirection(i18n.resolvedLanguage ?? "en");
  });

// Keep applying direction on every subsequent language change (dropdown toggle)
i18n.on("languageChanged", applyDirection);

export default i18n;