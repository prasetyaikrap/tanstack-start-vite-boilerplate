import { Button, Center, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";

export default function NotFoundLayout() {
	const navigate = useNavigate();
	return (
		<Center width="full" height="100vh" flex={1}>
			<VStack width={{ base: "80%", md: "50%" }}>
				<Text fontSize="72px" fontWeight="bold">
					404
				</Text>
				<Text
					fontSize="lg"
					fontWeight="700"
					textAlign="center"
					fontStyle="italic"
				>
					Sorry, your requested resources currently unavailable
				</Text>
				<Button
					onClick={() => navigate({ to: "/", replace: true })}
					variant="outline"
					colorScheme="blue"
				>
					Back to Home
				</Button>
			</VStack>
		</Center>
	);
}
