import React from "react";
import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "@firebase/firestore";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { Button } from "@chakra-ui/button";
import { Center, Flex } from "@chakra-ui/layout";
import { Skeleton } from "@chakra-ui/skeleton";

import { db } from "../firebase";

const LIMIT_NR_USERS_PER_REQUEST = 2;

const Admin = () => {
  const [users, setUsers] = React.useState([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [hasMoreUsers, setHasMoreUsers] = React.useState(true);
  const currentLastUser = React.useRef(0);

  React.useEffect(() => {
    (async () => {
      try {
        console.log("get users");

        setLoadingUsers(true);

        const querySnapshot = await getDocs(
          query(
            collection(db, "users"),
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
  }, []);

  const getMoreUsers = async () => {
    if (!hasMoreUsers) return;

    console.log("get more users");

    try {
      setLoadingUsers(true);

      const querySnapshot = await getDocs(
        query(
          collection(db, "users"),
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

  return (
    <Flex direction="column" w="100%">
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
          {users.map((user, index) => (
            <CustomBodyTr key={index}>
              <Td>
                <Center>{user.email}</Center>
              </Td>
              <Td>
                <Center>{user.role}</Center>
              </Td>
              <Td>
                <Center>
                  <Button>Edit Role</Button>
                </Center>
              </Td>
            </CustomBodyTr>
          ))}
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
