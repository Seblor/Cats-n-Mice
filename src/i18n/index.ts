import i18next from "i18next";

import en from "./locales/en.json";
import fr from "./locales/fr.json";

await i18next
  .init({
    fallbackLng: "en",
    load: 'all',
    resources: {
      en: {
        translation: en
      },
      fr: {
        translation: fr
      }
    },
  });
