import { Box, Heading } from "@chakra-ui/layout";
import React from "react";

const PageNotFound = () => {
  return (
    <Box
      d="flex"
      alignItems="center"
      justifyContent="center"
      flex="1"
      minH="100vh"
    >
      <Heading>PAGE NOT FOUND 🤔</Heading>
    </Box>
  );
};

export default PageNotFound;
