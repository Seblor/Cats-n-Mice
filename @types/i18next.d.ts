// import the original type declarations
import "i18next";
// import all namespaces (for the default language, only)
import en from "../src/i18n/locales/en.json";
import fr from "../src/i18n/locales/fr.json";

type addedLanguages = "en" | "fr";

declare module "i18next" {

  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom namespace type, if you changed it
    defaultNS: "en";
    // custom resources type
    resources: {
      en: typeof en;
      fr: typeof fr;
    };
    // other
  }
}