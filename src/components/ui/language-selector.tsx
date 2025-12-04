"use client";
import { Button, HStack, Menu, Portal, Text } from "@chakra-ui/react";
import { type ReactNode, useEffect, useState } from "react";
import { FlagEnglish, FlagIndonesia } from "@/components/icons/icons";
import { useTranslation } from "@/hooks/useTranslation";

const supportedLanguage = [
	{
		lang: "id",
		label: "ID",
		icon: <FlagIndonesia />,
	},
	{
		lang: "en",
		label: "EN",
		icon: <FlagEnglish />,
	},
];

export function LanguageSelector() {
	const { getLocale, changeLocale } = useTranslation();
	const currentLocale = getLocale();

	const [selected, setSelected] = useState<(typeof supportedLanguage)[number]>(
		() => selectedLanguage(supportedLanguage, currentLocale),
	);

	useEffect(() => {
		setSelected(selectedLanguage(supportedLanguage, currentLocale));
	}, [currentLocale]);

	return (
		<Menu.Root size="sm" onSelect={(details) => changeLocale(details.value)}>
			<Menu.Trigger asChild>
				<Button
					colorPalette="teal"
					variant="ghost"
					size="sm"
					_light={{ color: "white", _hover: { color: "blackAlpha.800" } }}
					_expanded={{ color: "blackAlpha.800" }}
					_dark={{ color: "teal.400" }}
				>
					<LanguageItem icon={selected.icon} label={selected.label} />
				</Button>
			</Menu.Trigger>
			<Portal>
				<Menu.Positioner>
					<Menu.Content>
						{supportedLanguage.map((item) => (
							<Menu.Item key={item.lang} value={item.lang} cursor="pointer">
								<LanguageItem icon={item.icon} label={item.label} />
							</Menu.Item>
						))}
					</Menu.Content>
				</Menu.Positioner>
			</Portal>
		</Menu.Root>
	);
}

type LanguageItemProps = {
	icon: ReactNode;
	label: string;
};

function LanguageItem({ icon, label }: LanguageItemProps) {
	return (
		<HStack gap="1em">
			{icon}
			<Text>{label}</Text>
		</HStack>
	);
}

function selectedLanguage(langs: typeof supportedLanguage, current: string) {
	const selected = langs.find((l) => l.lang === current);
	return selected || langs[0];
}
