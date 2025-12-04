import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import { ENVS } from "@/configs/envs";

i18n
	.use(HttpBackend) // load translations from public/locales
	.use(LanguageDetector) // detect user language
	.use(initReactI18next) // pass i18n instance to react-i18next
	.init({
		supportedLngs: ["en", "id"],
		fallbackLng: "en",
		ns: ["common"],
		defaultNS: "common",
		debug: ENVS.APP_ENV === "development",
		interpolation: {
			escapeValue: false, // react already safes from xss
		},
		backend: {
			loadPath: `${ENVS.APP_HOST}/locales/{{lng}}/{{ns}}.json`,
		},
	});
export default i18n;
