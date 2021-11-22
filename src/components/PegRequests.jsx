import React from "react";
import { Box } from "@chakra-ui/layout";
import { collection, getDocs } from "firebase/firestore";

import { db } from "../firebase";
import PegRequestCard from "./PegRequestCard";

const PegRequests = () => {
  const [pegRequests, setPegRequests] = React.useState([]);

  // Fetch Peg Requests
  React.useEffect(() => {
    (async () => {
      try {
        const response = await getDocs(collection(db, "pegRequests"));
        setPegRequests(
          response.docs.map((doc) => ({ docId: doc.id, ...doc.data() }))
        );
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return (
    <>
      {React.Children.toArray(
        pegRequests.map((pr) => <PegRequestCard pr={pr} />)
      )}
    </>
  );
};

export default PegRequests;
