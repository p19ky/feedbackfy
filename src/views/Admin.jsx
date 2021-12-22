import React from "react";
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/modal";
import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import { Radio, RadioGroup } from "@chakra-ui/radio";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
} from "@firebase/firestore";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { Button } from "@chakra-ui/button";
import { Center, Flex, VStack } from "@chakra-ui/layout";
import { Skeleton } from "@chakra-ui/skeleton";
import { useToast } from "@chakra-ui/toast";

import { db } from "../firebase";
import { ROLES } from "../utils/constants";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { useSelector } from "react-redux";

const LIMIT_NR_USERS_PER_REQUEST = 2;

const Admin = () => {
  const [users, setUsers] = React.useState([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [hasMoreUsers, setHasMoreUsers] = React.useState(true);
  const currentLastUser = React.useRef(0);

  const [loadingEditRole, setLoadingEditRole] = React.useState(false);
  const [valueEditRole, setValueEditRole] = React.useState(null);
  const [currentlyEditRoleUser, setCurrentlyEditRoleUser] =
    React.useState(null);
  const [isOpenEditRole, setIsOpenEditRole] = React.useState(false);
  const onCloseEditRole = () => {
    setCurrentlyEditRoleUser(null);
    setValueEditRole(null);
    setIsOpenEditRole(false);
  };
  const onOpenEditRole = (user) => {
    setCurrentlyEditRoleUser(user);
    setValueEditRole(user.role);
    setIsOpenEditRole(true);
  };
  const cancelEditRoleRef = React.useRef();

  const currentUser = useSelector((state) => state.user.value);

  const toast = useToast();

  React.useEffect(() => {
    if (!currentUser) return;

    (async () => {
      try {
        console.log("get users");

        setLoadingUsers(true);

        const querySnapshot = await getDocs(
          query(
            collection(db, "users"),
            where("email", "!=", currentUser.email),
            orderBy("email", "desc"),
            limit(LIMIT_NR_USERS_PER_REQUEST)
          )
        );

        if (querySnapshot.size < LIMIT_NR_USERS_PER_REQUEST)
          setHasMoreUsers(false);

        if (querySnapshot.empty || !querySnapshot.docs.length) return;

        currentLastUser.current =
          querySnapshot.docs[querySnapshot.docs.length - 1];

        const tempUsers = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data) {
            tempUsers.push(data);
          }
        });

        setUsers(tempUsers);
      } catch (error) {
        console.log("error getting users", error);
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, [currentUser]);

  const getMoreUsers = async () => {
    if (!hasMoreUsers || !currentUser) return;

    console.log("get more users");

    try {
      setLoadingUsers(true);

      const querySnapshot = await getDocs(
        query(
          collection(db, "users"),
          where("email", "!=", currentUser.email),
          orderBy("email", "desc"),
          startAfter(currentLastUser.current),
          limit(LIMIT_NR_USERS_PER_REQUEST)
        )
      );

      if (querySnapshot.size < LIMIT_NR_USERS_PER_REQUEST)
        setHasMoreUsers(false);

      if (querySnapshot.empty || !querySnapshot.docs.length) return;

      currentLastUser.current =
        querySnapshot.docs[querySnapshot.docs.length - 1];

      const tempUsers = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data) {
          tempUsers.push(data);
        }
      });

      setUsers((current) => [...current, ...tempUsers]);
    } catch (error) {
      console.log("error getting more users", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const [infiniteUsersTableRef, { rootUsersTableRef }] = useInfiniteScroll({
    loading: loadingUsers,
    hasNextPage: hasMoreUsers,
    onLoadMore: getMoreUsers,
    rootMargin: "0px 0px 400px 0px",
  });

  const editRole = async () => {
    if (!currentlyEditRoleUser) return;

    setLoadingEditRole(true);
    try {
      await updateDoc(doc(db, "users", currentlyEditRoleUser.uid), {
        role: valueEditRole,
      });

      const indexCurrentUser = users.findIndex(
        (u) => u.uid === currentlyEditRoleUser.uid
      );

      if (indexCurrentUser >= 0) {
        users[indexCurrentUser].role = valueEditRole;
      }

      onCloseEditRole();
      toast({
        position: "top",
        title: "Succesfully edited role!",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    } catch (error) {
      onCloseEditRole();
      toast({
        position: "top",
        title: "Failed to edit role, please try again.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setLoadingEditRole(false);
    }
  };

  return (
    <Flex
      direction="column"
      w="100%"
      bg={useColorModeValue("white", "gray.700")}
    >
      <Table variant="sm" boxShadow="lg">
        <CustomThead>
          <Tr>
            <Th>
              <Center>User</Center>
            </Th>
            <Th>
              <Center>Role</Center>
            </Th>
            <Th>
              <Center>Action(s)</Center>
            </Th>
          </Tr>
        </CustomThead>
        <Tbody
          display="block"
          overflowY="auto"
          maxH="400px"
          ref={rootUsersTableRef}
        >
          {loadingUsers && !users.length && (
            <>
              <CustomLoadingRow />
              <CustomLoadingRow />
            </>
          )}
          {React.Children.toArray(
            users.map((user) => (
              <CustomBodyTr>
                <Td>
                  <Center>{user.email}</Center>
                </Td>
                <Td>
                  <Center>{user.role}</Center>
                </Td>
                <Td>
                  <Center>
                    <Button onClick={() => onOpenEditRole(user)}>
                      Edit Role
                    </Button>
                  </Center>
                </Td>
              </CustomBodyTr>
            ))
          )}
          <AlertDialog
            isOpen={isOpenEditRole}
            leastDestructiveRef={cancelEditRoleRef}
            onClose={onCloseEditRole}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader
                  fontSize="lg"
                  fontWeight="bold"
                  textAlign="center"
                >
                  {`Edit Role for ${
                    currentlyEditRoleUser?.email?.split("@")[0]
                  }`}
                </AlertDialogHeader>

                <AlertDialogBody>
                  <RadioGroup onChange={setValueEditRole} value={valueEditRole}>
                    <VStack>
                      <VStack alignItems="flex-start">
                        {React.Children.toArray(
                          Object.values(ROLES).map((role) => (
                            <Radio value={role}>{role.toUpperCase()}</Radio>
                          ))
                        )}
                      </VStack>
                    </VStack>
                  </RadioGroup>
                </AlertDialogBody>

                <AlertDialogFooter justifyContent="center">
                  <Button
                    ref={cancelEditRoleRef}
                    onClick={onCloseEditRole}
                    isDisabled={loadingEditRole}
                    isLoading={loadingEditRole}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={editRole}
                    ml={3}
                    isDisabled={loadingEditRole}
                    isLoading={loadingEditRole}
                  >
                    Save Role
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
          {hasMoreUsers && <CustomLoadingRow ref={infiniteUsersTableRef} />}
        </Tbody>
      </Table>
    </Flex>
  );
};

const CustomLoadingRow = React.forwardRef((props, ref) => (
  <CustomBodyTr ref={ref}>
    {Array(3)
      .fill(0)
      .map((_, i) => (
        <Td key={i}>
          <Center>
            <Skeleton
              startColor="teal.50"
              endColor="green.900"
              height="20px"
              width="100%"
            />
          </Center>
        </Td>
      ))}
  </CustomBodyTr>
));

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

export default Admin;
