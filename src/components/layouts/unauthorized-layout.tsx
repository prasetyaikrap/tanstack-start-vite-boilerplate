import { Button, Center, HStack, Text, VStack } from "@chakra-ui/react";
import { useNavigate, useRouter } from "@tanstack/react-router";

export function UnauthorizedLayout() {
	const router = useRouter();
	const navigate = useNavigate();
	return (
		<Center width="full" height="100vh" flex={1}>
			<VStack width={{ base: "80%", md: "50%" }}>
				<Text fontSize="72px" fontWeight="bold">
					403
				</Text>
				<Text
					fontSize="lg"
					fontWeight="700"
					textAlign="center"
					fontStyle="italic"
				>
					You don&apos;t have permission to access this page
				</Text>
				<HStack w="full" justifyContent="center">
					<Button
						onClick={() => router.history.back()}
						variant="outline"
						colorScheme="blue"
					>
						Back to Previous Page
					</Button>
					<Button
						onClick={() => navigate({ to: "/", replace: true })}
						variant="outline"
						colorScheme="blue"
					>
						Back to Dashboard
					</Button>
				</HStack>
			</VStack>
		</Center>
	);
}
