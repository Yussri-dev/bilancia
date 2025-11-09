import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import en from "./en.json";
import fr from "./fr.json";
import nl from "./nl.json";

const lang = i18next;

// Get device language safely
const getDeviceLang = () => {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
        const tag = locales[0].languageTag || locales[0].languageCode;
        if (tag.startsWith("fr")) return "fr";
        if (tag.startsWith("nl")) return "nl";
    }
    return "en";
};

lang
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            fr: { translation: fr },
            nl: { translation: nl },
        },
        lng: getDeviceLang(),
        fallbackLng: "en",
        interpolation: { escapeValue: false },
    });

// Persist user language
lang.on("languageChanged", (lng) => AsyncStorage.setItem("lang", lng));

export default lang;
