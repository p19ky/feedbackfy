import React from "react";
import { useSelector } from "react-redux";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs";

import PegRequests from "../components/PegRequests";
import PegEvaluations from "../components/PegEvaluations";
import CreatePegRequestButton from "../components/CreatePegRequestButton";

const Pegs = () => {
  const currentUser = useSelector((state) => state.user.value);

  return (
    <Tabs variant="soft-rounded" colorScheme="blue" align="center">
      <TabList>
        <Tab>Peg Requests</Tab>
        <Tab>Peg Evaluations</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          {currentUser.role === "user" && <CreatePegRequestButton />}
          <PegRequests />
        </TabPanel>
        <TabPanel>
          <PegEvaluations />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default Pegs;
