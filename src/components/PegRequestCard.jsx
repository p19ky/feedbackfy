import React from "react";
import { useSelector } from "react-redux";
import { Button } from "@chakra-ui/button";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Image } from "@chakra-ui/image";
import {
  Badge,
  Divider,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
  Center,
} from "@chakra-ui/layout";
import { chakra } from "@chakra-ui/system";
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/modal";
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  onSnapshot,
  addDoc,
  Timestamp,
  updateDoc,
} from "@firebase/firestore";
import { Skeleton } from "@chakra-ui/skeleton";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Select,
  Textarea,
  Tooltip,
  useDisclosure,
  useToast,
  Box,
} from "@chakra-ui/react";
import { BsFillInfoCircleFill } from "react-icons/bs";

import { db } from "../firebase";
import { Controller, useForm } from "react-hook-form";
import {
  PEG_EVALUATION_RATING_TO_TEXTUAL_MEANING,
  PEG_EVALUATION_TYPE_TO_TITLE,
  ROLES,
} from "../utils/constants";
import { calculateOverallRating as calculateOverallRatingForPegEvaluations } from "./PegEvaluationCard";

const PegRequestCard = ({ pegRequest: pr, isLast = false }) => {
  const [readMore, setReadMore] = React.useState(false);
  const [currentPegEvaluation, setCurrentPegEvaluation] =
    React.useState(undefined);
  const [project, setProject] = React.useState(null);
  const [loadingEvaluate, setLoadingEvaluate] = React.useState(false);
  const [loadingExport, setLoadingExport] = React.useState(false);

  const {
    isOpen: isOpenEvaluate,
    onOpen: onOpenEvaluate,
    onClose: onCloseEvaluate,
  } = useDisclosure();
  const cancelEvaluateRef = React.useRef();
  const toast = useToast();

  const currentUser = useSelector((state) => state.user.value);

  const [pegEvaluationRatingComments, setPegEvaluationsRatingComments] =
    React.useState(
      Object.keys(PEG_EVALUATION_TYPE_TO_TITLE).reduce(
        (acc, cur) => ({ ...acc, [cur]: "" }),
        {}
      )
    );
  const {
    control,
    handleSubmit: handleSubmitEvaluate,
    clearErrors: clearEvaluateFormErrors,
    reset: resetEvaluateForm,
  } = useForm();

  const containerFlexBg = useColorModeValue("#F9FAFB", "gray.600");
  const containerBoxBg = useColorModeValue("white", "gray.800");
  const subtleText = useColorModeValue("gray.600", "gray.400");
  const titleColor = useColorModeValue("gray.700", "white");
  const creatorNameColor = useColorModeValue("gray.700", "gray.200");
  const colorModeForFromLabels = useColorModeValue("gray.700", "gray.50");

  const onCloseEvaluateMore = React.useCallback(() => {
    onCloseEvaluate();
    resetEvaluateForm();
    clearEvaluateFormErrors();
  }, [resetEvaluateForm, clearEvaluateFormErrors, onCloseEvaluate]);

  const createEvaluation = React.useCallback(
    async (data) => {
      try {
        setLoadingEvaluate(true);

        let newPegEvaluation = Object.entries(data).reduce(
          (acc, cur) => ({
            ...acc,
            [cur[0]]: {
              type: cur[0],
              rating: cur[1],
              comments: pegEvaluationRatingComments[cur[0]] || "-",
            },
          }),
          {}
        );

        newPegEvaluation = {
          ...newPegEvaluation,
          createdAt: Timestamp.now(),
          evaluatedBy: pr.evaluatorUid,
          requestedBy: pr.creatorUid,
          pegRequestId: pr.docId,
          projectId: pr.projectUid,
        };

        await addDoc(collection(db, "pegEvaluations"), newPegEvaluation);

        await updateDoc(doc(db, "pegRequests", pr.docId), {
          evaluated: true,
        });

        toast({
          position: "top",
          title: "Successfully created new peg evaluation! 😋",
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
        setLoadingEvaluate(false);
        onCloseEvaluateMore();
      }
    },
    [toast, pegEvaluationRatingComments, pr, onCloseEvaluateMore]
  );

  // Check if peg is evaluated.
  React.useEffect(() => {
    if (!pr) return;

    let unsubscribeIsEvaluated = () => {};

    (async () => {
      try {
        unsubscribeIsEvaluated = onSnapshot(
          query(
            collection(db, "pegEvaluations"),
            where("pegRequestId", "==", pr.docId)
          ),
          (querySnapshot) => {
            if (querySnapshot.empty) {
              setCurrentPegEvaluation(null);
            } else {
              const data = querySnapshot.docs[0].data();
              setCurrentPegEvaluation({
                docId: querySnapshot.docs[0].id,
                ...data,
              });
            }
          }
        );
      } catch (error) {
        console.error(error);
        setCurrentPegEvaluation(undefined);
      }
    })();

    return unsubscribeIsEvaluated;
  }, [pr]);

  // Get peg's complete project informations
  React.useEffect(() => {
    if (!pr) return;

    (async () => {
      let project = null;
      let projectCustomer = null;
      let projectTeam = null;
      let allMembers = null;
      let projectManager = null;
      let pegCreator = null;

      // get peg creator
      try {
        const responseCreator = await getDoc(doc(db, "users", pr.creatorUid));

        if (!responseCreator.exists)
          throw new Error("Project creator does not exist.");

        pegCreator = {
          docId: responseCreator.id,
          ...responseCreator.data(),
        };
      } catch (error) {
        console.error(
          `no project creator found for this peg request: ${pr.docId}`,
          error
        );
        return;
      }

      // get project
      try {
        const responseProject = await getDoc(
          doc(db, "projects", pr.projectUid)
        );

        if (!responseProject.exists) throw new Error("Project does not exist.");

        project = {
          docId: responseProject.id,
          ...responseProject.data(),
        };
      } catch (error) {
        console.error(
          `no project found for this peg request: ${pr.docId}`,
          error
        );
        return;
      }

      // get project customer
      try {
        const responseCustomer = await getDoc(
          doc(db, "customers", project.customerUid)
        );

        if (!responseCustomer.exists)
          throw new Error("Customer does not exist.");

        projectCustomer = {
          docId: responseCustomer.id,
          ...responseCustomer.data(),
        };
      } catch (error) {
        console.error(
          `no customer found for this project: ${pr.projectUid}, peg: ${pr.docId}`,
          error
        );
        return;
      }

      // get project team
      try {
        const responseTeam = await getDoc(doc(db, "teams", project.teamUid));

        if (!responseTeam.exists) throw new Error("Team does not exist.");

        projectTeam = {
          docId: responseTeam.id,
          ...responseTeam.data(),
        };
      } catch (error) {
        console.error(
          `no team found for this project: ${pr.projectUid}, peg: ${pr.docId}`,
          error
        );
        return;
      }

      // get project team members
      try {
        if (!projectTeam?.members?.length)
          throw new Error("No team members found.");

        const allPromises = [];

        projectTeam.members.forEach((memberUid) =>
          allPromises.push(getDoc(doc(db, "users", memberUid)))
        );

        const allMembersResponse = await Promise.all(allPromises);
        allMembers = allMembersResponse.map((e) => e?.data());
        allMembers.filter((e) => e);

        if (allMembers.length !== projectTeam.members.length)
          throw new Error("could not get every team member");
      } catch (error) {
        console.error(
          `error getting team members for this team: ${projectTeam.docId}, peg: ${pr.docId}`,
          error
        );
        return;
      }

      // find out who is the manager of the project (it is one of the team members)
      try {
        allMembers.some((m) => {
          if (m.role === "manager") {
            projectManager = m;
            return true;
          } else return false;
        });

        if (!projectManager) throw new Error("could not get project manager");
      } catch (error) {
        console.error(
          `error getting project manager from this team: ${projectTeam.docId}, peg: ${pr.docId}`,
          error
        );
        return;
      }

      const resultingProjectObject = {
        ...project,
        customer: projectCustomer,
        team: { ...projectTeam, members: allMembers },
        projectManager,
        pegCreator,
      };

      setProject(resultingProjectObject);
    })();
  }, [pr]);

  const exportToCsv = async () => {
    try {
      setLoadingExport(true);

      const {
        fiscalYear,
        numberOfProjectDaysEvaluated,
        projectUid,
        dateOfPeg,
      } = pr;
      const {
        pegCreator,
        customer,
        name: projectName,
        projectManager,
      } = project;

      const rows = [
        ["Peg Request Details", ...Array(3).fill("")],
        [...Array(4).fill("")],
        [...Array(4).fill("")],
        ["Fiscal Year", `${fiscalYear}`, ...Array(2).fill("")],
        ["Employee Name", `${pegCreator.displayName}`, ...Array(2).fill("")],
        ["Personnel Number", `${pegCreator.uid}`, ...Array(2).fill("")],
        [
          "Current career level",
          `${pegCreator.careerLevel}`,
          ...Array(2).fill(""),
        ],
        [
          "Organizational Assignment (SU)",
          `${pegCreator.SU}`,
          ...Array(2).fill(""),
        ],
        [
          "Date of PEG",
          `${new Date(dateOfPeg.seconds * 1000).toISOString().split("T")[0]}`,
          ...Array(2).fill(""),
        ],
        ["Project ID", `${projectUid}`, ...Array(2).fill("")],
        ["Customer name", `${customer.name}`, ...Array(2).fill("")],
        ["Name of the Project", `${projectName}`, ...Array(2).fill("")],
        [
          "Name of the Project Manager",
          `${projectManager.displayName}`,
          ...Array(2).fill(""),
        ],
        [
          "Name of the Evaluator",
          `${projectManager.displayName}`,
          ...Array(2).fill(""),
        ],
        [
          "Name of project days evaluated",
          `${numberOfProjectDaysEvaluated}`,
          ...Array(2).fill(""),
        ],
        [...Array(4).fill("")],
        [...Array(4).fill("")],
        ["Peg Evaluation Details", ...Array(3).fill("")],
        [...Array(4).fill("")],
        [...Array(4).fill("")],
        [
          "Criteria",
          "Rating",
          "Description of the rating",
          "Recommendations / Comments",
        ],
        [...Array(4).fill("")],
        [
          "Professional and Industry Experience",
          currentPegEvaluation.experience.rating,
          PEG_EVALUATION_RATING_TO_TEXTUAL_MEANING[
            currentPegEvaluation.experience.rating
          ],
          currentPegEvaluation.experience.comments,
        ],
        [
          "Project and Program Management",
          currentPegEvaluation.management.rating,
          PEG_EVALUATION_RATING_TO_TEXTUAL_MEANING[
            currentPegEvaluation.management.rating
          ],
          currentPegEvaluation.management.comments,
        ],
        [
          "Strategy Focus",
          currentPegEvaluation.strategyFocus.rating,
          PEG_EVALUATION_RATING_TO_TEXTUAL_MEANING[
            currentPegEvaluation.strategyFocus.rating
          ],
          currentPegEvaluation.strategyFocus.comments,
        ],
        [
          "Customer Focus",
          currentPegEvaluation.customerFocus.rating,
          PEG_EVALUATION_RATING_TO_TEXTUAL_MEANING[
            currentPegEvaluation.customerFocus.rating
          ],
          currentPegEvaluation.customerFocus.comments,
        ],
        [
          "Employee Focus",
          currentPegEvaluation.employeeFocus.rating,
          PEG_EVALUATION_RATING_TO_TEXTUAL_MEANING[
            currentPegEvaluation.employeeFocus.rating
          ],
          currentPegEvaluation.employeeFocus.comments,
        ],
        [
          "Focus on Excellence",
          currentPegEvaluation.excellenceFocus.rating,
          PEG_EVALUATION_RATING_TO_TEXTUAL_MEANING[
            currentPegEvaluation.excellenceFocus.rating
          ],
          currentPegEvaluation.excellenceFocus.comments,
        ],
        [
          "Overall Rating",
          calculateOverallRatingForPegEvaluations(currentPegEvaluation),
          ...Array(2).fill(""),
        ],
      ];

      let csvContent =
        "data:text/csv;charset=utf-8," +
        rows.map((e) => e.join(",")).join("\n");

      var encodedUri = encodeURI(csvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "PEG.csv");
      document.body.appendChild(link); // Required for FF

      link.click(); // This will download the data file named "PEG.csv".
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingExport(false);
    }
  };

  return (
    <Flex
      bg={containerFlexBg}
      w="full"
      mb={isLast ? 0 : 10}
      alignItems="center"
      justifyContent="center"
    >
      {!project ? (
        <Skeleton
          startColor="teal.50"
          endColor="green.900"
          height="250px"
          width="100%"
          rounded="lg"
        />
      ) : (
        <VStack
          spacing={4}
          alignItems={"stretch"}
          mx="auto"
          px={8}
          py={4}
          rounded="lg"
          shadow="lg"
          bg={containerBoxBg}
          w="100%"
        >
          {/* HEADER */}
          <Flex justifyContent="space-between" alignItems="center">
            <HStack>
              <chakra.span fontSize="sm" color={subtleText}>
                {`Created at ${new Date(
                  pr.dateOfPeg.seconds * 1000
                ).getDate()}.${
                  new Date(pr.dateOfPeg.seconds * 1000).getMonth() + 1
                }.${new Date(pr.dateOfPeg.seconds * 1000).getFullYear()} by ${
                  project.pegCreator.displayName
                }`}
              </chakra.span>
              <chakra.span>
                <Tooltip
                  label={
                    <Text align="center">{`Personnel Number: ${project.pegCreator.uid}`}</Text>
                  }
                >
                  <Center>
                    <Icon as={BsFillInfoCircleFill} />
                  </Center>
                </Tooltip>
              </chakra.span>
            </HStack>

            <HStack spacing={2}>
              <Badge>Peg Request</Badge>
              {currentPegEvaluation !== undefined && (
                <Badge colorScheme={!!currentPegEvaluation ? "green" : "red"}>
                  {!!currentPegEvaluation ? "Evaluated" : "Not Evaluated Yet"}
                </Badge>
              )}
            </HStack>
          </Flex>

          {/* BODY */}
          <VStack>
            <HStack spacing={2}>
              <Heading fontSize="4xl" color={titleColor} fontWeight="700">
                {project.name}
              </Heading>
              <Tooltip label={`Project ID: ${project.docId}`}>
                <Center>
                  <Icon as={BsFillInfoCircleFill} />
                </Center>
              </Tooltip>
            </HStack>

            <Divider />

            <chakra.p>{`Project for ${project.customer.name}`}</chakra.p>

            <chakra.p>
              {`Needs Evaluation from ${
                project.projectManager.uid === currentUser.uid
                  ? " You"
                  : project.projectManager.displayName
              }`}
            </chakra.p>

            <chakra.p>Fiscal Year: {pr.fiscalYear}</chakra.p>

            {readMore && (
              <>
                {project.team.members.length && (
                  <>
                    <Divider />
                    <Flex flexWrap="wrap">
                      {React.Children.toArray(
                        project.team.members.map((m) => (
                          <Flex alignItems="center">
                            <Image
                              mx={4}
                              w={10}
                              h={10}
                              rounded="full"
                              fit="cover"
                              display={{ base: "none", sm: "block" }}
                              src="https://external-preview.redd.it/fAFuBHWbVrt1_IQVRyLUVP1UCP2Yi2R-I2LzKC9ibo8.jpg?auto=webp&s=cd4e3eaf1926e236fb0082150d44b17b93a97b26"
                              alt="avatar"
                            />
                            <VStack spacing={0}>
                              <Text color={creatorNameColor} fontWeight="700">
                                {m.displayName}
                              </Text>
                              <Text color={creatorNameColor} fontWeight="300">
                                {m.role}
                              </Text>
                            </VStack>
                          </Flex>
                        ))
                      )}
                    </Flex>
                  </>
                )}
              </>
            )}
          </VStack>

          {/* FOOTER */}
          <Flex justifyContent="space-between" alignItems="center">
            <HStack spacing={2}>
              <Button onClick={() => setReadMore((current) => !current)}>
                {readMore ? "Read Less" : "Read More"}
              </Button>
              {currentUser.role === ROLES.MANAGER && (
                <HStack>
                  <Button
                    disabled={!!!currentPegEvaluation || loadingExport}
                    isLoading={loadingExport}
                    onClick={exportToCsv}
                  >
                    Export
                  </Button>
                  {!!!currentPegEvaluation && (
                    <Tooltip
                      label={
                        <Text align="center">
                          Only evaluated pegs can be exported!
                        </Text>
                      }
                    >
                      <Center>
                        <Icon as={BsFillInfoCircleFill} />
                      </Center>
                    </Tooltip>
                  )}
                </HStack>
              )}

              {!!!currentPegEvaluation && pr.evaluatorUid === currentUser.uid && (
                <>
                  <Button onClick={onOpenEvaluate}>Evaluate</Button>
                  <AlertDialog
                    isOpen={isOpenEvaluate}
                    leastDestructiveRef={cancelEvaluateRef}
                    onClose={onCloseEvaluateMore}
                  >
                    <AlertDialogOverlay>
                      <AlertDialogContent>
                        <AlertDialogHeader
                          fontSize="lg"
                          fontWeight="bold"
                          textAlign="center"
                        >
                          {`Evaluate ${project.name}`}
                        </AlertDialogHeader>

                        <AlertDialogBody>
                          {React.Children.toArray(
                            Object.entries(PEG_EVALUATION_TYPE_TO_TITLE).map(
                              (entry) => (
                                <Controller
                                  control={control}
                                  rules={{
                                    required: {
                                      value: true,
                                      message: `${entry[1]} is required.`,
                                    },
                                  }}
                                  name={entry[0]}
                                  render={({
                                    field,
                                    fieldState: { invalid, error },
                                  }) => {
                                    return (
                                      <Box mb={4}>
                                        <FormControl
                                          isInvalid={invalid}
                                          isRequired
                                        >
                                          <FormLabel
                                            htmlFor={field.name}
                                            fontSize="sm"
                                            fontWeight="md"
                                            color={colorModeForFromLabels}
                                          >
                                            {entry[1]}
                                          </FormLabel>
                                          <RatingSelect
                                            selectValue={field.value}
                                            selectOnChange={field.onChange}
                                          />

                                          <FormErrorMessage>
                                            {error?.message}
                                          </FormErrorMessage>
                                        </FormControl>
                                        <Textarea
                                          name={field.name}
                                          onChange={(e) =>
                                            setPegEvaluationsRatingComments(
                                              (current) => ({
                                                ...current,
                                                [e.target.name]: e.target.value,
                                              })
                                            )
                                          }
                                          mt={1}
                                          placeholder={`Comment on ${entry[1]}`}
                                        />
                                      </Box>
                                    );
                                  }}
                                />
                              )
                            )
                          )}
                        </AlertDialogBody>

                        <AlertDialogFooter justifyContent="center">
                          <Button
                            ref={cancelEvaluateRef}
                            onClick={onCloseEvaluateMore}
                            isDisabled={loadingEvaluate}
                            isLoading={loadingEvaluate}
                          >
                            Cancel
                          </Button>
                          <Button
                            colorScheme="blue"
                            onClick={handleSubmitEvaluate(createEvaluation)}
                            ml={3}
                            isDisabled={loadingEvaluate}
                            isLoading={loadingEvaluate}
                          >
                            Confirm Evaluation
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialogOverlay>
                  </AlertDialog>
                </>
              )}
            </HStack>
          </Flex>
        </VStack>
      )}
    </Flex>
  );
};

const RatingSelect = ({ selectValue, selectOnChange }) => (
  <Select
    value={selectValue}
    onChange={selectOnChange}
    placeholder="Select a Rating"
  >
    {React.Children.toArray(
      ["-", 1, 2, 3, 4].map((option) => (
        <option
          value={option}
        >{`${option} (${PEG_EVALUATION_RATING_TO_TEXTUAL_MEANING[option]})`}</option>
      ))
    )}
  </Select>
);

export default PegRequestCard;
