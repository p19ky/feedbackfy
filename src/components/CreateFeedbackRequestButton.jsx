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
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "@firebase/firestore";
import { db } from "../firebase";

const CreateFeedbackRequestButton = ({
  myTeams,
  setShouldRefetchFeedbackRequests,
}) => {
  const [isOpenDialog, setIsOpenDialog] = React.useState(false);
  const [loadingNewFeedbackRequest, setLoadingNewFeedbackRequest] =
    React.useState(false);
  const [currentRequestedOn, setCurrentRequestedOn] = React.useState(null);
  const [currentAnsweredBy, setCurrentAnsweredBy] = React.useState(null);
  const [selectableProjects, setSelectableProjects] = React.useState([]);
  const [
    projectsWhereBothUsersAreMembers,
    setProjectsWhereBothUsersAreMembers,
  ] = React.useState([]);

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
    setCurrentAnsweredBy(null);
    if (currentUser.role !== ROLES.USER) {
      setCurrentRequestedOn(null);
    }
    if (currentUser.role === ROLES.USER) {
      setValueForm("requestedOn", currentUser.uid);
    }
  }, [currentUser, resetForm, clearFormErrors, setValueForm]);

  const setOfAllTeamMembers = React.useMemo(
    () =>
      Array.from(
        new Set(
          myTeams.reduce((acc, team) => {
            acc = [...team.members, ...acc];
            return acc;
          }, [])
        )
      ),
    [myTeams]
  );

  // get all projects which have as a team one of 'myTeams'
  // result will be a array with objects of the form { docId: project's id, ...project's data, team: myTeams Object }
  React.useEffect(() => {
    if (!myTeams?.length) return;

    (async () => {
      const allTeamsUids = myTeams.map((team) => team.docId);

      const resultDocs = [];
      for (let index = 0; index < allTeamsUids.length; index++) {
        const teamUid = allTeamsUids[index];
        const result = await getDocs(
          query(collection(db, "projects"), where("teamUid", "==", teamUid))
        );
        resultDocs.push(...result.docs);
      }

      const allProjectsFromResults = Array.from(
        new Set(
          resultDocs.reduce((acc, doc) => {
            acc = [
              {
                docId: doc.id,
                ...doc.data(),
                team: myTeams.find((t) => t.docId === doc.data().teamUid),
              },
              ...acc,
            ];
            return acc;
          }, [])
        )
      );

      setSelectableProjects(allProjectsFromResults);
    })();
  }, [myTeams]);

  // if both users have been selected, get the teams that can be selected by user.
  React.useEffect(() => {
    if (!selectableProjects.length || !currentRequestedOn || !currentAnsweredBy)
      return;

    const temp = selectableProjects.filter(
      (p) =>
        p.team.members.some((m) => m.uid === currentRequestedOn) &&
        p.team.members.some((m) => m.uid === currentAnsweredBy)
    );

    setProjectsWhereBothUsersAreMembers(temp);
  }, [selectableProjects, currentRequestedOn, currentAnsweredBy]);

  // if there is only one team in the selectable projects for the user, choose the first one as the default.
  React.useEffect(() => {
    if (!projectsWhereBothUsersAreMembers.length) return;

    if (projectsWhereBothUsersAreMembers.length === 1) {
      setValueForm("projectUid", projectsWhereBothUsersAreMembers[0].docId);
    }
  }, [projectsWhereBothUsersAreMembers, setValueForm]);

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

        await addDoc(collection(db, "feedbackRequests"), {
          createdAt: Timestamp.now(),
          completed: false,
          createdBy: currentUser.uid,
          ...data,
        });

        setShouldRefetchFeedbackRequests(new Date());

        onCloseDialog();

        toast({
          position: "top",
          title: "Successfully created feedback request!",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      } catch (error) {
        console.error(error);
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
    [toast, onCloseDialog, setShouldRefetchFeedbackRequests, currentUser]
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
                            <Select isDisabled>
                              <option value={currentUser.uid} selected>
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
                                setOfAllTeamMembers
                                  .filter((m) => m.uid !== currentAnsweredBy)
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
                                setOfAllTeamMembers
                                  .filter((m) => m.uid !== currentRequestedOn)
                                  .map((user) => (
                                    <option value={user.uid}>
                                      {`${user.displayName}${
                                        user.role === ROLES.MANAGER
                                          ? " (Manager)"
                                          : ""
                                      }`}
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
                  {currentRequestedOn && currentAnsweredBy && (
                    <Controller
                      control={control}
                      name="projectUid"
                      render={({ field, fieldState: { invalid, error } }) => {
                        return (
                          <FormControl isInvalid={invalid}>
                            <FormLabel
                              htmlFor={field.name}
                              fontSize="sm"
                              fontWeight="md"
                              color={colorModeForFromLabels}
                            >
                              Project (optional)
                            </FormLabel>
                            <Select
                              placeholder="Select a project"
                              onChange={field.onChange}
                              value={field.value}
                              defaultValue={field.value}
                            >
                              {React.Children.toArray(
                                projectsWhereBothUsersAreMembers.map((p) => (
                                  <option value={p.docId}>{p.name}</option>
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
