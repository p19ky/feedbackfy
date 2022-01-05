import React from "react";
import {
  Center,
  chakra,
  Flex,
  Skeleton,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase";

const MAP_CATEGORIES_TO_FEEDBACK_TITLE = Object.freeze({
  technicalSkills: "Technical Skills",
  softSkills: "Soft Skills",
  communicationSkills: "Communication Skills",
  teamwork: "Teamwork",
  other: "Other",
});

const FeedbacksSentCard = ({ feedback, isLast = false }) => {
  const [currentRequestedOn, setCurrentRequestedOn] = React.useState(null);
  const [currentProject, setCurrentProject] = React.useState(null);

  const containerFlexBg = useColorModeValue("#F9FAFB", "gray.600");
  const containerBoxBg = useColorModeValue("white", "gray.800");
  const subtleText = useColorModeValue("gray.600", "gray.400");

  // get current requestedOn
  React.useEffect(() => {
    if (!feedback) return;

    (async () => {
      try {
        const { requestedOn } = feedback;

        const requestedOnResponse = await getDoc(doc(db, "users", requestedOn));

        if (!requestedOnResponse.exists)
          throw new Error("requestedOn for current feedback does not exist");

        setCurrentRequestedOn({
          docId: requestedOnResponse.id,
          ...requestedOnResponse.data(),
        });
      } catch (error) {
        console.log(error);
      }
    })();
  }, [feedback]);

  // get current project
  React.useEffect(() => {
    if (!feedback) return;

    (async () => {
      try {
        const { projectUid } = feedback;

        if (!projectUid) return;

        const projectResponse = await getDoc(doc(db, "projects", projectUid));

        if (!projectResponse.exists)
          throw new Error(
            "project based on given uid for current feedback does not exist"
          );

        setCurrentProject({
          docId: projectResponse.id,
          ...projectResponse.data(),
        });
      } catch (error) {
        console.log(error);
      }
    })();
  }, [feedback]);

  return (
    <Flex
      bg={containerFlexBg}
      w="full"
      mb={isLast ? 0 : 10}
      alignItems="center"
      justifyContent="center"
    >
      {!currentRequestedOn ? (
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
            <chakra.span fontSize="sm" color={subtleText}>
              {`Feedbacked at ${new Date(
                feedback.createdAt.seconds * 1000
              ).getDate()}.${
                new Date(feedback.createdAt.seconds * 1000).getMonth() + 1
              }.${new Date(feedback.createdAt.seconds * 1000).getFullYear()}`}
            </chakra.span>
            {!!currentProject && (
              <chakra.span fontSize="md" fontWeight="bold">
                {`${currentProject.name}`}
              </chakra.span>
            )}
            <chakra.span fontSize="sm" color={subtleText}>
              {`Feedback on ${currentRequestedOn.displayName}`}
            </chakra.span>
          </Flex>

          <Table variant="sm">
            <CustomThead>
              <Tr>
                <Th>
                  <Center>Category</Center>
                </Th>
                <Th>
                  <Center>Rating</Center>
                </Th>
                <Th>
                  <Center>Details</Center>
                </Th>
              </Tr>
            </CustomThead>
            <Tbody display="block" overflowY="auto" maxH="400px">
              {React.Children.toArray(
                feedback.ratings.map((obj) => (
                  <CustomBodyTr>
                    <Td>
                      <Center>
                        <Text align="center">
                          {MAP_CATEGORIES_TO_FEEDBACK_TITLE[obj.category]}
                        </Text>
                      </Center>
                    </Td>
                    <Td>
                      <Center>
                        <Center>
                          <Text fontSize="lg" fontWeight="bold">
                            {obj.rating}
                          </Text>
                        </Center>
                      </Center>
                    </Td>
                    <Td>
                      <Center>
                        <Text>{obj.details}</Text>
                      </Center>
                    </Td>
                  </CustomBodyTr>
                ))
              )}
            </Tbody>
          </Table>
        </VStack>
      )}
    </Flex>
  );
};

const CustomBodyTr = React.forwardRef(({ children }, ref) => (
  <Tr ref={ref} display="table" w="100%" style={{ tableLayout: "fixed" }}>
    {children}
  </Tr>
));

const CustomThead = ({ children }) => (
  <Thead display="table" w="100%" style={{ tableLayout: "fixed" }}>
    {children}
  </Thead>
);

export default FeedbacksSentCard;
