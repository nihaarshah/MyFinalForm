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

// const res = await model.call(
//   "What would be a good company name a company that makes colorful socks?"
// );
// console.log(res);

// console.log(search());

export default function Home() {
  const toast = useToast();

  const startupDesc = useRef();

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
          Final Form
        </Heading>

        <form onSubmit={handleSubmit}>
          <Stack spacing={6}>
            <FormControl id="startupIdea">
              <FormLabel>Startup Idea</FormLabel>
              <Textarea
                placeholder="Enter your startup idea"
                ref={startupDesc}
              />
            </FormControl>

            <FormControl id="otherData">
              <FormLabel>Other Data</FormLabel>
              <Textarea placeholder="Enter any additional information" />
            </FormControl>

            <FormControl id="generateFromProfiles">
              <Button
                onClick={async () => {
                  await (
                    await fetch("/api/search", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        companyDescription: startupDesc.current.value,
                      }),
                    })
                  ).json();
                }}
              >
                Generate from Profiles
              </Button>
            </FormControl>

            <FormControl id="fileSelector">
              <FormLabel>Attach Files</FormLabel>
              <Input type="file" onChange={() => {}} />
            </FormControl>

            <Button type="submit" colorScheme="blue">
              Submit
            </Button>
          </Stack>
        </form>
      </Container>
    </ChakraProvider>
  );
}
