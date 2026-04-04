import { Center, Text } from "@chakra-ui/react";

type NoImageFallbackProps = {
	message?: string;
};

export function NoImageFallback({
	message = "No Featured Image",
}: NoImageFallbackProps) {
	return (
		<Center bg="gray.400" borderRadius="8px">
			<Text whiteSpace="wrap" textAlign="center" color="gray.600" fontSize="xs">
				{message}
			</Text>
		</Center>
	);
}
