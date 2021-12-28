import React from "react";
import {
  Box,
  GridItem,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  HStack,
} from "@chakra-ui/layout";
import { useController, useForm } from "react-hook-form";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Select } from "@chakra-ui/select";
import { Button } from "@chakra-ui/button";
import { Alert, AlertIcon } from "@chakra-ui/alert";
import { useColorModeValue } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { doc, updateDoc } from "@firebase/firestore";
import { useToast } from "@chakra-ui/toast";

import { CAREER_LEVELS, PHONE_NR_REGEX } from "../utils/constants";
import { db } from "../firebase";
import { generateKeywordsArrayForText } from "../utils/helpers";

const Profile = () => {
  const [editMode, setEditMode] = React.useState(false);
  const [currentYear] = React.useState(new Date().getFullYear());
  const user = useSelector((state) => state.user.value);

  const { control, handleSubmit, setValue: setValueProfileForm } = useForm();

  const {
    field: fieldName,
    fieldState: { error: fieldNameError, invalid: isInvalidFieldName },
  } = useController({
    control: control,
    defaultValue: "",
    name: "displayName",
    rules: {
      required: { value: true, message: "Name is required" },
    },
  });

  const {
    field: fieldPhoneNumber,
    fieldState: {
      error: fieldPhoneNumberError,
      invalid: isInvalidFieldPhoneNumber,
    },
  } = useController({
    control: control,
    defaultValue: "",
    name: "phoneNumber",
    rules: {
      pattern: {
        value: PHONE_NR_REGEX,
        message: "Valid Phone Number is required",
      },
      required: { value: true, message: "Phone number is required" },
    },
  });

  const {
    field: fieldSU,
    fieldState: { error: fieldSUError, invalid: isInvalidFieldSU },
  } = useController({
    control: control,
    defaultValue: "",
    name: "SU",
    rules: {
      required: { value: true, message: "SU Detail is required" },
    },
  });

  const {
    field: fieldCareerLevel,
    fieldState: {
      error: fieldCareerLevelError,
      invalid: isInvalidFieldCareerLevel,
    },
  } = useController({
    control: control,
    defaultValue: "",
    name: "careerLevel",
    rules: {
      required: { value: true, message: "Career level is required" },
    },
  });

  const {
    field: fieldFiscalYear,
    fieldState: {
      error: fieldFiscalYearError,
      invalid: isInvalidFieldFiscalYear,
    },
  } = useController({
    control: control,
    defaultValue: "",
    name: "fiscalYear",
    rules: {
      required: { value: true, message: "Fiscal year is required" },
    },
  });

  const setValuesForProfileForm = React.useCallback(() => {
    setValueProfileForm("displayName", user.displayName);
    setValueProfileForm("phoneNumber", user.phoneNumber);
    setValueProfileForm("careerLevel", user.careerLevel);
    setValueProfileForm("SU", user.SU);
    setValueProfileForm("fiscalYear", user.fiscalYear);
  }, [user, setValueProfileForm]);

  React.useEffect(() => {
    if (!user) return;

    if (user.isProfileCompleted) {
      setValuesForProfileForm();
    }
  }, [user, setValuesForProfileForm]);

  const toast = useToast();

  const submitProfileForm = React.useCallback(
    async (data) => {
      const currentDisplayName = data.displayName;

      const keywordsArrayOfDisplayName =
        generateKeywordsArrayForText(currentDisplayName);

      try {
        await updateDoc(doc(db, "users", user.uid), {
          isProfileCompleted: true,
          keywordsArrayOfDisplayName,
          ...data,
        });

        setEditMode(false);

        toast({
          position: "top",
          title: "Succesfully updated profile details! 🚀",
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
    [user, toast]
  );

  return (
    <Box shadow="base" rounded={[null, "md"]} overflow={{ sm: "hidden" }}>
      <Stack
        px={4}
        py={5}
        p={[null, 6]}
        bg={useColorModeValue("white", "gray.700")}
        spacing={6}
      >
        {!user.isProfileCompleted && (
          <Box>
            <Heading fontSize="lg" mb={2}>
              Please complete your profile details.
            </Heading>
            <Alert
              p={2}
              status="warning"
              width="fit-content"
              rounded={"md"}
              variant="left-accent"
            >
              <AlertIcon />
              <Text fontSize="sm">
                Incomplete profiles have limited capabilities on the platform.
              </Text>
            </Alert>
          </Box>
        )}
        <SimpleGrid columns={6} spacing={6}>
          <FormControl
            as={GridItem}
            colSpan={[6, 3]}
            isInvalid={isInvalidFieldName}
            isRequired
          >
            <FormLabel
              htmlFor={fieldName.name}
              fontSize="sm"
              fontWeight="md"
              color={useColorModeValue("gray.700", "gray.50")}
            >
              Name
            </FormLabel>
            <Input
              isDisabled={user?.isProfileCompleted && !editMode}
              type="text"
              name={fieldName.name}
              onChange={fieldName.onChange}
              value={fieldName.value}
              mt={1}
              focusBorderColor="brand.400"
              shadow="sm"
              size="sm"
              w="full"
              rounded="md"
            />
            <FormErrorMessage>{fieldNameError?.message}</FormErrorMessage>
          </FormControl>

          <FormControl
            as={GridItem}
            colSpan={[6, 3]}
            isInvalid={isInvalidFieldPhoneNumber}
            isRequired
          >
            <FormLabel
              htmlFor={fieldPhoneNumber.name}
              fontSize="sm"
              fontWeight="md"
              color={useColorModeValue("gray.700", "gray.50")}
            >
              Phone Number
            </FormLabel>
            <Input
              isDisabled={user?.isProfileCompleted && !editMode}
              type="tel"
              name={fieldPhoneNumber.name}
              onChange={fieldPhoneNumber.onChange}
              value={fieldPhoneNumber.value}
              mt={1}
              focusBorderColor="brand.400"
              shadow="sm"
              size="sm"
              w="full"
              rounded="md"
            />
            <FormErrorMessage>
              {fieldPhoneNumberError?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl as={GridItem} colSpan={6} isRequired>
            <FormLabel
              htmlFor="email"
              fontSize="sm"
              fontWeight="md"
              color={useColorModeValue("gray.700", "gray.50")}
            >
              Email address
            </FormLabel>
            <Input
              isDisabled
              type="email"
              value={user.email}
              mt={1}
              focusBorderColor="brand.400"
              shadow="sm"
              size="sm"
              w="full"
              rounded="md"
            />
          </FormControl>

          <FormControl
            as={GridItem}
            colSpan={[6, 3]}
            isInvalid={isInvalidFieldCareerLevel}
            isRequired
          >
            <FormLabel
              htmlFor={fieldCareerLevel.name}
              fontSize="sm"
              fontWeight="md"
              color={useColorModeValue("gray.700", "gray.50")}
            >
              Career Level
            </FormLabel>

            <Select
              isDisabled={user?.isProfileCompleted && !editMode}
              name={fieldCareerLevel.name}
              onChange={fieldCareerLevel.onChange}
              value={fieldCareerLevel.value}
              placeholder="Select option"
              mt={1}
              focusBorderColor="brand.400"
              shadow="sm"
              size="sm"
              w="full"
              rounded="md"
            >
              {React.Children.toArray(
                Object.values(CAREER_LEVELS).map((cl) => (
                  <option value={cl}>{cl.toUpperCase()}</option>
                ))
              )}
            </Select>
            <FormErrorMessage>
              {fieldCareerLevelError?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl
            as={GridItem}
            colSpan={[6, 3]}
            isInvalid={isInvalidFieldSU}
            isRequired
          >
            <FormLabel
              htmlFor={fieldSU.name}
              fontSize="sm"
              fontWeight="md"
              color={useColorModeValue("gray.700", "gray.50")}
            >
              Stand Up Detail
            </FormLabel>
            <Input
              isDisabled={user?.isProfileCompleted && !editMode}
              type="text"
              name={fieldSU.name}
              onChange={fieldSU.onChange}
              value={fieldSU.value}
              mt={1}
              focusBorderColor="brand.400"
              shadow="sm"
              size="sm"
              w="full"
              rounded="md"
            />
            <FormErrorMessage>{fieldSUError?.message}</FormErrorMessage>
          </FormControl>

          <FormControl
            as={GridItem}
            colSpan={[6, 3]}
            isInvalid={isInvalidFieldFiscalYear}
            isRequired
          >
            <FormLabel
              htmlFor={fieldFiscalYear.name}
              fontSize="sm"
              fontWeight="md"
              color={useColorModeValue("gray.700", "gray.50")}
            >
              Fiscal Year
            </FormLabel>
            <Input
              isDisabled={user?.isProfileCompleted && !editMode}
              type="number"
              name={fieldFiscalYear.name}
              onChange={fieldFiscalYear.onChange}
              value={fieldFiscalYear.value}
              mt={1}
              focusBorderColor="brand.400"
              shadow="sm"
              size="sm"
              w="full"
              rounded="md"
            />
            <FormErrorMessage>{fieldFiscalYearError?.message}</FormErrorMessage>
          </FormControl>

          <FormControl as={GridItem} colSpan={[6, 3]} isRequired>
            <FormLabel
              htmlFor="currentYear"
              fontSize="sm"
              fontWeight="md"
              color={useColorModeValue("gray.700", "gray.50")}
            >
              Current Year
            </FormLabel>
            <Input
              isDisabled
              type="number"
              name="currentYear"
              value={currentYear}
              mt={1}
              focusBorderColor="brand.400"
              shadow="sm"
              size="sm"
              w="full"
              rounded="md"
            />
          </FormControl>
        </SimpleGrid>
        <HStack spacing={2} justifyContent="flex-end">
          {user.isProfileCompleted && (
            <Button
              fontWeight="md"
              onClick={() => {
                if (editMode) {
                  setEditMode(false);
                  setValuesForProfileForm();
                } else {
                  setEditMode(true);
                }
              }}
            >
              {editMode ? "Cancel" : "Edit"}
            </Button>
          )}
          {(!user.isProfileCompleted || editMode) && (
            <Button fontWeight="md" onClick={handleSubmit(submitProfileForm)}>
              Save
            </Button>
          )}
        </HStack>
      </Stack>
    </Box>
  );
};

export default Profile;
