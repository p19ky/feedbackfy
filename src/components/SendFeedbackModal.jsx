import React from "react";
import { useSelector } from "react-redux";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from "@chakra-ui/modal";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Select,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Textarea,
  Tooltip,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import {
  addDoc,
  collection,
  doc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import emailjs from "emailjs-com";

import { db } from "../firebase";

const FEEDBACK_CATEGORIES = Object.freeze({
  "Technical Skills": "technicalSkills",
  "Soft Skills": "softSkills",
  "Communication Skills": "communicationSkills",
  Teamwork: "teamwork",
  Other: "other",
});

const SendFeedbackModal = ({
  isOpen,
  onClose,
  currentFeedbackRequest = null,
  allFeedbackRequests = [],
  setAllFeedbackRequests = () => {},
  requestedOn = null,
  answeredBy = null,
  isInNewFeedbackContext = false,
  selectableProjectsForCurrentUser = [],
  setOfAllTeamMembers = [],
  project = null,
}) => {
  const [anonym, setAnonym] = React.useState(false);
  const [usersThatICanSendFeedbackTo, setUsersThatICanSendFeedbackTo] =
    React.useState([]);
  const [currentRequestedOn, setCurrentRequestedOn] =
    React.useState(requestedOn);
  const [currentAnsweredBy, setCurrentAnsweredBy] = React.useState(answeredBy);

  // update requestedOn and answeredBy if any changes occur to them outside this component
  React.useEffect(() => setCurrentAnsweredBy(answeredBy), [answeredBy]);
  React.useEffect(() => setCurrentRequestedOn(requestedOn), [requestedOn]);

  const [loadingSendFeedback, setLoadingSendFeedback] = React.useState(false);
  const [feedbackDetails, setFeedbackDetails] = React.useState(
    Object.values(FEEDBACK_CATEGORIES).reduce(
      (acc, cur) => ({ ...acc, [cur]: "" }),
      {}
    )
  );
  const [feedbackSliders, setFeedbackSliders] = React.useState(
    Object.values(FEEDBACK_CATEGORIES).reduce(
      (acc, cur) => ({
        ...acc,
        [cur]: {
          showTooltip: false,
        },
      }),
      {}
    )
  );
  const cancelDialogRef = React.useRef();
  const toast = useToast();
  const {
    control: controlForm,
    handleSubmit: handleSubmitForm,
    clearErrors: clearFormErrors,
    reset: resetForm,
    setValue: setValueForm,
  } = useForm();

  const currentUser = useSelector((state) => state.user.value);
  const colorModeForFromLabels = useColorModeValue("gray.700", "gray.50");

  // set initial values for feedback rating sliders
  React.useEffect(() => {
    Object.values(FEEDBACK_CATEGORIES).forEach((v) => setValueForm(v, 1));
  }, [setValueForm]);

  // what to do when we close the SendFeedbackModal
  const onCloseSendFeedback = React.useCallback(() => {
    onClose();
    clearFormErrors();
    resetForm();
    Object.values(FEEDBACK_CATEGORIES).forEach((v) => setValueForm(v, 1));
    setAnonym(false);
  }, [onClose, clearFormErrors, resetForm, setValueForm]);

  // get complete information about every user in the setOfAllTeamMembers
  React.useEffect(() => {
    if (!setOfAllTeamMembers.length || !selectableProjectsForCurrentUser)
      return;

    try {
      const setOfTeamMembersWithDetails = new Set();
      selectableProjectsForCurrentUser.forEach((element) => {
        element.team.members.forEach((member) =>
          setOfTeamMembersWithDetails.add(member)
        );
      });

      setUsersThatICanSendFeedbackTo(
        Array.from(setOfTeamMembersWithDetails).filter(
          (u) => u.uid !== currentUser.uid
        )
      );
    } catch (error) {
      console.log(
        "error getting user information for every user from setOfAllTeamMembers",
        error
      );
    }
  }, [setOfAllTeamMembers, selectableProjectsForCurrentUser, currentUser]);

  // handler function for submiting new feedback form.
  const submitFeedbackForm = React.useCallback(
    async (data) => {
      try {
        setLoadingSendFeedback(true);

        // update 'completed'
        if (!isInNewFeedbackContext) {
          await updateDoc(
            doc(db, "feedbackRequests", currentFeedbackRequest.docId),
            {
              completed: true,
            }
          );
        }

        let result = {};

        if (!isInNewFeedbackContext) {
          result = {
            createdAt: Timestamp.now(),
            projectUid: project.docId || "",
            answeredBy: currentAnsweredBy.docId,
            requestedOn: currentRequestedOn.docId,
            ratings: [
              ...Object.entries(data).map(([k, v]) => ({
                category: k,
                rating: v,
                details: feedbackDetails[k],
              })),
            ],
          };
        } else {
          const { projectUid, feedbackOn, ...restData } = data;

          result = {
            createdAt: Timestamp.now(),
            anonym,
            projectUid: projectUid || "",
            answeredBy: currentUser.uid,
            requestedOn: currentRequestedOn?.docId || null,
            ratings: [
              ...Object.entries(restData).map(([k, v]) => ({
                category: k,
                rating: v,
                details: feedbackDetails[k],
              })),
            ],
          };
        }

        // console.log(result);

        await addDoc(collection(db, "feedbacks"), result);

        // update existing feedbacks list with current status
        if (!isInNewFeedbackContext) {
          const tempAllFeedbackRequests = [...allFeedbackRequests];
          const currentAnsweredFRIndex = tempAllFeedbackRequests.findIndex(
            (fr) => fr.docId === currentFeedbackRequest.docId
          );
          tempAllFeedbackRequests[currentAnsweredFRIndex].completed = true;
          setAllFeedbackRequests(tempAllFeedbackRequests);
        }

        // send email
        const emailData = {
          toName: currentRequestedOn.displayName,
          typeOfFeedback: isInNewFeedbackContext
            ? "Feedback"
            : "Feedback Request",
          emailTo: currentRequestedOn.email,
          fromName: anonym
            ? "Anonymous Feedbacker"
            : isInNewFeedbackContext
            ? currentUser.displayName
            : currentAnsweredBy.displayName,
        };

        // console.log(emailData);

        await emailjs.send(
          process.env.REACT_APP_EMAILJS_SERVICE_ID,
          process.env.REACT_APP_EMAILJS_TEMPLATE_ID_FEEDBACK,
          emailData,
          process.env.REACT_APP_EMAILJS_USER_ID
        );

        toast({
          position: "top",
          title: "Successfully sent new feedback! 😋",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      } catch (error) {
        console.log(error);
        const errorMessage = error.code.split("/")[1].replaceAll("-", " ");

        toast({
          position: "top",
          title: errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1),
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      } finally {
        setLoadingSendFeedback(false);
        onCloseSendFeedback();
      }
    },
    [
      toast,
      feedbackDetails,
      currentAnsweredBy,
      currentRequestedOn,
      onCloseSendFeedback,
      setAllFeedbackRequests,
      allFeedbackRequests,
      currentFeedbackRequest,
      isInNewFeedbackContext,
      anonym,
      currentUser,
      project,
    ]
  );

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelDialogRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold" textAlign="center">
            {`Send a new feedback ✨`}
          </AlertDialogHeader>

          <AlertDialogBody>
            {isInNewFeedbackContext && (
              <VStack mb={4} alignItems="flex-start" spacing={4}>
                <Checkbox
                  onChange={() => setAnonym((c) => !c)}
                  isChecked={anonym}
                >
                  Hide my name from response
                </Checkbox>
                <Controller
                  control={controlForm}
                  rules={{
                    required: {
                      value: true,
                      message:
                        "A user needs to be selected in order to be sent feedback to.",
                    },
                  }}
                  name="feedbackOn"
                  render={({ field, fieldState: { invalid, error } }) => {
                    return (
                      <FormControl isInvalid={invalid} isRequired>
                        <FormLabel
                          htmlFor={field.name}
                          fontSize="sm"
                          fontWeight="md"
                          color={colorModeForFromLabels}
                        >
                          Feedback on
                        </FormLabel>
                        <Select
                          placeholder="Select a user to send feedback to"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            const thisUser = usersThatICanSendFeedbackTo.find(
                              (u) => u.uid === e.target.value
                            );
                            setCurrentRequestedOn({
                              docId: e.target.value,
                              displayName: thisUser.displayName,
                              email: thisUser.email,
                            });
                          }}
                          value={field.value}
                        >
                          {React.Children.toArray(
                            usersThatICanSendFeedbackTo.map((member) => (
                              <option value={member.uid}>
                                {member.displayName}
                              </option>
                            ))
                          )}
                        </Select>
                        <FormErrorMessage>{error?.message}</FormErrorMessage>
                      </FormControl>
                    );
                  }}
                />
                <Controller
                  control={controlForm}
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
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                          value={field.value}
                        >
                          {React.Children.toArray(
                            selectableProjectsForCurrentUser.map((p) => (
                              <option value={p.docId}>{p.name}</option>
                            ))
                          )}
                        </Select>
                        <FormErrorMessage>{error?.message}</FormErrorMessage>
                      </FormControl>
                    );
                  }}
                />
              </VStack>
            )}
            {React.Children.toArray(
              Object.entries(FEEDBACK_CATEGORIES).map((category) => (
                <Controller
                  control={controlForm}
                  rules={{
                    required: {
                      value: true,
                      message: `${category[0]} is required.`,
                    },
                  }}
                  name={category[1]}
                  render={({ field, fieldState: { invalid, error } }) => {
                    return (
                      <Box mb={4}>
                        <FormControl isInvalid={invalid} isRequired>
                          <FormLabel
                            htmlFor={field.name}
                            fontSize="sm"
                            fontWeight="md"
                            color={colorModeForFromLabels}
                          >
                            {category[0]}
                          </FormLabel>
                          <Slider
                            name={field.name}
                            mb={6}
                            defaultValue={feedbackSliders[category[1]].value}
                            value={field.value}
                            step={1}
                            min={1}
                            max={5}
                            colorScheme="blue"
                            onChange={(v) => {
                              field.onChange(v);
                            }}
                            onMouseEnter={() =>
                              setFeedbackSliders((current) => ({
                                ...current,
                                [category[1]]: {
                                  showTooltip: true,
                                },
                              }))
                            }
                            onMouseLeave={() =>
                              setFeedbackSliders((current) => ({
                                ...current,
                                [category[1]]: {
                                  showTooltip: false,
                                },
                              }))
                            }
                          >
                            <SliderMark value={1} mt={2} ml={-1} fontSize="sm">
                              1
                            </SliderMark>
                            <SliderMark value={2} mt={2} ml={-1} fontSize="sm">
                              2
                            </SliderMark>
                            <SliderMark value={3} mt={2} ml={-1} fontSize="sm">
                              3
                            </SliderMark>
                            <SliderMark value={4} mt={2} ml={-1} fontSize="sm">
                              4
                            </SliderMark>
                            <SliderMark value={5} mt={2} ml={-1} fontSize="sm">
                              5
                            </SliderMark>
                            <SliderTrack>
                              <SliderFilledTrack />
                            </SliderTrack>
                            <Tooltip
                              hasArrow
                              bg="blue.500"
                              color="white"
                              placement="top"
                              isOpen={feedbackSliders[category[1]].showTooltip}
                              label={`${field.value}`}
                            >
                              <SliderThumb />
                            </Tooltip>
                          </Slider>

                          <FormErrorMessage>{error?.message}</FormErrorMessage>
                        </FormControl>
                        <Textarea
                          onChange={(e) =>
                            setFeedbackDetails((current) => ({
                              ...current,
                              [field.name]: e.target.value,
                            }))
                          }
                          mt={1}
                          placeholder={`How do you feel about '${category[0]}' for this person?`}
                        />
                      </Box>
                    );
                  }}
                />
              ))
            )}
          </AlertDialogBody>

          <AlertDialogFooter justifyContent="center">
            <Button
              ref={cancelDialogRef}
              onClick={onCloseSendFeedback}
              isDisabled={loadingSendFeedback}
              isLoading={loadingSendFeedback}
            >
              Cancel
            </Button>
            <Button
              ml={2}
              onClick={handleSubmitForm(submitFeedbackForm)}
              isDisabled={loadingSendFeedback}
              isLoading={loadingSendFeedback}
            >
              Submit
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default SendFeedbackModal;
