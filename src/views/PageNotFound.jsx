import React from "react";
import { Flex } from "@chakra-ui/layout";
import { Lottie } from "@crello/react-lottie";

import animationData from "../assets/lotties/404.json";

const defaultLottieOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const PageNotFound = () => {
  return (
    <Flex alignItems="center" justifyContent="center" flex="1" minH="100vh">
      <Lottie config={defaultLottieOptions} height={400} width={400} />
    </Flex>
  );
};

export default PageNotFound;
