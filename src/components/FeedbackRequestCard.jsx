import React from "react";
import { useSelector } from "react-redux";
import { Flex, VStack, HStack } from "@chakra-ui/layout";
import {
  useColorModeValue,
  Text,
  Skeleton,
  Badge,
  Button,
  useDisclosure,
  chakra,
} from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase";
import SendFeedbackModal from "./SendFeedbackModal";

const FeedbackRequestCard = ({
  feedbackRequest: fr,
  isLast = false,
  allFeedbackRequests = [],
  setAllFeedbackRequests = () => {},
}) => {
  const [requestedOn, setRequestedOn] = React.useState(null);
  const [answeredBy, setAnsweredBy] = React.useState(null);
  const [currentFRProject, setCurrentFRProject] = React.useState(null);

  const currentUser = useSelector((state) => state.user.value);
  const {
    isOpen: isOpenSendFeedbackModal,
    onOpen: onOpenSendFeedbackModal,
    onClose: onCloseSendFeedbackModal,
  } = useDisclosure();

  const containerFlexBg = useColorModeValue("#F9FAFB", "gray.600");
  const containerBoxBg = useColorModeValue("white", "gray.800");
  const subtleText = useColorModeValue("gray.600", "gray.400");

  React.useEffect(() => {
    if (!fr) return;

    (async () => {
      const { requestedOn: requestedOnUid, answeredBy: answeredByUid } = fr;

      try {
        const requestedOnResponse = await getDoc(
          doc(db, "users", requestedOnUid)
        );
        const answeredByResponse = await getDoc(
          doc(db, "users", answeredByUid)
        );

        if (!requestedOnResponse.exists) {
          throw new Error("Given requestedOn does not exist as a user");
        }

        if (!answeredByResponse.exists) {
          throw new Error("Given answeredBy does not exist as a user");
        }

        const currentRequestedOn = {
          docId: requestedOnResponse.id,
          ...requestedOnResponse.data(),
        };
        const currentAnsweredBy = {
          docId: answeredByResponse.id,
          ...answeredByResponse.data(),
        };

        setRequestedOn(currentRequestedOn);
        setAnsweredBy(currentAnsweredBy);
      } catch (error) {
        console.error("Couldn't get requestedOn and/or answeredBy", error);
      }
    })();
  }, [fr]);

  // get project for feedback request if there is one.
  React.useEffect(() => {
    if (!fr?.projectUid) return;

    (async () => {
      const projectResponse = await getDoc(doc(db, "projects", fr.projectUid));

      if (!projectResponse.exists) return;

      setCurrentFRProject({
        docId: projectResponse.id,
        ...projectResponse.data(),
      });
    })();
  }, [fr]);

  return (
    <Flex
      bg={containerFlexBg}
      w="full"
      mb={isLast ? 0 : 10}
      alignItems="center"
      justifyContent="center"
    >
      {!answeredBy || !requestedOn ? (
        <Skeleton
          startColor="teal.50"
          endColor="green.900"
          height="100px"
          width="50%"
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
          w="50%"
        >
          <Flex justifyContent="space-between" alignItems="center">
            <chakra.span
              fontSize="sm"
              color={subtleText}
            >{`Created at ${new Date(fr.createdAt.seconds * 1000).getDate()}.${
              new Date(fr.createdAt.seconds * 1000).getMonth() + 1
            }.${new Date(
              fr.createdAt.seconds * 1000
            ).getFullYear()}`}</chakra.span>
            <Text fontWeight="bold">{currentFRProject?.name}</Text>
            <Badge colorScheme={fr.completed ? "green" : "red"}>
              {fr.completed ? "Answered" : "Not Answered Yet"}
            </Badge>
          </Flex>
          <Text>{`There is a feedback request on ${
            currentUser.uid === requestedOn.uid
              ? "you"
              : requestedOn.displayName
          } that needs to be answered by ${
            answeredBy.uid === currentUser.uid ? "you" : answeredBy.displayName
          }.`}</Text>
          {answeredBy.uid === currentUser.uid && !fr.completed && (
            <HStack justify={"center"}>
              <Button onClick={onOpenSendFeedbackModal}>Answer</Button>
              <SendFeedbackModal
                project={currentFRProject}
                requestedOn={requestedOn}
                answeredBy={answeredBy}
                currentFeedbackRequest={fr}
                isOpen={isOpenSendFeedbackModal}
                onClose={onCloseSendFeedbackModal}
                allFeedbackRequests={allFeedbackRequests}
                setAllFeedbackRequests={setAllFeedbackRequests}
              />
            </HStack>
          )}
        </VStack>
      )}
    </Flex>
  );
};

export default FeedbackRequestCard;
