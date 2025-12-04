import { useTranslation as useI18NextTranslation } from "react-i18next";

export function useTranslation() {
	const { t, i18n } = useI18NextTranslation();

	const changeLocale = async (lang: string) => {
		return await i18n.changeLanguage(lang);
	};

	return {
		translate: t,
		getLocale: () => i18n.language || "en",
		changeLocale,
	};
}
