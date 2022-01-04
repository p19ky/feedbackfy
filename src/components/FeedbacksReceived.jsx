import React from "react";
import { useSelector } from "react-redux";
import {
  getDocs,
  query,
  collection,
  where,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase";
import FeedbacksReceivedCard from "./FeedbacksReceivedCard";
import {
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Input,
  useColorModeValue,
} from "@chakra-ui/react";
import { generateKeywordsArrayForText } from "../utils/helpers";

const FeedbacksReceived = () => {
  const [feedbacksReceived, setFeedbacksReceived] = React.useState([]);
  const [filteredFeedbacksReceived, setFilteredFeedbacksReceived] =
    React.useState([]);
  const [feedbacksReceivedWithUserNames, setFeedbacksReceivedWithUserNames] =
    React.useState([]);

  const currentUser = useSelector((state) => state.user.value);
  const colorModeForFromLabels = useColorModeValue("gray.700", "gray.50");

  React.useEffect(() => {
    if (!currentUser) return;

    (async () => {
      try {
        const response = await getDocs(
          query(
            collection(db, "feedbacks"),
            where("requestedOn", "==", currentUser.uid),
            orderBy("createdAt", "desc")
          )
        );

        const results = response.docs.map((doc) => ({
          docId: doc.id,
          ...doc.data(),
        }));

        setFeedbacksReceived(results);
        setFilteredFeedbacksReceived(results);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [currentUser]);

  React.useEffect(() => {
    if (!feedbacksReceived.length) return;

    (async () => {
      try {
        const allFeedbacksReceivedWithNames = [];

        for (let index = 0; index < feedbacksReceived.length; index++) {
          const { answeredBy, ...restOfCurrentFB } = feedbacksReceived[index];
          const result = await getDoc(doc(db, "users", answeredBy));
          allFeedbacksReceivedWithNames.push({
            ...restOfCurrentFB,
            answeredBy,
            answeredByFull: restOfCurrentFB.anonym
              ? { docId: result.id, ...result.data(), displayName: "Anonymous Feedbacker" }
              : { docId: result.id, ...result.data() },
          });
        }

        setFeedbacksReceivedWithUserNames(allFeedbacksReceivedWithNames);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [feedbacksReceived]);

  const handleFilterByUser = async (event) => {
    if (!feedbacksReceivedWithUserNames.length) return;

    const currentFilterValue = event.target.value.trim().toLowerCase();

    const filtered = feedbacksReceivedWithUserNames.filter(
      (fs) =>
        Boolean(
          generateKeywordsArrayForText(
            fs.answeredByFull.displayName?.toLowerCase(),
            false
          )?.includes(currentFilterValue)
        )
    );

    setFilteredFeedbacksReceived(filtered);
  };

  return (
    <>
      <Grid templateColumns="repeat(8, 1fr)" mb={4} alignItems={"center"}>
        <FormControl as={GridItem} colStart={1} colSpan={{base: 8, sm: 6, md: 4, lg: 2}}>
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
      </Grid>

      {filteredFeedbacksReceived.map((fb, i) => (
        <FeedbacksReceivedCard
          key={i}
          feedback={fb}
          isLast={i === filteredFeedbacksReceived.length - 1}
        />
      ))}
    </>
  );
};

export default FeedbacksReceived;
