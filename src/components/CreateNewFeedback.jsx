import React from "react";
import { Button, useDisclosure } from "@chakra-ui/react";
import { collection, getDocs, query, where } from "firebase/firestore";

import SendFeedbackModal from "./SendFeedbackModal";
import { db } from "../firebase";

const CreateNewFeedback = ({ myTeams, setOfAllTeamMembers }) => {
  const [selectableProjects, setSelectableProjects] = React.useState([]);

  // get all projects which have as a team one of 'myTeams'
  // result will be a array with objects of the form { docId: project's id, ...project's data, team: myTeams Object }
  React.useEffect(() => {
    if (!myTeams?.length) return;

    (async () => {
      const allTeamsUids = myTeams.map((team) => team.docId);

      const resultDocs = [];
      for (let index = 0; index < allTeamsUids.length; index++) {
        const teamUid = allTeamsUids[index];
        const result = await getDocs(
          query(collection(db, "projects"), where("teamUid", "==", teamUid))
        );
        resultDocs.push(...result.docs);
      }

      const allProjectsFromResults = Array.from(
        new Set(
          resultDocs.reduce((acc, doc) => {
            acc = [
              {
                docId: doc.id,
                ...doc.data(),
                team: myTeams.find((t) => t.docId === doc.data().teamUid),
              },
              ...acc,
            ];
            return acc;
          }, [])
        )
      );

      setSelectableProjects(allProjectsFromResults);
    })();
  }, [myTeams]);

  const {
    isOpen: isOpenSendFeedbackModal,
    onOpen: onOpenSendFeedbackModal,
    onClose: onCloseSendFeedbackModal,
  } = useDisclosure();

  return (
    <>
      <Button onClick={onOpenSendFeedbackModal}>Send New Feedback</Button>
      <SendFeedbackModal
        isOpen={isOpenSendFeedbackModal}
        onClose={onCloseSendFeedbackModal}
        isInNewFeedbackContext
        selectableProjectsForCurrentUser={selectableProjects}
        setOfAllTeamMembers={setOfAllTeamMembers}
      />
    </>
  );
};

export default CreateNewFeedback;
