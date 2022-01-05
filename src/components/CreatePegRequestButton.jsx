import React from "react";
import { useSelector } from "react-redux";
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
  Timestamp,
  addDoc,
  updateDoc,
} from "@firebase/firestore";
import { Button } from "@chakra-ui/button";
import { Flex, Text, VStack } from "@chakra-ui/layout";
import { Input } from "@chakra-ui/react";
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
import emailjs from "emailjs-com";

import { db } from "../firebase";
import { PROJECT_DAYS_EVALUATED_VALUES, ROLES } from "../utils/constants";

const CreatePegRequestButton = () => {
  const [loadingNewPegRequest, setLoadingNewPegRequest] = React.useState(false);
  const [isOpenDialog, setIsOpenDialog] = React.useState(false);
  const [currentUserTeams, setCurrentUserTeams] = React.useState(undefined);
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [selectableProjects, setSelectableProjects] = React.useState([]);
  const [selectedProjectsCustomer, setSelectedProjectsCustomer] =
    React.useState(null);
  const [selectedProjectsTeam, setSelectedProjectsTeam] = React.useState([]);

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

  const getSelectableProjects = async () => {
    try {
      const q = query(
        collection(db, "projects"),
        where("currentlyInPegRequest", "==", false)
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
  };

  // get selectable projects
  React.useEffect(() => {
    if (!currentUser || !currentUserTeams?.length) return;

    getSelectableProjects();
  }, [currentUser, currentUserTeams]);

  // get customer for selectedProject
  React.useEffect(() => {
    if (!selectedProject) return;

    (async () => {
      try {
        const customer = await getDoc(
          doc(db, "customers", selectedProject.customerUid)
        );
        if (!customer.exists) setSelectedProjectsCustomer(null);
        else
          setSelectedProjectsCustomer({
            docId: customer.id,
            ...customer.data(),
          });
      } catch (error) {
        console.error("could not get proselectedProjectject's customer", error);
      }
    })();
  }, [selectedProject]);

  // get team for selectedProject
  React.useEffect(() => {
    if (!selectedProject) return;

    (async () => {
      try {
        const team = await getDoc(doc(db, "teams", selectedProject.teamUid));

        const teamMemberUids = team?.data()?.members || [];

        if (!teamMemberUids.length) return;

        const allPromises = [];
        teamMemberUids.forEach((id) =>
          allPromises.push(getDoc(doc(db, "users", id)))
        );

        const teamMembers = await Promise.all(allPromises);
        setSelectedProjectsTeam(
          teamMembers.map((m) => ({ docId: m.id, ...m.data() }))
        );
      } catch (error) {
        console.error("could not get selectedProject's team", error);
      }
    })();
  }, [selectedProject]);

  const onCloseDialog = React.useCallback(() => {
    setIsOpenDialog(false);
    clearFormErrors();
    resetForm();
    setSelectedProject(null);
  }, [clearFormErrors, resetForm]);

  const createNewPegRequest = React.useCallback(
    async ({ numberOfProjectDaysEvaluated, projectUid }) => {
      try {
        setLoadingNewPegRequest(true);

        if (!currentUser || !selectedProjectsTeam?.length) return;

        const creatorUid = currentUser.uid;
        const dateOfPeg = Timestamp.now();

        const manager = selectedProjectsTeam.find(
          (m) => m.role === ROLES.MANAGER
        );

        if (!manager) {
          console.log("No manager");
          return;
        }

        const evaluatorUid = manager.uid;
        const fiscalYear = currentUser.fiscalYear;

        await addDoc(collection(db, "pegRequests"), {
          creatorUid,
          dateOfPeg,
          evaluatorUid,
          fiscalYear,
          numberOfProjectDaysEvaluated,
          projectUid,
          evaluated: false,
        });

        setIsOpenDialog(false);

        await updateDoc(doc(db, "projects", projectUid), {
          currentlyInPegRequest: true,
        });

        await getSelectableProjects();

        await emailjs.send(
          process.env.REACT_APP_EMAILJS_SERVICE_ID,
          process.env.REACT_APP_EMAILJS_TEMPLATE_ID_PEG_REQUEST,
          {
            projectName: selectedProject.name,
            employeeName: currentUser.displayName,
            customerName: selectedProjectsCustomer?.name,
            evaluatorName: selectedProjectsTeam.find(
              (m) => m.role === ROLES.MANAGER
            )?.displayName,
            emailTo: selectedProjectsTeam.find((m) => m.role === ROLES.MANAGER)
              ?.email,
          },
          process.env.REACT_APP_EMAILJS_USER_ID
        );

        toast({
          position: "top",
          title: "Successfully created new peg request! 😋",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      } catch (error) {
        console.log(error);
        const errorMessage = error.code?.split("/")[1].replaceAll("-", " ");

        toast({
          position: "top",
          title: errorMessage?.charAt(0).toUpperCase() + errorMessage?.slice(1),
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      } finally {
        setLoadingNewPegRequest(false);
        onCloseDialog();
      }
    },
    [
      toast,
      currentUser,
      selectedProjectsTeam,
      onCloseDialog,
      selectedProject,
      selectedProjectsCustomer,
    ]
  );

  return (
    <Flex>
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
          <Button
            isDisabled={loadingNewPegRequest}
            isLoading={loadingNewPegRequest}
            onClick={() => setIsOpenDialog(true)}
          >
            New Peg Request
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
                      name="projectUid"
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
                                setSelectedProject(
                                  selectableProjects.find(
                                    (p) => p.docId === e.target.value
                                  )
                                );
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
                  {!!selectedProject && (
                    <VStack mt={2} spacing={2}>
                      <Controller
                        control={control}
                        rules={{
                          required: {
                            value: true,
                            message:
                              "Number of project days evaluated is required",
                          },
                        }}
                        name="numberOfProjectDaysEvaluated"
                        render={({ field, fieldState: { invalid, error } }) => {
                          return (
                            <FormControl isInvalid={invalid} isRequired>
                              <FormLabel
                                htmlFor={field.name}
                                fontSize="sm"
                                fontWeight="md"
                                color={colorModeForFromLabels}
                              >
                                Number of project days evaluated
                              </FormLabel>
                              <Select
                                placeholder="Select a range of days"
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                }}
                                value={field.value}
                              >
                                {React.Children.toArray(
                                  PROJECT_DAYS_EVALUATED_VALUES.map(
                                    (option) => (
                                      <option value={option}>{option}</option>
                                    )
                                  )
                                )}
                              </Select>
                              <FormErrorMessage>
                                {error?.message}
                              </FormErrorMessage>
                            </FormControl>
                          );
                        }}
                      />
                      <FormControl>
                        <FormLabel
                          htmlFor={"fiscalYear"}
                          fontSize="sm"
                          fontWeight="md"
                          color={colorModeForFromLabels}
                        >
                          Fiscal Year
                        </FormLabel>
                        <Input
                          isDisabled
                          type="text"
                          name={"fiscalYear"}
                          value={currentUser.fiscalYear}
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="sm"
                          w="full"
                          rounded="md"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel
                          htmlFor={"employeeName"}
                          fontSize="sm"
                          fontWeight="md"
                          color={colorModeForFromLabels}
                        >
                          Employee Name
                        </FormLabel>
                        <Input
                          isDisabled
                          type="text"
                          name={"employeeName"}
                          value={currentUser.displayName}
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="sm"
                          w="full"
                          rounded="md"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel
                          htmlFor={"personnelNumber"}
                          fontSize="sm"
                          fontWeight="md"
                          color={colorModeForFromLabels}
                        >
                          Personnel Number
                        </FormLabel>
                        <Input
                          isDisabled
                          type="text"
                          name={"personnelNumber"}
                          value={currentUser.uid}
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="sm"
                          w="full"
                          rounded="md"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel
                          htmlFor={"currentCareerLevel"}
                          fontSize="sm"
                          fontWeight="md"
                          color={colorModeForFromLabels}
                        >
                          Current Career Level
                        </FormLabel>
                        <Input
                          isDisabled
                          type="text"
                          name={"currentCareerLevel"}
                          value={currentUser.careerLevel}
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="sm"
                          w="full"
                          rounded="md"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel
                          htmlFor={"SU"}
                          fontSize="sm"
                          fontWeight="md"
                          color={colorModeForFromLabels}
                        >
                          Organizational assignment (SU)
                        </FormLabel>
                        <Input
                          isDisabled
                          type="text"
                          name={"SU"}
                          value={currentUser.SU}
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="sm"
                          w="full"
                          rounded="md"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel
                          htmlFor={"dateOfPEG"}
                          fontSize="sm"
                          fontWeight="md"
                          color={colorModeForFromLabels}
                        >
                          Date of PEG
                        </FormLabel>
                        <Input
                          isDisabled
                          type="text"
                          name={"dateOfPEG"}
                          value={new Date().toISOString().split("T")[0]}
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="sm"
                          w="full"
                          rounded="md"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel
                          htmlFor={"projectID"}
                          fontSize="sm"
                          fontWeight="md"
                          color={colorModeForFromLabels}
                        >
                          Project ID
                        </FormLabel>
                        <Input
                          isDisabled
                          type="text"
                          name={"projectID"}
                          value={selectedProject.docId}
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="sm"
                          w="full"
                          rounded="md"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel
                          htmlFor={"customerName"}
                          fontSize="sm"
                          fontWeight="md"
                          color={colorModeForFromLabels}
                        >
                          Customer Name
                        </FormLabel>
                        <Input
                          isDisabled
                          type="text"
                          name={"customerName"}
                          value={selectedProjectsCustomer?.name || ""}
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="sm"
                          w="full"
                          rounded="md"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel
                          htmlFor={"nameOfTheProjectManager"}
                          fontSize="sm"
                          fontWeight="md"
                          color={colorModeForFromLabels}
                        >
                          Name of the Project Manager
                        </FormLabel>
                        <Input
                          isDisabled
                          type="text"
                          name={"nameOfTheProjectManager"}
                          value={
                            selectedProjectsTeam.find(
                              (m) => m.role === ROLES.MANAGER
                            )?.displayName
                          }
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="sm"
                          w="full"
                          rounded="md"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel
                          htmlFor={"nameOfTheEvaluator"}
                          fontSize="sm"
                          fontWeight="md"
                          color={colorModeForFromLabels}
                        >
                          Name of the Evaluator
                        </FormLabel>
                        <Input
                          isDisabled
                          type="text"
                          name={"nameOfTheEvaluator"}
                          value={
                            selectedProjectsTeam.find(
                              (m) => m.role === ROLES.MANAGER
                            )?.displayName
                          }
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="sm"
                          w="full"
                          rounded="md"
                        />
                      </FormControl>
                    </VStack>
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
                      ml={4}
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
