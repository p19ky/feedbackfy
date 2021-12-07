import React from "react";
import { useSelector } from "react-redux";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "@firebase/firestore";
import { Button } from "@chakra-ui/button";
import { Flex, Text } from "@chakra-ui/layout";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from "@chakra-ui/modal";
import { Alert, AlertIcon } from "@chakra-ui/alert";
import { Select } from "@chakra-ui/select";
import { Controller, useForm } from "react-hook-form";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { useToast } from "@chakra-ui/toast";

import { db } from "../firebase";

const CreatePegRequestButton = () => {
  const [loadingNewPegRequest, setLoadingNewPegRequest] = React.useState(false);
  const [isOpenDialog, setIsOpenDialog] = React.useState(false);
  const [currentUserTeams, setCurrentUserTeams] = React.useState(undefined);
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [selectableProjects, setSelectableProjects] = React.useState(undefined);

  const cancelDialogRef = React.useRef();

  const currentUser = useSelector((state) => state.user.value);
  const toast = useToast();
  const colorModeForFromLabels = useColorModeValue("gray.700", "gray.50");

  const {
    control,
    handleSubmit,
    clearErrors: clearFormErrors,
    reset: resetForm,
  } = useForm();

  // Check if current user is part of one or more teams.
  React.useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const q = query(
          collection(db, "teams"),
          where("members", "array-contains", currentUser.uid)
        );

        const response = await getDocs(q);

        if (response.empty) {
          setCurrentUserTeams([]);
        } else {
          const teams = response.docs.map((doc) => doc.id);
          setCurrentUserTeams(teams);
        }
      } catch (error) {
        console.error(
          "could not check if current user is part of a team",
          error
        );
      }
    })();
  }, [currentUser]);

  // get selectable projects
  React.useEffect(() => {
    if (!currentUser || !currentUserTeams?.length) return;

    (async () => {
      try {
        const q = query(
          collection(db, "projects"),
          where("pegRequested", "==", false)
        );
        const response = await getDocs(q);

        if (response.empty) {
          setSelectableProjects([]);
        } else {
          setSelectableProjects(
            response.docs.map((doc) => ({ docId: doc.id, ...doc.data() }))
          );
        }
      } catch (error) {
        console.error("could not get projects", error);
      }
    })();
  }, [currentUser, currentUserTeams]);

  const onCloseDialog = () => {
    setIsOpenDialog(false);
    clearFormErrors();
    resetForm();
  };

  const createNewPegRequest = React.useCallback(
    async (data) => {
      try {
        console.log(data);
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

  React.useEffect(() => {
    console.log(selectedProject);
  }, [selectedProject]);

  return (
    <Flex mb={4}>
      {currentUserTeams !== undefined && currentUserTeams.length === 0 ? (
        <Alert
          p={2}
          status="warning"
          width="fit-content"
          rounded={"md"}
          variant="left-accent"
        >
          <AlertIcon />
          <Text fontSize="sm">
            You can't create a new peg request because you are not a member of a
            team.
          </Text>
        </Alert>
      ) : (
        <>
          <Button onClick={() => setIsOpenDialog(true)}>New Peg Request</Button>
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
                  {`Create a new peg request here!`}
                </AlertDialogHeader>

                <AlertDialogBody>
                  {selectableProjects?.length ? (
                    <Controller
                      control={control}
                      rules={{
                        required: {
                          value: true,
                          message:
                            "Peg requests require a project to be associated with",
                        },
                      }}
                      name="project"
                      render={({ field, fieldState: { invalid, error } }) => {
                        return (
                          <FormControl isInvalid={invalid} isRequired>
                            <FormLabel
                              htmlFor={field.name}
                              fontSize="sm"
                              fontWeight="md"
                              color={colorModeForFromLabels}
                            >
                              Project Name
                            </FormLabel>
                            <Select
                              placeholder="Select a project"
                              onChange={(e) => {
                                setSelectedProject(e.target.value);
                                field.onChange(e.target.value);
                              }}
                              value={field.value}
                            >
                              {React.Children.toArray(
                                selectableProjects.map((p) => (
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
                    ></Controller>
                  ) : (
                    <Alert
                      p={2}
                      status="warning"
                      width="fit-content"
                      rounded={"md"}
                      variant="left-accent"
                    >
                      <AlertIcon />
                      <Text fontSize="sm">
                        There are no projects (that you are involved in) that
                        are not yet peg requested.
                      </Text>
                    </Alert>
                  )}
                </AlertDialogBody>

                <AlertDialogFooter justifyContent="center">
                  <Button
                    ref={cancelDialogRef}
                    onClick={onCloseDialog}
                    isDisabled={loadingNewPegRequest}
                    isLoading={loadingNewPegRequest}
                  >
                    Cancel
                  </Button>
                  {!!selectableProjects?.length && (
                    <Button
                      colorScheme="blue"
                      onClick={handleSubmit(createNewPegRequest)}
                      ml={3}
                      isDisabled={loadingNewPegRequest}
                      isLoading={loadingNewPegRequest}
                    >
                      Create
                    </Button>
                  )}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </>
      )}
    </Flex>
  );
};

export default CreatePegRequestButton;
