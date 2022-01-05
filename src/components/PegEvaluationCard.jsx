import React from "react";
import { Flex, Text, VStack, Center } from "@chakra-ui/layout";
import { useColorModeValue } from "@chakra-ui/color-mode";
import {
  chakra,
  Skeleton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";
import { useSelector } from "react-redux";

import { db } from "../firebase";
import { isObject } from "../utils/helpers";
import {
  PEG_EVALUATION_RATING_TO_TEXTUAL_MEANING,
  PEG_EVALUATION_TYPE_TO_TITLE,
} from "../utils/constants";

export const calculateOverallRating = (pegEvaluation) => {
  const { result, count } = Object.values(pegEvaluation).reduce(
    (acc, cur) =>
      isObject(cur) && !isNaN(cur.rating)
        ? { result: acc.result + parseInt(cur.rating), count: acc.count + 1 }
        : acc,
    { result: 0, count: 0 }
  );

  return (result / count).toFixed(2);
};

const PegEvaluationCard = ({ pegEvaluation: pe, isLast = false }) => {
  const [evaluatedByPerson, setEvaluatedByPerson] = React.useState(null);
  const [requestedByPerson, setRequestedByPerson] = React.useState(null);
  const [currentProject, setCurrentProject] = React.useState(null);

  const currentUser = useSelector((state) => state.user.value);

  const containerFlexBg = useColorModeValue("#F9FAFB", "gray.600");
  const containerBoxBg = useColorModeValue("white", "gray.800");
  const subtleText = useColorModeValue("gray.600", "gray.400");

  // get evaluatedByPerson and requestedByPerson
  React.useEffect(() => {
    if (!pe) return;

    (async () => {
      const { evaluatedBy: evaluatedByUid, requestedBy: requestedByUid } = pe;

      try {
        const evaluatedByResponse = await getDoc(
          doc(db, "users", evaluatedByUid)
        );
        const requestedByResponse = await getDoc(
          doc(db, "users", requestedByUid)
        );

        if (!evaluatedByResponse.exists) {
          throw new Error("Given evaluatedBy does not exist as a user");
        }

        if (!requestedByResponse.exists) {
          throw new Error("Given requestedBy does not exist as a user");
        }

        const evaluatedBy = {
          docId: evaluatedByResponse.id,
          ...evaluatedByResponse.data(),
        };
        const requestedBy = {
          docId: requestedByResponse.id,
          ...requestedByResponse.data(),
        };

        setEvaluatedByPerson(evaluatedBy);
        setRequestedByPerson(requestedBy);
      } catch (error) {
        console.error("Couldn't get evaluatedBy and/or requestedBy", error);
      }
    })();
  }, [pe]);

  // get project of current peg evaluation
  React.useEffect(() => {
    if (!pe) return;

    (async () => {
      const { projectId } = pe;

      try {
        const projectReponse = await getDoc(doc(db, "projects", projectId));

        if (!projectReponse.exists) {
          throw new Error("Given projectId does not exist for a project.");
        }

        const tempCurrentProject = {
          docId: projectReponse.id,
          ...projectReponse.data(),
        };

        setCurrentProject(tempCurrentProject);
      } catch (error) {
        console.error("Couldn't get current project.", error);
      }
    })();
  }, [pe]);

  return (
    <Flex
      bg={containerFlexBg}
      w="full"
      mb={isLast ? 0 : 10}
      alignItems="center"
      justifyContent="center"
    >
      {!evaluatedByPerson || !requestedByPerson || !currentProject ? (
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
              {`Evaluated at ${new Date(
                pe.createdAt.seconds * 1000
              ).getDate()}.${
                new Date(pe.createdAt.seconds * 1000).getMonth() + 1
              }.${new Date(pe.createdAt.seconds * 1000).getFullYear()} by ${
                currentUser.uid === evaluatedByPerson.uid
                  ? "You"
                  : evaluatedByPerson.displayName
              }`}
            </chakra.span>
            <chakra.span fontSize="lg" fontWeight="bold">
              {currentProject?.name}
            </chakra.span>
            <chakra.span fontSize="sm" color={subtleText}>
              {`Peg Request created by ${
                currentUser.uid === requestedByPerson.uid
                  ? "You"
                  : requestedByPerson.displayName
              }`}
            </chakra.span>
          </Flex>

          <Table variant="sm">
            <CustomThead>
              <Tr>
                <Th>
                  <Center>Criteria</Center>
                </Th>
                <Th>
                  <Center>Rating</Center>
                </Th>
                <Th>
                  <Center>Description</Center>
                </Th>
                <Th>
                  <Center>Comments</Center>
                </Th>
              </Tr>
            </CustomThead>
            <Tbody display="block" overflowY="auto" maxH="400px">
              {React.Children.toArray(
                Object.values(pe).map((obj) =>
                  isObject(obj) ? (
                    <CustomBodyTr>
                      <Td>
                        <Center>
                          <Text align="center">
                            {PEG_EVALUATION_TYPE_TO_TITLE[obj.type]}
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
                          <Text>
                            {
                              PEG_EVALUATION_RATING_TO_TEXTUAL_MEANING[
                                obj.rating
                              ]
                            }
                          </Text>
                        </Center>
                      </Td>
                      <Td>
                        <Center>
                          <Text>{obj.comments}</Text>
                        </Center>
                      </Td>
                    </CustomBodyTr>
                  ) : null
                )
              )}
              <CustomBodyTr>
                <Td>
                  <Center>
                    <Text align="center">Overall Rating</Text>
                  </Center>
                </Td>
                <Td>
                  <Center>
                    <Text align="center" fontSize="lg" fontWeight="bold">
                      {calculateOverallRating(pe)}
                    </Text>
                  </Center>
                </Td>
                <Td>
                  <Center>-</Center>
                </Td>
                <Td>
                  <Center>-</Center>
                </Td>
              </CustomBodyTr>
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

export default PegEvaluationCard;
