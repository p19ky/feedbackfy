import React from "react";
import { useSelector } from "react-redux";
import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "../firebase";
import FeedbackRequestCard from "./FeedbackRequestCard";
import { ROLES } from "../utils/constants";

const FeedbackRequests = () => {
  const [myFeedbackRequests, setMyFeedbackRequests] = React.useState([]);

  const currentUser = useSelector((state) => state.user.value);

  // get all the feedback requests that need to be answered by current user. (USER)
  React.useEffect(() => {
    if (!currentUser || currentUser.role !== ROLES.USER) return;

    (async () => {
      const feedbackRequestsResponse = await getDocs(
        query(
          collection(db, "feedbackRequests"),
          where("answeredBy", "==", currentUser.uid)
        )
      );

      setMyFeedbackRequests(
        feedbackRequestsResponse.docs.map((d) => ({ docId: d.id, ...d.data() }))
      );
    })();
  }, [currentUser]);

  // get all the feedback requests that were created by current user. (MANAGER)
  React.useEffect(() => {
    if (!currentUser || currentUser.role !== ROLES.MANAGER) return;

    (async () => {
      const feedbackRequestsCreatedByResponse = await getDocs(
        query(
          collection(db, "feedbackRequests"),
          where("createdBy", "==", currentUser.uid)
        )
      );

      const feedbackRequestsAnsweredByResponse = await getDocs(
        query(
          collection(db, "feedbackRequests"),
          where("answeredBy", "==", currentUser.uid)
        )
      );

      const feedbackRequestsCreatedBy =
        feedbackRequestsCreatedByResponse.docs.map((d) => ({
          docId: d.id,
          ...d.data(),
        }));
      const feedbackRequestsAnsweredBy =
        feedbackRequestsAnsweredByResponse.docs.map((d) => ({
          docId: d.id,
          ...d.data(),
        }));

      const tempMyFeedbackRequuests = [
        ...feedbackRequestsCreatedBy,
        ...feedbackRequestsAnsweredBy,
      ].reduce(
        (acc, cur) =>
          acc.some((e) => e.docId === cur.docId) ? acc : [...acc, cur],
        []
      );

      setMyFeedbackRequests(tempMyFeedbackRequuests);
    })();
  }, [currentUser]);

  return myFeedbackRequests.map((fr, i) => (
    <FeedbackRequestCard
      key={i}
      feedbackRequest={fr}
      isLast={i === myFeedbackRequests.length - 1}
    />
  ));
};

export default FeedbackRequests;
