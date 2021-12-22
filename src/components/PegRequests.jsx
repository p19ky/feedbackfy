import React from "react";
import { useSelector } from "react-redux";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { db } from "../firebase";
import PegRequestCard from "./PegRequestCard";
import { ROLES } from "../utils/constants";

const PegRequests = () => {
  const [pegRequests, setPegRequests] = React.useState([]);
  const currentUser = useSelector((state) => state.user.value);

  const queriesMap = React.useMemo(() => ({
    [ROLES.USER]: query(
      collection(db, "pegRequests"),
      where("creatorUid", "==", currentUser.uid)
    ),
    [ROLES.MANAGER]: query(
      collection(db, "pegRequests"),
      where("evaluatorUid", "==", currentUser.uid)
    ),
  }), [currentUser]);

  // Fetch Peg Requests
  React.useEffect(() => {
    if (!currentUser || !queriesMap) return;

    let unsubscribePegRequests = () => {};

    (async () => {
      try {
        // only listen to peg requests that have been created by the current user.
        unsubscribePegRequests = onSnapshot(
          queriesMap[currentUser.role],
          (querySnapshot) => {
            setPegRequests(
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

    return unsubscribePegRequests;
  }, [currentUser, queriesMap]);

  return (
    <>
      {pegRequests.map((pr, i) => (
        <PegRequestCard
          key={i}
          pegRequest={pr}
          isLast={i === pegRequests.length - 1}
        />
      ))}
    </>
  );
};

export default PegRequests;
