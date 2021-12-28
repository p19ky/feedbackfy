import React from "react";
import { useSelector } from "react-redux";
import { getDocs, query, collection, where } from "firebase/firestore";

import { db } from "../firebase";
import FeedbacksReceivedCard from "./FeedbacksReceivedCard";

const FeedbacksReceived = () => {
  const [feedbacksReceived, setFeedbacksReceived] = React.useState([]);

  const currentUser = useSelector((state) => state.user.value);

  React.useEffect(() => {
    if (!currentUser) return;

    (async () => {
      try {
        const response = await getDocs(
          query(
            collection(db, "feedbacks"),
            where("requestedOn", "==", currentUser.uid)
          )
        );

        setFeedbacksReceived(
          response.docs.map((doc) => ({ docId: doc.id, ...doc.data() }))
        );
      } catch (error) {
        console.log(error);
      }
    })();
  }, [currentUser]);

  return (
    <>
      {feedbacksReceived.map((fb, i) => (
        <FeedbacksReceivedCard
          key={i}
          feedback={fb}
          isLast={i === feedbacksReceived.length - 1}
        />
      ))}
    </>
  );
};

export default FeedbacksReceived;
