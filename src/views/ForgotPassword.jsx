import React from "react";
import { Button } from "@chakra-ui/button";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { FormControl, FormErrorMessage } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Flex, Heading, Stack, Text } from "@chakra-ui/layout";
import { useController, useForm } from "react-hook-form";
import { getAuth, sendPasswordResetEmail } from "@firebase/auth";
import { useToast } from "@chakra-ui/toast";

import { EMAIL_REGEX } from "../utils/constants";

const ForgotPassword = () => {
  const toast = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { field: fieldEmail } = useController({
    control: control,
    defaultValue: "",
    name: "email",
    rules: {
      pattern: {
        value: EMAIL_REGEX,
        message: "Valid email is required",
      },
      required: { value: true, message: "Valid email is required" },
    },
  });

  const sendResetEmailLink = React.useCallback(
    async ({ email }) => {
      try {
        await sendPasswordResetEmail(getAuth(), email, {
          url: "http://localhost:3000",
        });

        toast({
          position: "top",
          title: "Succesfully sent password-reset link 🚀",
          description: "Please check your inbox.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      } catch (error) {
        const errorMessage = error.code.split("/")[1].replaceAll("-", " ");

        toast({
          position: "top",
          title: errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1),
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    },
    [toast]
  );

  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack
        spacing={4}
        w={"full"}
        maxW={"md"}
        bg={useColorModeValue("white", "gray.700")}
        rounded={"xl"}
        boxShadow={"lg"}
        p={6}
        my={12}
      >
        <Heading lineHeight={1.1} fontSize={{ base: "2xl", md: "3xl" }}>
          Forgot your password?
        </Heading>
        <Text
          fontSize={{ base: "sm", sm: "md" }}
          color={useColorModeValue("gray.800", "gray.400")}
        >
          You&apos;ll get an email with a reset link
        </Text>
        <FormControl id="email" isRequired isInvalid={errors?.email}>
          <Input
            type="email"
            onChange={fieldEmail.onChange}
            value={fieldEmail.value}
            name={fieldEmail.name}
            placeholder="your-email@example.com"
            _placeholder={{ color: "gray.500" }}
          />
          <FormErrorMessage>{errors?.email?.message}</FormErrorMessage>
        </FormControl>
        <Stack spacing={6}>
          <Button
            onClick={handleSubmit(sendResetEmailLink)}
            bg={"blue.400"}
            color={"white"}
            _hover={{
              bg: "blue.500",
            }}
          >
            Request Reset
          </Button>
        </Stack>
      </Stack>
    </Flex>
  );
};

export default ForgotPassword;
