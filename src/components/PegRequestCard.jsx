import React from "react";
import { Button } from "@chakra-ui/button";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Image } from "@chakra-ui/image";
import {
  Badge,
  Box,
  Divider,
  Flex,
  Heading,
  HStack,
  Spacer,
  Text,
} from "@chakra-ui/layout";
import { chakra } from "@chakra-ui/system";
import { collection, getDocs, query, where } from "@firebase/firestore";
import { db } from "../firebase";

const PegRequestCard = ({ pr }) => {
  const [readMore, setReadMore] = React.useState(false);
  const [isEvaluated, setIsEvaluated] = React.useState(null);

  const containerFlexBg = useColorModeValue("#F9FAFB", "gray.600");
  const containerBoxBg = useColorModeValue("white", "gray.800");
  const dateColor = useColorModeValue("gray.600", "gray.400");
  const titleColor = useColorModeValue("gray.700", "white");
  const creatorNameColor = useColorModeValue("gray.700", "gray.200");

  React.useEffect(() => {
    (async () => {
      try {
        const response = await getDocs(
          query(
            collection(db, "pegEvaluations"),
            where("pegRequestId", "==", pr.docId)
          )
        );

        if (response.empty) {
          setIsEvaluated(false);
        } else {
          setIsEvaluated(true);
        }
      } catch (error) {
        console.error(error);
        setIsEvaluated(null);
      }
    })();
  }, [pr.docId]);

  return (
    <Flex
      bg={containerFlexBg}
      p={50}
      w="full"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        mx="auto"
        px={8}
        py={4}
        rounded="lg"
        shadow="lg"
        bg={containerBoxBg}
        w="100%"
      >
        <Flex justifyContent="space-between" alignItems="center">
          <chakra.span fontSize="sm" color={dateColor}>
            {`Created at ${new Date(
              pr.dateOfPeg.seconds * 1000
            ).getDate()}.${new Date(
              pr.dateOfPeg.seconds * 1000
            ).getMonth()}.${new Date(
              pr.dateOfPeg.seconds * 1000
            ).getFullYear()}`}
          </chakra.span>
          <Spacer />
          <HStack spacing={2}>
            <Badge>Peg Request</Badge>
            {isEvaluated !== null && (
              <Badge colorScheme={isEvaluated ? "green" : "red"}>
                {isEvaluated ? "Evaluated" : "Not Evaluated Yet"}
              </Badge>
            )}
          </HStack>
        </Flex>

        <Box mt={4}>
          <Heading fontSize="2xl" color={titleColor} fontWeight="700" mb={2}>
            {`${pr.projectName} - ${pr.customerName}`}
          </Heading>
          <Divider />
          <chakra.p mt={2}>Project name: {pr.projectName}</chakra.p>
          <chakra.p mt={2}>Evaluation by: {pr.projectManager}</chakra.p>
          <chakra.p mt={2}>Status: {pr.status}</chakra.p>

          {readMore && (
            <>
              <chakra.p mt={2}>test</chakra.p>
              <chakra.p mt={2}>test</chakra.p>
              <chakra.p mt={2}>test</chakra.p>
              <chakra.p mt={2}>test</chakra.p>
            </>
          )}
        </Box>

        <Flex justifyContent="space-between" alignItems="center" mt={4}>
          <HStack spacing={2}>
            <Button onClick={() => setReadMore((current) => !current)}>
              {readMore ? "Read Less" : "Read More"}
            </Button>

            <Button>Evaluate</Button>
          </HStack>

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
            <Text color={creatorNameColor} fontWeight="700">
              {pr.employeeName}
            </Text>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
};

export default PegRequestCard;
