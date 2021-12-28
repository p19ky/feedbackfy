import React from "react";
import { useSelector } from "react-redux";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  FormControl,
  FormLabel,
  Select,
  useColorModeValue,
  Grid,
  GridItem,
} from "@chakra-ui/react";

import { db } from "../firebase";
import FeedbackRequestCard from "./FeedbackRequestCard";
import { ROLES } from "../utils/constants";

const FEEDBACK_REQUESTS_FILTERS = ["All", "Not Answered Yet", "Answered"];

const FeedbackRequests = () => {
  const [myFeedbackRequests, setMyFeedbackRequests] = React.useState([]);
  const [myFilteredFeedbackRequests, setMyFilteredFeedbackRequests] =
    React.useState([]);
  const [currentFilter, setCurrentFilter] = React.useState(
    FEEDBACK_REQUESTS_FILTERS[0]
  );

  const currentUser = useSelector((state) => state.user.value);
  const colorModeForFromLabels = useColorModeValue("gray.700", "gray.50");

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
          // do not insert duplicates
          acc.some((e) => e.docId === cur.docId) ? acc : [...acc, cur],
        []
      );

      setMyFeedbackRequests(tempMyFeedbackRequuests);
    })();
  }, [currentUser]);

  React.useEffect(() => {
    if (!myFeedbackRequests.length || !currentFilter) return;

    const FEEDBACK_REQUESTS_FILTERS_MAP = {
      All: () => myFeedbackRequests,
      "Not Answered Yet": () =>
        myFeedbackRequests.filter((fr) => !fr.completed),
      Answered: () => myFeedbackRequests.filter((fr) => fr.completed),
    };

    setMyFilteredFeedbackRequests(
      FEEDBACK_REQUESTS_FILTERS_MAP[currentFilter]()
    );
  }, [myFeedbackRequests, currentFilter]);

  return (
    <>
      <Grid templateColumns="repeat(6, 1fr)" mb={4}>
        <FormControl
          alignSelf={"flex-end"}
          as={GridItem}
          colStart={5}
          colSpan={2}
        >
          <FormLabel
            htmlFor={"filter"}
            fontSize="sm"
            fontWeight="md"
            color={colorModeForFromLabels}
          >
            Filter Feedback Requests
          </FormLabel>
          <Select
            defaultValue={currentFilter}
            onChange={(e) => setCurrentFilter(e.target.value)}
          >
            {React.Children.toArray(
              FEEDBACK_REQUESTS_FILTERS.map((filter) => (
                <option value={filter}>{filter}</option>
              ))
            )}
          </Select>
        </FormControl>
      </Grid>
      {myFilteredFeedbackRequests.map((fr, i) => (
        <FeedbackRequestCard
          allFeedbackRequests={myFeedbackRequests}
          setAllFeedbackRequests={setMyFeedbackRequests}
          key={i}
          feedbackRequest={fr}
          isLast={i === myFilteredFeedbackRequests.length - 1}
        />
      ))}
    </>
  );
};

export default FeedbackRequests;
