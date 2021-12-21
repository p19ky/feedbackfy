import React from "react";
import { useSelector } from "react-redux";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";
import PegRequestCard from "./PegRequestCard";

const PegRequests = () => {
  const [pegRequests, setPegRequests] = React.useState([]);
  const currentUser = useSelector((state) => state.user.value);

  // Fetch Peg Requests
  React.useEffect(() => {
    let unsubscribePegRequests = () => {};

    (async () => {
      try {
        // only get peg requests that have been created by the current user.
        // const response = await getDocs(query(collection(db, "pegRequests"), where("creatorUid", "==", currentUser.uid)));
        // setPegRequests(
        //   response.docs.map((doc) => ({ docId: doc.id, ...doc.data() }))
        // );

        unsubscribePegRequests = onSnapshot(
          query(
            collection(db, "pegRequests"),
            where("creatorUid", "==", currentUser.uid)
          ),
          (querySnapshot) => {
            setPegRequests(
              querySnapshot.docs.map((doc) => ({ docId: doc.id, ...doc.data() }))
            );
          }
        );
      } catch (error) {
        console.error(error);
      }
    })();

    return unsubscribePegRequests;
  }, [currentUser]);

  return (
    <>
      {React.Children.toArray(
        pegRequests.map((pr) => <PegRequestCard pegRequest={pr} />)
      )}
    </>
  );
};

export default PegRequests;
