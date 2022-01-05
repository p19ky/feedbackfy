import React from "react";
import { useSelector } from "react-redux";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  FormControl,
  FormLabel,
  Select,
  useColorModeValue,
  Grid,
  GridItem,
  Input,
} from "@chakra-ui/react";

import { db } from "../firebase";
import FeedbackRequestCard from "./FeedbackRequestCard";
import { generateKeywordsArrayForText } from "../utils/helpers";

const FEEDBACK_REQUESTS_FILTERS = ["All", "Not Answered Yet", "Answered"];

const FeedbackRequests = ({ shouldRefetchFeedbackRequests }) => {
  const [myFeedbackRequests, setMyFeedbackRequests] = React.useState([]);
  const [myFilteredFeedbackRequests, setMyFilteredFeedbackRequests] =
    React.useState([]);
  const [currentFilter, setCurrentFilter] = React.useState(
    FEEDBACK_REQUESTS_FILTERS[0]
  );

  const currentUser = useSelector((state) => state.user.value);
  const colorModeForFromLabels = useColorModeValue("gray.700", "gray.50");

  const fetchFeedbackRequests = React.useCallback(async () => {
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

    const tempMyFeedbackRequests = [
      ...feedbackRequestsCreatedBy,
      ...feedbackRequestsAnsweredBy,
    ].reduce(
      (acc, cur) =>
        // do not insert duplicates
        acc.some((e) => e.docId === cur.docId) ? acc : [...acc, cur],
      []
    );

    for (let index = 0; index < tempMyFeedbackRequests.length; index++) {
      const element = tempMyFeedbackRequests[index];

      const answeredByFullResponse = await getDoc(
        doc(db, "users", element.answeredBy)
      );
      const requestedOnFullResponse = await getDoc(
        doc(db, "users", element.requestedOn)
      );

      tempMyFeedbackRequests[index] = {
        ...tempMyFeedbackRequests[index],
        answeredByFull: answeredByFullResponse.data(),
        requestedOnFull: requestedOnFullResponse.data(),
      };
    }

    // order by createdAt first
    tempMyFeedbackRequests.sort(
      (x, y) => y.createdAt.seconds - x.createdAt.seconds
    );

    // after orderBy createdAt, we need to also order by completed (first all that are false).
    tempMyFeedbackRequests.sort((x, y) =>
      x.completed > y.completed ? 1 : x.completed < y.completed ? -1 : 0
    );
    setMyFeedbackRequests(tempMyFeedbackRequests);
  }, [currentUser]);

  // get all the feedback requests that were created by or need answer by current user.
  React.useEffect(() => {
    if (!currentUser) return;

    fetchFeedbackRequests();
  }, [currentUser, fetchFeedbackRequests]);

  React.useEffect(() => {
    if (!currentUser || !shouldRefetchFeedbackRequests) return;

    fetchFeedbackRequests();
  }, [currentUser, shouldRefetchFeedbackRequests, fetchFeedbackRequests]);

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

  const handleFilterByUser = (event) => {
    const currentFilterValue = event.target.value.trim().toLowerCase();

    const filtered = myFeedbackRequests.filter(
      (fr) =>
        Boolean(
          generateKeywordsArrayForText(
            fr.answeredByFull.displayName?.toLowerCase(),
            false
          )?.includes(currentFilterValue)
        ) ||
        Boolean(
          generateKeywordsArrayForText(
            fr.requestedOnFull.displayName?.toLowerCase(),
            false
          )?.includes(currentFilterValue)
        )
    );

    setMyFilteredFeedbackRequests(filtered);
  };

  return (
    <>
      <Grid templateColumns="repeat(6, 1fr)" mb={4} alignItems={"center"}>
        <FormControl as={GridItem} colStart={1} colSpan={2}>
          <FormLabel
            htmlFor={"user filter"}
            fontSize="sm"
            fontWeight="md"
            color={colorModeForFromLabels}
          >
            Filter by user
          </FormLabel>
          <Input
            variant="filled"
            placeholder="Type user name..."
            onChange={handleFilterByUser}
          />
        </FormControl>

        <FormControl
          alignSelf={"flex-end"}
          as={GridItem}
          colStart={5}
          colSpan={2}
        >
          <FormLabel
            htmlFor={"status filter"}
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
