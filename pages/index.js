import Head from "next/head";
import {
  Box,
  Button,
  ChakraProvider,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import React, { useRef } from "react";

export default function Home() {
  const toast = useToast();

  const startupDesc = useRef();
  const founderDesc = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    toast({
      title: "Form submitted.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <ChakraProvider>
      <Container maxW="container.xl">
        <Heading as="h1" size="2xl" textAlign="center" my={8}>
          📜 Final Form 📜
        </Heading>

        <form onSubmit={handleSubmit}>
          <Stack spacing={6}>
            <FormControl id="startupIdea">
              <FormLabel>Startup Description</FormLabel>
              <Textarea
                placeholder="Enter your startup idea"
                ref={startupDesc}
              />
            </FormControl>

            <FormControl id="otherData">
              <FormLabel>Founder Information</FormLabel>
              <Textarea
                placeholder="Enter any additional information"
                ref={founderDesc}
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              onClick={async () => {
                let local = await (
                  await fetch("/api/process-company", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      companyDescription: startupDesc.current.value,
                      founderDescription: founderDesc.current.value,
                    }),
                  })
                ).json();

                localStorage.setItem("partnerMatch", local.partnerMatch);
                localStorage.setItem("companySummary", local.companySummary);
              }}
            >
              Submit
            </Button>
          </Stack>
        </form>
      </Container>
    </ChakraProvider>
  );
}
