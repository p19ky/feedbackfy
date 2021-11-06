import { Flex } from "@chakra-ui/layout";
import React from "react";
import Navbar from "./Navbar";

const LayoutWithNavbar = ({ children }) => {
  return (
    <Flex h="100vh" p={4}>
      <Navbar />
      <Flex ml={2} boxShadow="lg" borderRadius="md" p={2} w="100%">
        {children}
      </Flex>
    </Flex>
  );
};

export default LayoutWithNavbar;
