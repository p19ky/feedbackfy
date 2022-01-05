import React from "react";
import { Button } from "@chakra-ui/button";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from "@chakra-ui/modal";
import { Alert, AlertIcon } from "@chakra-ui/alert";
import { Flex, Heading, Text, VStack } from "@chakra-ui/layout";
import { Image } from "@chakra-ui/image";
import { useColorModeValue } from "@chakra-ui/color-mode";

const ShowMyTeamsFeedback = ({ myTeams }) => {
  const [isOpenDialog, setIsOpenDialog] = React.useState(false);

  const cancelDialogRef = React.useRef();

  const teamMemberNameColor = useColorModeValue("gray.700", "gray.200");

  const onCloseDialog = () => setIsOpenDialog(false);

  return (
    <>
      <Button onClick={() => setIsOpenDialog(true)}>Show My Teams</Button>
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
              {`Teams you are part of 👇`}
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
                <VStack spacing={8}>
                  {React.Children.toArray(
                    myTeams.map((t) => (
                      <VStack direction="column">
                        <Heading
                          color={teamMemberNameColor}
                          fontWeight="700"
                          align="center"
                          mb={4}
                        >
                          {t.name}
                        </Heading>
                        <VStack>
                          {React.Children.toArray(
                            t.members.map((m) => (
                              <Flex align="center">
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
                                  <Text
                                    color={teamMemberNameColor}
                                    fontWeight="700"
                                  >
                                    {m.displayName}
                                  </Text>
                                  <Text
                                    color={teamMemberNameColor}
                                    fontWeight="300"
                                  >
                                    {m.role}
                                  </Text>
                                </VStack>
                              </Flex>
                            ))
                          )}
                        </VStack>
                      </VStack>
                    ))
                  )}
                </VStack>
              )}
            </AlertDialogBody>

            <AlertDialogFooter justifyContent="center">
              <Button ref={cancelDialogRef} onClick={onCloseDialog}>
                Nice!
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default ShowMyTeamsFeedback;
