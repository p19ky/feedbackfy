import React from "react";
import { Box, Flex, Heading, Stack, Link } from "@chakra-ui/layout";
import { useColorModeValue } from "@chakra-ui/color-mode";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "@chakra-ui/button";
import { useController, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useToast } from "@chakra-ui/toast";
import { unwrapResult } from "@reduxjs/toolkit";

import { EMAIL_REGEX } from "../utils/constants";
import { registerWithEmailAndPassword } from "../state/user/userSlice";

const Register = () => {
  const dispatch = useDispatch();
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

  const { field: fieldPassword } = useController({
    control: control,
    defaultValue: "",
    name: "password",
    rules: {
      required: { value: true, message: "Password is required" },
    },
  });

  const { field: fieldPasswordConfirm } = useController({
    control: control,
    defaultValue: "",
    name: "passwordConfirm",
    rules: {
      required: { value: true, message: "Password Confirmation is required" },
      validate: (value) => value === fieldPassword.value,
    },
  });

  const signUp = React.useCallback(
    async ({ email, password }) => {
      try {
        unwrapResult(
          await dispatch(
            registerWithEmailAndPassword({
              email,
              password,
            })
          )
        );
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
    [dispatch, toast]
  );

  React.useEffect(() => {
    const handleEnterKeyPressDown = (e) => {
      if ((e.code === "Enter" || e.key === "Enter") && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(signUp)();
      }
    };

    window.addEventListener("keydown", handleEnterKeyPressDown);
    return () => window.removeEventListener("keydown", handleEnterKeyPressDown);
  }, [handleSubmit, signUp]);

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"}>
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>Create your new account</Heading>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Stack spacing={4}>
            <FormControl id="email" isRequired isInvalid={errors?.email}>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                onChange={fieldEmail.onChange}
                value={fieldEmail.value}
                name={fieldEmail.name}
              />
              <FormErrorMessage>{errors?.email?.message}</FormErrorMessage>
            </FormControl>
            <FormControl id="password" isRequired isInvalid={errors?.password}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                onChange={fieldPassword.onChange}
                value={fieldPassword.value}
                name={fieldPassword.name}
              />
              <FormErrorMessage>{errors?.password?.message}</FormErrorMessage>
            </FormControl>
            <FormControl
              id="passwordConfirm"
              isRequired
              isInvalid={errors?.passwordConfirm}
            >
              <FormLabel>Confirm Password</FormLabel>
              <Input
                type="password"
                onChange={fieldPasswordConfirm.onChange}
                value={fieldPasswordConfirm.value}
                name={fieldPasswordConfirm.name}
              />
              <FormErrorMessage>
                {errors?.passwordConfirm?.message ||
                  (errors?.passwordConfirm?.type === "validate" &&
                    "Passwords must match")}
              </FormErrorMessage>
            </FormControl>
            <Stack spacing={4} pt={10}>
              <Button
                onClick={handleSubmit(signUp)}
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
              >
                Create account
              </Button>
              <Link as={RouterLink} to="/login" color={"blue.400"}>
                Already have an account?
              </Link>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default Register;
