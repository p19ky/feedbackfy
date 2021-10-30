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
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@chakra-ui/toast";

import { EMAIL_REGEX } from "../constants";
import { loginWithEmailAndPassword } from "../state/user/userSlice";

const Login = () => {
  const dispatch = useDispatch();
  const userError = useSelector((state) => state.user.error);
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

  const signIn = React.useCallback(
    ({ email, password }) => {
      dispatch(
        loginWithEmailAndPassword({
          email,
          password,
        })
      );
    },
    [dispatch]
  );

  React.useEffect(() => {
    const handleEnterKeyPressDown = (e) => {
      if ((e.code === "Enter" || e.key === "Enter") && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(signIn)();
      }
    };

    window.addEventListener("keydown", handleEnterKeyPressDown);
    return () => window.removeEventListener("keydown", handleEnterKeyPressDown);
  }, [handleSubmit, signIn]);

  React.useEffect(() => {
    if (!userError) return;

    if (!!(userError?.code === "auth/user-not-found")) {
      toast({
        position: "top",
        title: "User not found ¯\\_(ツ)_/¯",
        description: "Email or password is incorrect",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }

    if (!!(userError?.code === "auth/wrong-password")) {
      toast({
        position: "top",
        title: "Wrong password 👀",
        description: "The password entered is incorrect",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }

    if (!!(userError?.code === "auth/too-many-requests")) {
      toast({
        position: "top",
        title: "Too many requests",
        description: "You tried too many times. Please try again later 😊",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  }, [userError, toast]);

  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>Sign in to your account</Heading>
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
            <Stack spacing={10}>
              <Link as={RouterLink} to="/forgot-password" color={"blue.400"}>
                Forgot password?
              </Link>
              <Stack spacing={4}>
                <Button
                  onClick={handleSubmit(signIn)}
                  bg={"blue.400"}
                  color={"white"}
                  _hover={{
                    bg: "blue.500",
                  }}
                >
                  Sign in
                </Button>
                <Button
                  as={RouterLink}
                  to="/register"
                  variant="outline"
                  color={"blue.400"}
                >
                  Create new account
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default Login;
