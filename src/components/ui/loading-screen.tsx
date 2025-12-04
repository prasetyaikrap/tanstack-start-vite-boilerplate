"use client";
import {
	AbsoluteCenter,
	Box,
	type BoxProps,
	HStack,
	Spinner,
	Text,
} from "@chakra-ui/react";
import { useTranslation } from "@/hooks/useTranslation";

export function LoadingScreen(props: BoxProps) {
	const { translate } = useTranslation();
	return (
		<Box w="full" {...props}>
			<AbsoluteCenter bg="bg/80" backdropFilter="blur(2px)" rounded="md" p="4">
				<HStack gap="3">
					<Spinner size="lg" colorPalette="teal" />
					<Text fontSize="lg" color="fg.muted">
						{translate("loading.default")}
					</Text>
				</HStack>
			</AbsoluteCenter>
		</Box>
	);
}
