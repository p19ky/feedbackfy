import React from "react";
import { useSelector } from "react-redux";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "@firebase/firestore";
import { HStack } from "@chakra-ui/layout";

import { db } from "../firebase";
import CreateFeedbackRequestButton from "../components/CreateFeedbackRequestButton";
import FeedbacksSent from "../components/FeedbacksSent";
import FeedbacksReceived from "../components/FeedbacksReceived";
import ShowMyTeamsFeedback from "../components/ShowMyTeamsFeedback";
import FeedbackRequests from "../components/FeedbackRequests";

const Feedbacks = () => {
  const currentUser = useSelector((state) => state.user.value);
  const [myTeams, setMyTeams] = React.useState([]);
  const [myTeamsWithDetails, setMyTeamsWithDetails] = React.useState([]);

  // Get all the teams that the current user belongs to
  React.useEffect(() => {
    if (!currentUser) return;

    (async () => {
      try {
        const q = query(
          collection(db, "teams"),
          where("members", "array-contains", currentUser.uid)
        );

        const response = await getDocs(q);

        if (response.empty) {
          setMyTeams([]);
        } else {
          const teams = response.docs.map((doc) => ({
            docId: doc.id,
            ...doc.data(),
          }));
          setMyTeams(teams);
        }
      } catch (error) {
        console.error("Could not get teams for current user", error);
      }
    })();
  }, [currentUser]);

  // Get all the details about every team member of the teams
  React.useEffect(() => {
    if (!currentUser || !myTeams.length) return;

    (async () => {
      const tempMyTeamsWithDetails = [];

      for (let i = 0; i < myTeams.length; i++) {
        const team = myTeams[i];

        const membersArray = [];
        for (let j = 0; j < team.members.length; j++) {
          const memberUid = team.members[j];
          const response = await getDoc(doc(db, "users", memberUid));

          membersArray.push(response.data());
        }

        tempMyTeamsWithDetails.push({ docId: team.docId, name: team.name, members: membersArray });
      }

      setMyTeamsWithDetails(tempMyTeamsWithDetails);
    })();
  }, [currentUser, myTeams]);

  return (
    <>
      <HStack mb={8} align="center" justify="center">
        <CreateFeedbackRequestButton myTeams={myTeamsWithDetails} />
        <ShowMyTeamsFeedback myTeams={myTeamsWithDetails} />
      </HStack>

      <Tabs variant="soft-rounded" colorScheme="blue" align="center">
        <TabList>
          <Tab>Feedback requests</Tab>
          <Tab>Feedbacks sent</Tab>
          <Tab>Feedbacks received</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <FeedbackRequests />
          </TabPanel>
          <TabPanel>
            <FeedbacksSent />
          </TabPanel>
          <TabPanel>
            <FeedbacksReceived />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default Feedbacks;
