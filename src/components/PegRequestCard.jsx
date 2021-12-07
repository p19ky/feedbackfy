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
} from "@chakra-ui/layout";
import { chakra } from "@chakra-ui/system";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "@firebase/firestore";
import { db } from "../firebase";
import { Skeleton } from "@chakra-ui/skeleton";

const PegRequestCard = ({ pegRequest: pr, isLast = false }) => {
  const [readMore, setReadMore] = React.useState(false);
  const [isEvaluated, setIsEvaluated] = React.useState(null);
  const [project, setProject] = React.useState(null);

  const currentUser = useSelector((state) => state.user.value);

  const containerFlexBg = useColorModeValue("#F9FAFB", "gray.600");
  const containerBoxBg = useColorModeValue("white", "gray.800");
  const subtleText = useColorModeValue("gray.600", "gray.400");
  const titleColor = useColorModeValue("gray.700", "white");
  const creatorNameColor = useColorModeValue("gray.700", "gray.200");

  // Check if peg is evaluated.
  React.useEffect(() => {
    if (!pr) return;

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
      console.log(resultingProjectObject);
    })();
  }, [pr]);

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
            <chakra.span fontSize="sm" color={subtleText}>
              {`Created at ${new Date(
                pr.dateOfPeg.seconds * 1000
              ).getDate()}.${new Date(
                pr.dateOfPeg.seconds * 1000
              ).getMonth()}.${new Date(
                pr.dateOfPeg.seconds * 1000
              ).getFullYear()} by ${project.pegCreator.displayName}`}
            </chakra.span>
            <HStack spacing={2}>
              <Badge>Peg Request</Badge>
              {isEvaluated !== null && (
                <Badge colorScheme={isEvaluated ? "green" : "red"}>
                  {isEvaluated ? "Evaluated" : "Not Evaluated Yet"}
                </Badge>
              )}
            </HStack>
          </Flex>

          {/* BODY */}
          <VStack>
            <Heading fontSize="4xl" color={titleColor} fontWeight="700">
              {`${project.name}`}
            </Heading>

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

            <chakra.p>Personnel Number: {project.team.members.length}</chakra.p>

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
                            <Text color={creatorNameColor} fontWeight="700">
                              {m.displayName}
                            </Text>
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

              {!isEvaluated && pr.evaluatorUid === currentUser.uid && (
                <Button>Evaluate</Button>
              )}
            </HStack>
          </Flex>
        </VStack>
      )}
    </Flex>
  );
};

export default PegRequestCard;
