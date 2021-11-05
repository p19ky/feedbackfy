import { Box } from "@chakra-ui/layout";
import React from "react";

const GlobalLoading = () => {
  return (
    <Box
      d="flex"
      alignItems="center"
      justifyContent="center"
      flex="1"
      minH="100vh"
    >
      Loading...
    </Box>
  );
};

export default GlobalLoading;
