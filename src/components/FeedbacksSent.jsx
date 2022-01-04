import React from "react";
import { useSelector } from "react-redux";
import {
  getDocs,
  query,
  collection,
  where,
  getDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import {
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Input,
  useColorModeValue,
} from "@chakra-ui/react";

import { db } from "../firebase";
import { generateKeywordsArrayForText } from "../utils/helpers";
import FeedbacksSentCard from "./FeedbacksSentCard";

const FeedbacksSent = () => {
  const [feedbacksSent, setFeedbacksSent] = React.useState([]);
  const [filteredFeedbacksSent, setFilteredFeedbacksSent] = React.useState([]);
  const [feedbacksSentWithUserNames, setFeedbacksSentWithUserNames] =
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
            where("answeredBy", "==", currentUser.uid),
            orderBy("createdAt", "desc")
          )
        );

        const results = response.docs.map((doc) => ({
          docId: doc.id,
          ...doc.data(),
        }));
        setFeedbacksSent(results);
        setFilteredFeedbacksSent(results);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [currentUser]);

  React.useEffect(() => {
    if (!feedbacksSent.length) return;

    (async () => {
      try {
        const allFeedbacksSentWithNames = [];

        for (let index = 0; index < feedbacksSent.length; index++) {
          const { requestedOn, ...restOfCurrentFB } = feedbacksSent[index];
          const result = await getDoc(doc(db, "users", requestedOn));
          allFeedbacksSentWithNames.push({
            ...restOfCurrentFB,
            requestedOn,
            requestedOnFull: { docId: result.id, ...result.data() },
          });
        }

        setFeedbacksSentWithUserNames(allFeedbacksSentWithNames);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [feedbacksSent]);

  const handleFilterByUser = async (event) => {
    if (!feedbacksSentWithUserNames.length) return;

    const currentFilterValue = event.target.value.trim().toLowerCase();

    const filtered = feedbacksSentWithUserNames.filter(
      (fs) =>
        Boolean(
          generateKeywordsArrayForText(
            fs.requestedOnFull.displayName?.toLowerCase(),
            false
          )?.includes(currentFilterValue)
        )
    );

    setFilteredFeedbacksSent(filtered);
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

      {filteredFeedbacksSent.map((fb, i) => (
        <FeedbacksSentCard
          key={i}
          feedback={fb}
          isLast={i === filteredFeedbacksSent.length - 1}
        />
      ))}
    </>
  );
};

export default FeedbacksSent;
