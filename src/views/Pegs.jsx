import React from "react";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs";

import PegRequests from "../components/PegRequests";
import PegEvaluations from "../components/PegEvaluations";

const Pegs = () => {
  return (
    <Tabs variant="soft-rounded" colorScheme="blue" align="center">
      <TabList>
        <Tab>Peg Requests</Tab>
        <Tab>Peg Evaluations</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
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
