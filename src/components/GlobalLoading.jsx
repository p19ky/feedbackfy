import React from "react";
import { Box } from "@chakra-ui/layout";
import { Lottie } from "@crello/react-lottie";

import animationData from "../assets/lotties/working.json";

const defaultLottieOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const GlobalLoading = () => {
  return (
    <Box
      d="flex"
      alignItems="center"
      justifyContent="center"
      flex="1"
      minH="100vh"
    >
      <Lottie config={defaultLottieOptions} height={300} width={300} />
    </Box>
  );
};

export default GlobalLoading;
