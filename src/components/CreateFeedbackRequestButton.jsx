import React from "react";
import { useSelector } from "react-redux";
import { Button } from "@chakra-ui/button";
import { VStack } from "@chakra-ui/layout";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from "@chakra-ui/modal";
import { Alert, AlertIcon } from "@chakra-ui/alert";
import { Text } from "@chakra-ui/layout";
import { Controller, useForm } from "react-hook-form";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Select } from "@chakra-ui/select";
import { useToast } from "@chakra-ui/toast";

import { ROLES } from "../utils/constants";
import { addDoc, collection } from "@firebase/firestore";
import { db } from "../firebase";

const CreateFeedbackRequestButton = ({ myTeams }) => {
  const [isOpenDialog, setIsOpenDialog] = React.useState(false);
  const [loadingNewFeedbackRequest, setLoadingNewFeedbackRequest] =
    React.useState(false);
  const [currentRequestedOn, setCurrentRequestedOn] = React.useState(null);
  const [currentAnsweredBy, setCurrentAnsweredBy] = React.useState(null);

  const cancelDialogRef = React.useRef();

  const currentUser = useSelector((state) => state.user.value);
  const colorModeForFromLabels = useColorModeValue("gray.700", "gray.50");
  const toast = useToast();

  const {
    control,
    handleSubmit,
    clearErrors: clearFormErrors,
    reset: resetForm,
    setValue: setValueForm,
  } = useForm();

  const onCloseDialog = React.useCallback(() => {
    setIsOpenDialog(false);
    resetForm();
    clearFormErrors();
    setCurrentRequestedOn(null);
    setCurrentAnsweredBy(null);
  }, [resetForm, clearFormErrors]);

  const setOfAllTeamMembers = () =>
    Array.from(
      new Set(
        myTeams.reduce((acc, team) => {
          acc = [...team.members, ...acc];
          return acc;
        }, [])
      )
    );

  // set currentRequestedOn to current user if role is of type USER
  React.useEffect(() => {
    if (!currentUser) return;

    if (currentUser.role === ROLES.USER) {
      setCurrentRequestedOn(currentUser.uid);
      setValueForm("requestedOn", currentUser.uid);
    }
  }, [currentUser, setValueForm]);

  const createFeedbackRequest = React.useCallback(
    async (data) => {
      try {
        setLoadingNewFeedbackRequest(true);

        console.log(data);

        await addDoc(collection(db, "feedbacks"), data);
        onCloseDialog();

        toast({
          position: "top",
          title: "Successfully created feedback request!",
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
      } finally {
        setLoadingNewFeedbackRequest(false);
      }
    },
    [toast, onCloseDialog]
  );

  return (
    <>
      <Button onClick={() => setIsOpenDialog(true)}>
        New Feedback Request
      </Button>
      <AlertDialog
        isOpen={isOpenDialog}
        leastDestructiveRef={cancelDialogRef}
        onClose={onCloseDialog}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold"
              textAlign="center"
            >
              {`Create a new feedback request ✨`}
            </AlertDialogHeader>

            <AlertDialogBody>
              {!myTeams.length ? (
                <Alert
                  p={2}
                  status="warning"
                  width="fit-content"
                  rounded={"md"}
                  variant="left-accent"
                >
                  <AlertIcon />
                  <Text fontSize="sm">You are not part of a team.</Text>
                </Alert>
              ) : (
                <VStack>
                  <Controller
                    control={control}
                    rules={{
                      required: {
                        value: true,
                        message:
                          "Feedback request needs a user to be requested on",
                      },
                    }}
                    name="requestedOn"
                    render={({ field, fieldState: { invalid, error } }) => {
                      return (
                        <FormControl isInvalid={invalid} isRequired>
                          <FormLabel
                            htmlFor={field.name}
                            fontSize="sm"
                            fontWeight="md"
                            color={colorModeForFromLabels}
                          >
                            Feedback request on
                          </FormLabel>
                          {currentUser.role === ROLES.USER ? (
                            <Select isDisabled defaultValue={currentUser.uid}>
                              <option value={currentUser.uid}>
                                {currentUser.displayName}
                              </option>
                            </Select>
                          ) : (
                            <Select
                              placeholder="Select a user"
                              onChange={(e) => {
                                setCurrentRequestedOn(e.target.value);
                                field.onChange(e.target.value);
                              }}
                              value={field.value}
                            >
                              {React.Children.toArray(
                                setOfAllTeamMembers()
                                  .filter(
                                    (m) =>
                                      m.uid !== currentUser.uid &&
                                      m.uid !== currentAnsweredBy
                                  )
                                  .map((user) => (
                                    <option value={user.uid}>
                                      {user.displayName}
                                    </option>
                                  ))
                              )}
                            </Select>
                          )}
                          <FormErrorMessage>{error?.message}</FormErrorMessage>
                        </FormControl>
                      );
                    }}
                  />
                  {!!currentRequestedOn && (
                    <Controller
                      control={control}
                      rules={{
                        required: {
                          value: true,
                          message:
                            "Feedback request needs a user to be answered by",
                        },
                      }}
                      name="answeredBy"
                      render={({ field, fieldState: { invalid, error } }) => {
                        return (
                          <FormControl isInvalid={invalid} isRequired>
                            <FormLabel
                              htmlFor={field.name}
                              fontSize="sm"
                              fontWeight="md"
                              color={colorModeForFromLabels}
                            >
                              Feedback to be answered by
                            </FormLabel>
                            <Select
                              placeholder="Select a user"
                              onChange={(e) => {
                                setCurrentAnsweredBy(e.target.value);
                                field.onChange(e.target.value);
                              }}
                              value={field.value}
                            >
                              {React.Children.toArray(
                                setOfAllTeamMembers()
                                  .filter((m) => m.uid !== currentRequestedOn)
                                  .map((user) => (
                                    <option value={user.uid}>
                                      {user.displayName}
                                    </option>
                                  ))
                              )}
                            </Select>
                            <FormErrorMessage>
                              {error?.message}
                            </FormErrorMessage>
                          </FormControl>
                        );
                      }}
                    />
                  )}
                </VStack>
              )}
            </AlertDialogBody>

            <AlertDialogFooter justifyContent="center">
              <Button
                ref={cancelDialogRef}
                onClick={onCloseDialog}
                isDisabled={loadingNewFeedbackRequest}
                isLoading={loadingNewFeedbackRequest}
              >
                Cancel
              </Button>
              {!!myTeams?.length && (
                <Button
                  ml={4}
                  onClick={handleSubmit(createFeedbackRequest)}
                  isDisabled={loadingNewFeedbackRequest}
                  isLoading={loadingNewFeedbackRequest}
                >
                  Create
                </Button>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default CreateFeedbackRequestButton;
