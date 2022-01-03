import React from "react";
import { useSelector } from "react-redux";
import { collection, onSnapshot, query, where, orderBy } from "@firebase/firestore";

import { db } from "../firebase";
import PegEvaluationCard from "./PegEvaluationCard";
import { ROLES } from "../utils/constants";

const PegEvaluations = () => {
  const [pegEvaluations, setPegEvaluations] = React.useState([]);
  const currentUser = useSelector((state) => state.user.value);

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
            setPegEvaluations(
              querySnapshot.docs.map((doc) => ({
                docId: doc.id,
                ...doc.data(),
              }))
            );
          }
        );
      } catch (error) {
        console.error(error);
      }
    })();

    return unsubscribePegEvaluations;
  }, [currentUser, queriesMap]);

  return (
    <>
      {pegEvaluations.map((pe, i) => (
        <PegEvaluationCard
          key={i}
          pegEvaluation={pe}
          isLast={i === pegEvaluations.length - 1}
        />
      ))}
    </>
  );
};

export default PegEvaluations;
