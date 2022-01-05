import React from "react";
import { useSelector } from "react-redux";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";
import {
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Input,
  useColorModeValue,
} from "@chakra-ui/react";

import { db } from "../firebase";
import PegRequestCard from "./PegRequestCard";
import { ROLES } from "../utils/constants";
import { generateKeywordsArrayForText } from "../utils/helpers";
import CreatePegRequestButton from "./CreatePegRequestButton";

const PegRequests = () => {
  const [pegRequests, setPegRequests] = React.useState([]);
  const [filteredPegRequests, setFilteredPegRequests] = React.useState([]);
  const [pegRequestsWithMoreDetails, setPegRequestsWithMoreDetails] =
    React.useState([]);

  const currentUser = useSelector((state) => state.user.value);
  const colorModeForFromLabels = useColorModeValue("gray.700", "gray.50");

  const queriesMap = React.useMemo(
    () => ({
      [ROLES.USER]: query(
        collection(db, "pegRequests"),
        where("creatorUid", "==", currentUser.uid),
        orderBy("dateOfPeg", "desc")
      ),
      [ROLES.MANAGER]: query(
        collection(db, "pegRequests"),
        where("evaluatorUid", "==", currentUser.uid),
        orderBy("dateOfPeg", "desc")
      ),
    }),
    [currentUser]
  );

  // Fetch Peg Requests
  React.useEffect(() => {
    if (!currentUser || !queriesMap) return;

    let unsubscribePegRequests = () => {};

    (async () => {
      try {
        // only listen to peg requests that have been created by the current user. (USER)
        // only listen to peg requests that need to be evaluated by the current user. (MANAGER)
        unsubscribePegRequests = onSnapshot(
          queriesMap[currentUser.role],
          (querySnapshot) => {
            const results = querySnapshot.docs.map((doc) => ({
              docId: doc.id,
              ...doc.data(),
            }));

            // after orderBy createdAt, we need to also order by evaluated (first all that are false).
            results.sort((x, y) =>
              x.evaluated > y.evaluated ? 1 : x.evaluated < y.evaluated ? -1 : 0
            );

            setPegRequests(results);
            setFilteredPegRequests(results);
          }
        );
      } catch (error) {
        console.error(error);
      }
    })();

    return unsubscribePegRequests;
  }, [currentUser, queriesMap]);

  // Fetch Peg Requests with more details
  React.useEffect(() => {
    if (!pegRequests.length || !currentUser) return;

    (async () => {
      try {
        const fetchBasedOnCurrentUserRoleMap = {
          [ROLES.USER]: async () => {
            const allPegRequestsWithMoreInfo = [];

            for (let index = 0; index < pegRequests.length; index++) {
              const { evaluatorUid, ...restOfCurrentPR } = pegRequests[index];
              const result = await getDoc(doc(db, "users", evaluatorUid));
              allPegRequestsWithMoreInfo.push({
                ...restOfCurrentPR,
                evaluatorUid,
                evaluatorFull: { docId: result.id, ...result.data() },
              });
            }

            setPegRequestsWithMoreDetails(allPegRequestsWithMoreInfo);
            return allPegRequestsWithMoreInfo;
          },
          [ROLES.MANAGER]: async () => {
            const allPegRequestsWithMoreInfo = [];

            for (let index = 0; index < pegRequests.length; index++) {
              const { creatorUid, ...restOfCurrentPR } = pegRequests[index];
              const result = await getDoc(doc(db, "users", creatorUid));
              allPegRequestsWithMoreInfo.push({
                ...restOfCurrentPR,
                creatorUid,
                creatorFull: { docId: result.id, ...result.data() },
              });
            }

            setPegRequestsWithMoreDetails(allPegRequestsWithMoreInfo);
            return allPegRequestsWithMoreInfo;
          },
        };

        // console.log(await fetchBasedOnCurrentUserRoleMap[currentUser.role]());
        fetchBasedOnCurrentUserRoleMap[currentUser.role]();
      } catch (error) {
        console.error(error);
      }
    })();
  }, [pegRequests, currentUser]);

  const handleFilterByUser = async (event) => {
    if (!pegRequestsWithMoreDetails.length) return;

    const currentFilterValue = event.target.value.trim().toLowerCase();

    const mapDisplayName = {
      [ROLES.USER]: (pr) => pr.evaluatorFull.displayName?.toLowerCase(),
      [ROLES.MANAGER]: (pr) => pr.creatorFull.displayName?.toLowerCase(),
    };

    const filtered = pegRequestsWithMoreDetails.filter((pr) =>
      Boolean(
        generateKeywordsArrayForText(
          mapDisplayName[currentUser.role](pr),
          false
        )?.includes(currentFilterValue)
      )
    );

    setFilteredPegRequests(filtered);
  };

  return (
    <>
      <Grid templateColumns="repeat(8, 1fr)" mb={4} alignItems={"flex-end"}>
        <FormControl
          as={GridItem}
          colStart={1}
          colSpan={{
            base: 8, // 0-30em
            sm: 6, // 30em-48em
            md: 4, // 48em-62em
            lg: 2, // 62em+
          }}
          mb={{ base: 4, sm: 0 }}
        >
          <FormLabel
            htmlFor={"user filter"}
            fontSize="sm"
            fontWeight="md"
            color={colorModeForFromLabels}
          >
            Filter by user
          </FormLabel>
          <Input
            variant="filled"
            placeholder="Type user name..."
            onChange={handleFilterByUser}
          />
        </FormControl>
        {currentUser.role === "user" && (
          <GridItem colStart={8} justifySelf={"flex-end"}>
            <CreatePegRequestButton />
          </GridItem>
        )}
      </Grid>

      {filteredPegRequests.map((pr, i) => (
        <PegRequestCard
          key={i}
          pegRequest={pr}
          isLast={i === filteredPegRequests.length - 1}
        />
      ))}
    </>
  );
};

export default PegRequests;
