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
} from "@firebase/firestore";

import { db } from "../firebase";
import PegEvaluationCard from "./PegEvaluationCard";
import { ROLES } from "../utils/constants";
import { FormControl, FormLabel, Grid, GridItem, Input, useColorModeValue } from "@chakra-ui/react";
import { generateKeywordsArrayForText } from "../utils/helpers";

const PegEvaluations = () => {
  const [pegEvaluations, setPegEvaluations] = React.useState([]);
  const [filteredPegEvaluations, setFilteredPegEvaluations] = React.useState(
    []
  );
  const [pegEvaluationsWithMoreDetails, setPegEvaluationsWithMoreDetails] =
    React.useState([]);

  const currentUser = useSelector((state) => state.user.value);
  const colorModeForFromLabels = useColorModeValue("gray.700", "gray.50");

  const queriesMap = React.useMemo(
    () => ({
      [ROLES.USER]: query(
        collection(db, "pegEvaluations"),
        where("requestedBy", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      ),
      [ROLES.MANAGER]: query(
        collection(db, "pegEvaluations"),
        where("evaluatedBy", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      ),
    }),
    [currentUser]
  );

  // Fetch Peg Evaluations
  React.useEffect(() => {
    if (!currentUser || !queriesMap) return;

    let unsubscribePegEvaluations = () => {};

    (async () => {
      try {
        // only listen to peg evaluations that have been requested/evaluated by the current user.
        unsubscribePegEvaluations = onSnapshot(
          queriesMap[currentUser.role],
          (querySnapshot) => {
            const results = querySnapshot.docs.map((doc) => ({
              docId: doc.id,
              ...doc.data(),
            }));

            setPegEvaluations(results);
            setFilteredPegEvaluations(results);
          }
        );
      } catch (error) {
        console.error(error);
      }
    })();

    return unsubscribePegEvaluations;
  }, [currentUser, queriesMap]);

  // Fetch Peg Evaluations with more details
  React.useEffect(() => {
    if (!pegEvaluations.length || !currentUser) return;

    (async () => {
      try {
        const fetchBasedOnCurrentUserRoleMap = {
          [ROLES.USER]: async () => {
            const allPegEvaluationsWithMoreInfo = [];

            for (let index = 0; index < pegEvaluations.length; index++) {
              const { evaluatedBy, ...restOfCurrentPE } = pegEvaluations[index];
              const result = await getDoc(doc(db, "users", evaluatedBy));
              allPegEvaluationsWithMoreInfo.push({
                ...restOfCurrentPE,
                evaluatedBy,
                evaluatedByFull: { docId: result.id, ...result.data() },
              });
            }

            setPegEvaluationsWithMoreDetails(allPegEvaluationsWithMoreInfo);
            return allPegEvaluationsWithMoreInfo;
          },
          [ROLES.MANAGER]: async () => {
            const allPegEvaluationsWithMoreInfo = [];

            for (let index = 0; index < pegEvaluations.length; index++) {
              const { requestedBy, ...restOfCurrentPE } = pegEvaluations[index];
              const result = await getDoc(doc(db, "users", requestedBy));
              allPegEvaluationsWithMoreInfo.push({
                ...restOfCurrentPE,
                requestedBy,
                requestedByFull: { docId: result.id, ...result.data() },
              });
            }

            setPegEvaluationsWithMoreDetails(allPegEvaluationsWithMoreInfo);
            return allPegEvaluationsWithMoreInfo;
          },
        };

        // console.log(await fetchBasedOnCurrentUserRoleMap[currentUser.role]());
        fetchBasedOnCurrentUserRoleMap[currentUser.role]();
      } catch (error) {
        console.error(error);
      }
    })();
  }, [pegEvaluations, currentUser]);

  const handleFilterByUser = async (event) => {
    if (!pegEvaluationsWithMoreDetails.length) return;

    const currentFilterValue = event.target.value.trim().toLowerCase();

    const mapDisplayName = {
      [ROLES.USER]: (pe) => pe.evaluatedByFull.displayName?.toLowerCase(),
      [ROLES.MANAGER]: (pe) => pe.requestedByFull.displayName?.toLowerCase(),
    };

    const filtered = pegEvaluationsWithMoreDetails.filter((pe) =>
      Boolean(
        generateKeywordsArrayForText(
          mapDisplayName[currentUser.role](pe),
          false
        )?.includes(currentFilterValue)
      )
    );

    setFilteredPegEvaluations(filtered);
  };

  return (
    <>
      <Grid templateColumns="repeat(8, 1fr)" mb={4} alignItems={"center"}>
        <FormControl as={GridItem} colStart={1} colSpan={{base: 8, sm: 6, md: 4, lg: 2}}>
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
      </Grid>

      {filteredPegEvaluations.map((pe, i) => (
        <PegEvaluationCard
          key={i}
          pegEvaluation={pe}
          isLast={i === filteredPegEvaluations.length - 1}
        />
      ))}
    </>
  );
};

export default PegEvaluations;
