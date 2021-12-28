import React from "react";
import { useSelector } from "react-redux";
import { getDocs, query, collection, where } from "firebase/firestore";

import { db } from "../firebase";
import FeedbacksSentCard from "./FeedbacksSentCard";

const FeedbacksSent = () => {
  const [feedbacksSent, setFeedbacksSent] = React.useState([]);

  const currentUser = useSelector((state) => state.user.value);

  React.useEffect(() => {
    if (!currentUser) return;

    (async () => {
      try {
        const response = await getDocs(
          query(
            collection(db, "feedbacks"),
            where("answeredBy", "==", currentUser.uid)
          )
        );

        setFeedbacksSent(
          response.docs.map((doc) => ({ docId: doc.id, ...doc.data() }))
        );
      } catch (error) {
        console.log(error);
      }
    })();
  }, [currentUser]);

  return (
    <>
      {feedbacksSent.map((fb, i) => (
        <FeedbacksSentCard
          key={i}
          feedback={fb}
          isLast={i === feedbacksSent.length - 1}
        />
      ))}
    </>
  );
};

export default FeedbacksSent;
