import React from "react";
import { Box, Heading, Text } from "@chakra-ui/layout";
import { collection, getDocs } from "firebase/firestore";

import { db } from "../firebase";

const PegsList = () => {
  const [pegs, setPegs] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      try {
        const response = await getDocs(collection(db, "pegRequests"));
        setPegs(response.docs.map((doc) => ({ docId: doc.id, ...doc.data() })));
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return (
    <Box>
      {React.Children.toArray(
        pegs.map((peg) => (
          <Box>
            <Heading>
              Peg from date{" "}
              {new Date(peg.dateOfPeg.seconds * 1000).toLocaleString()}
            </Heading>
            <Text>Employee: {peg.employeeName}</Text>
            <Text>Project name: {peg.projectName}</Text>
            <Text>Evaluation by: {peg.projectManager}</Text>
            <Text>Status: {peg.status}</Text>
          </Box>
        ))
      )}
    </Box>
  );
};

export default PegsList;
