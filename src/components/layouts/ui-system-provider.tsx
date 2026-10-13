import {
	ChakraProvider,
	createSystem,
	defaultConfig,
	defineConfig,
} from "@chakra-ui/react";
import {
	ColorModeProvider,
	type ColorModeProviderProps,
} from "@/components/ui/color-mode";

export function UISystemProvider(props: ColorModeProviderProps) {
	const config = defineConfig({
		theme: {
			tokens: {
				colors: {
					brand: { value: "#000272" },
				},
			},
		},
	});

	const system = createSystem(defaultConfig, config);

	return (
		<ChakraProvider value={system}>
			<ColorModeProvider {...props} />
		</ChakraProvider>
	);
}
