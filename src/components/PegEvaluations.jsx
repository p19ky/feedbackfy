import React from "react";
import { collection, getDocs } from "@firebase/firestore";

import { db } from "../firebase";
import PegEvaluationCard from "./PegEvaluationCard";

const PegEvaluations = () => {
  const [pegEvaluations, setPegEvaluations] = React.useState([]);

  // Fetch Peg Evaluations
  React.useEffect(() => {
    (async () => {
      try {
        const response = await getDocs(collection(db, "pegEvaluations"));
        setPegEvaluations(
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
        pegEvaluations.map((pe) => <PegEvaluationCard pegEvaluation={pe} />)
      )}
    </>
  );
};

export default PegEvaluations;
