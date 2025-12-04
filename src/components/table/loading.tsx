import { Center, Spinner } from "@chakra-ui/react";

export function LoadingState() {
  return (
    <Center
      position="absolute"
      top="0"
      left="0"
      bg="gray.300/20"
      w="full"
      h="full"
    >
      <Spinner />
    </Center>
  );
}
